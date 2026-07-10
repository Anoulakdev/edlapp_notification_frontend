"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { io, Socket } from "socket.io-client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { TopicSelector } from "./TopicSelector";
import { ConversationList } from "./ConversationList";
import { ChatArea } from "./ChatArea";
import { Topic, Conversation, Message } from "./types";

export function ChatManagement() {
  // Navigation & selection states
  const [isMounted, setIsMounted] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Search & input states
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [selectedImgFile, setSelectedImgFile] = useState<File | null>(null);
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);

  // Loading states
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Refs for scroll and websockets
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const prevFirstMessageIdRef = useRef<number | string | undefined>(undefined);
  const prevConversationIdRef = useRef<number | string | undefined>(undefined);

  const rawBackendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4500";
  const backendUrl = typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? `${window.location.origin}/backend`
    : rawBackendUrl;

  // 0. Load persisted topic and conversation on mount
  useEffect(() => {
    const savedTopic = localStorage.getItem("chat_selected_topic");
    const savedConversation = localStorage.getItem("chat_selected_conversation");

    Promise.resolve().then(() => {
      if (savedTopic) {
        try {
          const topic = JSON.parse(savedTopic);
          setSelectedTopic(topic);
          if (savedConversation) {
            const conv = JSON.parse(savedConversation);
            if (conv.topicId === topic.id) {
              setSelectedConversation(conv);
            }
          }
        } catch (e) {
          console.error("Failed to restore chat state from localStorage:", e);
        }
      }
      setIsMounted(true);
    });
  }, []);

  // Persist selected topic to localStorage
  useEffect(() => {
    if (!isMounted) return;
    if (selectedTopic) {
      localStorage.setItem("chat_selected_topic", JSON.stringify(selectedTopic));
    } else {
      localStorage.removeItem("chat_selected_topic");
      localStorage.removeItem("chat_selected_conversation");
    }
  }, [selectedTopic, isMounted]);

  // Persist selected conversation to localStorage
  useEffect(() => {
    if (!isMounted) return;
    if (selectedConversation) {
      localStorage.setItem("chat_selected_conversation", JSON.stringify(selectedConversation));
    } else {
      localStorage.removeItem("chat_selected_conversation");
    }
  }, [selectedConversation, isMounted]);

  // Reusable silent refreshTopics method
  const refreshTopics = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/topics/selecttopic");
      setTopics(response.data || []);
    } catch (error) {
      console.error("Failed to refresh topics:", error);
    }
  }, []);

  // 1. Fetch active topics on mount
  useEffect(() => {
    Promise.resolve().then(() => {
      setLoadingTopics(true);
      axiosInstance.get("/topics/selecttopic")
        .then((response) => {
          setTopics(response.data || []);
        })
        .catch((error) => {
          console.error("Failed to fetch topics:", error);
        })
        .finally(() => {
          setLoadingTopics(false);
        });
    });
  }, []);

  // Fetch current logged-in user on mount
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await axiosInstance.get("/auth/me");
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchMe();
  }, []);

  // Reusable fetchConversations method
  const fetchConversations = useCallback(async (showLoading = false) => {
    if (!selectedTopic) return;
    if (showLoading) setLoadingConversations(true);
    try {
      const response = await axiosInstance.get(`/conversations/topic/${selectedTopic.id}`);
      setConversations(response.data || []);
    } catch (error) {
      console.error("Failed to fetch conversations by topic:", error);
    } finally {
      if (showLoading) setLoadingConversations(false);
    }
  }, [selectedTopic]);

  // 2. Fetch conversations when topic is selected, or silently refresh topics when deselected
  useEffect(() => {
    if (!selectedTopic) {
      setConversations([]);
      setSelectedConversation(null);
      refreshTopics();
      return;
    }
    fetchConversations(true);
  }, [selectedTopic, fetchConversations, refreshTopics]);

  const selectedConversationRef = useRef<Conversation | null>(null);
  const selectedTopicRef = useRef<Topic | null>(null);
  const prevTopicIdRef = useRef<number | null>(null);
  const fetchConversationsRef = useRef<any>(null);
  const refreshTopicsRef = useRef<any>(null);

  // Keep track of references for WebSocket listeners
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    selectedTopicRef.current = selectedTopic;
  }, [selectedTopic]);

  useEffect(() => {
    fetchConversationsRef.current = fetchConversations;
  }, [fetchConversations]);

  useEffect(() => {
    refreshTopicsRef.current = refreshTopics;
  }, [refreshTopics]);

  // 3. Socket Connection & Event Handling (Connected once on mount)
  useEffect(() => {
    const socketUrl = typeof window !== "undefined" && window.location.hostname !== "localhost"
      ? window.location.origin
      : rawBackendUrl;

    const socket = io(`${socketUrl}/conversation`, {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("WebSocket connected successfully:", socket.id);
      // Re-join topic room on reconnection if topic is selected
      if (selectedTopicRef.current) {
        socket.emit("joinRoom", { topicId: selectedTopicRef.current.id });
      }
    });

    socket.on("topicUnreadCountUpdate", (data: { topicId: number; unreadCount: number }) => {
      setTopics((prev) =>
        prev.map((t) =>
          t.id === data.topicId ? { ...t, unreadCount: data.unreadCount } : t
        )
      );
    });

    socket.on("newMessage", (message: Message) => {
      // If we are on the topic selector screen, refresh the topic list in real time!
      if (!selectedTopicRef.current) {
        if (refreshTopicsRef.current) {
          refreshTopicsRef.current();
        }
        return;
      }

      const currentActive = selectedConversationRef.current;

      // Find matching conversation in list
      setConversations((prev) => {
        const matchedIndex = prev.findIndex((c) => c.id === message.conversationId);

        // If not in sidebar list, it could be a new client chatting. Refetch sidebar!
        if (matchedIndex === -1) {
          if (fetchConversationsRef.current) {
            fetchConversationsRef.current(false);
          }
          return prev;
        }

        const updated = [...prev];
        const conv = updated[matchedIndex];

        let preview = message.content || "";
        if (message.mType === "image") preview = "[ຮູບພາບ]";
        else if (message.mType === "audio") preview = "[ຟາຍສຽງ]";
        else if (message.mType === "location") preview = "[ຕຳແໜ່ງ]";

        const isFromClient = message.senderType === "edlapp";
        const isActiveRoom = currentActive && currentActive.id === message.conversationId;

        updated[matchedIndex] = {
          ...conv,
          lastMessage: preview,
          lastMessageAt: message.createdAt,
          unreadAgentCount: isFromClient && !isActiveRoom ? conv.unreadAgentCount + 1 : conv.unreadAgentCount,
        };

        return updated.sort(
          (a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
        );
      });

      // Append message if it is for the currently selected conversation
      if (currentActive && message.conversationId === currentActive.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [message, ...prev];
        });

        if (message.senderType === "edlapp") {
          axiosInstance.get(
            `/conversations/callget?externalUserId=${currentActive.externalUserId}&topicId=${currentActive.topicId}&page=1&limit=1`
          ).catch((e) => console.error("Error setting messages to read", e));
        }
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [backendUrl]);

  // 4. Join WebSocket topic room on topic selection
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // Leave the previous topic room if any
    if (prevTopicIdRef.current !== null) {
      socket.emit("leaveRoom", { topicId: prevTopicIdRef.current });
      console.log(`Left topic room topic_${prevTopicIdRef.current}`);
    }

    if (selectedTopic) {
      // Join the new topic room
      socket.emit("joinRoom", { topicId: selectedTopic.id });
      console.log(`Joined topic room topic_${selectedTopic.id}`);
      prevTopicIdRef.current = selectedTopic.id;
    } else {
      prevTopicIdRef.current = null;
    }
  }, [selectedTopic]);

  // 4.1 Clear unread count locally when selected conversation changes
  useEffect(() => {
    if (selectedConversation) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id ? { ...c, unreadAgentCount: 0 } : c
        )
      );
    }
  }, [selectedConversation]);

  // 5. Fetch messages when conversation selection changes
  useEffect(() => {
    if (!selectedConversation || !selectedTopic) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoadingMessages(true);
      setPage(1);
      setHasMore(true);
      try {
        const response = await axiosInstance.get(
          `/conversations/callget?externalUserId=${selectedConversation.externalUserId}&topicId=${selectedTopic.id}&page=1&limit=15`
        );
        const data = response.data || [];
        setMessages(data);
        if (data.length < 15) {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedConversation, selectedTopic]);

  // 6. Fetch more messages on scroll (Pagination)
  const fetchMoreMessages = async () => {
    if (loadingMore || !hasMore || !selectedConversation || !selectedTopic) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const response = await axiosInstance.get(
        `/conversations/callget?externalUserId=${selectedConversation.externalUserId}&topicId=${selectedTopic.id}&page=${nextPage}&limit=15`
      );
      const data = response.data || [];
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setMessages((prev) => {
          const merged = [...prev, ...data];
          const seen = new Set();
          return merged.filter((m) => {
            if (seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
          });
        });
        setPage(nextPage);
        if (data.length < 15) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Failed to load older messages:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Scroll anchoring & management helper
  useEffect(() => {
    if (!selectedConversation) {
      prevFirstMessageIdRef.current = undefined;
      prevConversationIdRef.current = undefined;
      return;
    }

    const currentFirstId = messages[0]?.id;
    const isNewConversation = prevConversationIdRef.current !== selectedConversation.id;

    if (isNewConversation) {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "instant" });
      }
      prevConversationIdRef.current = selectedConversation.id;
      prevFirstMessageIdRef.current = currentFirstId;
    } else {
      const isNewMessage = currentFirstId !== prevFirstMessageIdRef.current;
      if (isNewMessage && currentFirstId !== undefined) {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }
      prevFirstMessageIdRef.current = currentFirstId;
    }
  }, [messages, selectedConversation]);

  // Handle Scroll to load more
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isCloseToTop = target.scrollHeight - Math.abs(target.scrollTop) <= target.clientHeight + 50;
    if (isCloseToTop && hasMore && !loadingMore && !loadingMessages) {
      fetchMoreMessages();
    }
  };

  // 7. Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || (!inputText.trim() && !selectedImgFile && !selectedAudioFile)) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append("externalUserId", String(selectedConversation.externalUserId));
      formData.append("topicId", String(selectedConversation.topicId));
      if (inputText.trim()) {
        formData.append("content", inputText.trim());
      }
      if (selectedImgFile) {
        formData.append("fileImg", selectedImgFile);
      }
      if (selectedAudioFile) {
        formData.append("fileAudio", selectedAudioFile);
      }

      await axiosInstance.post("/conversations/callcreate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setInputText("");
      setSelectedImgFile(null);
      setSelectedAudioFile(null);
      setImgPreview(null);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  // Image Selection Handler
  const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImgFile(file);
      setSelectedAudioFile(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Audio Selection Handler
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedAudioFile(file);
      setSelectedImgFile(null);
      setImgPreview(null);
    }
  };

  const handleVoiceRecordComplete = (file: File) => {
    setSelectedAudioFile(file);
    setSelectedImgFile(null);
    setImgPreview(null);
  };

  const handleClearAttachments = () => {
    setSelectedImgFile(null);
    setSelectedAudioFile(null);
    setImgPreview(null);
  };

  const handleEditMessage = async (messageId: number, newContent: string) => {
    try {
      await axiosInstance.put(`/conversations/${messageId}`, { content: newContent });
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, content: newContent } : m))
      );
    } catch (error) {
      console.error("Failed to edit message:", error);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await axiosInstance.delete(`/conversations/${messageId}`);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleSendLocation = async (lat: number, lng: number) => {
    if (!selectedConversation) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("externalUserId", String(selectedConversation.externalUserId));
      formData.append("topicId", String(selectedConversation.topicId));
      formData.append("lat", String(lat));
      formData.append("lng", String(lng));

      await axiosInstance.post("/conversations/callcreate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      console.error("Failed to send location message:", error);
    } finally {
      setSending(false);
    }
  };

  // Filter conversations based on query
  const filteredConversations = conversations.filter((c) => {
    const name = c.externalUser?.name?.toLowerCase() || "";
    const phone = c.externalUser?.tel || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || phone.includes(query);
  });

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!selectedTopic) {
    return (
      <TopicSelector
        topics={topics}
        loadingTopics={loadingTopics}
        onSelectTopic={setSelectedTopic}
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950">
      {/* Upper bar */}
      <div className={`items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm shrink-0 ${selectedConversation ? "hidden md:flex" : "flex"
        }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedTopic(null)}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              {selectedTopic.name}
            </h2>
          </div>
        </div>
      </div>

      {/* Main content viewport */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Left Side: Conversations list */}
        <ConversationList
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          loadingConversations={loadingConversations}
          filteredConversations={filteredConversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
        />

        {/* Right Side: Chat box */}
        <ChatArea
          selectedConversation={selectedConversation}
          messages={messages}
          loadingMessages={loadingMessages}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onScroll={handleScroll}
          chatContainerRef={chatContainerRef}
          messagesEndRef={messagesEndRef}
          inputText={inputText}
          onInputTextChange={setInputText}
          selectedImgFile={selectedImgFile}
          selectedAudioFile={selectedAudioFile}
          imgPreview={imgPreview}
          onImgChange={handleImgChange}
          onAudioChange={handleAudioChange}
          onVoiceRecordComplete={handleVoiceRecordComplete}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
          onSendLocation={handleSendLocation}
          onClearAttachments={handleClearAttachments}
          onSubmitMessage={handleSendMessage}
          sending={sending}
          backendUrl={backendUrl}
          onBack={() => setSelectedConversation(null)}
          currentUserId={currentUser?.id}
        />
      </div>
    </div>
  );
}
