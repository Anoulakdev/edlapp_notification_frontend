"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axiosInstance, { rawBackendUrl } from "@/lib/axiosInstance";
import { io, Socket } from "socket.io-client";
import { ChatHistoryList } from "./ChatHistoryList";
import { ChatHistoryArea } from "./ChatHistoryArea";
import { Topic, Conversation, Message } from "./types";
import { toast } from "react-toastify";

export function ChatHistoryManagement() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<number | "all">("all");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");



  // Loading States
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Pagination States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const backendUrl =
    typeof window !== "undefined" && window.location.hostname !== "localhost"
      ? `${window.location.origin}/backend`
      : rawBackendUrl;

  // 1. Load topics on mount
  const fetchTopics = useCallback(async () => {
    try {
      setLoadingTopics(true);
      const res = await axiosInstance.get("/topics/selecttopic");
      setTopics(res.data || []);
    } catch (err) {
      console.error("Failed to load topics:", err);
    } finally {
      setLoadingTopics(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  // 2. Fetch conversations across all topics or for specific topic
  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      if (selectedTopicId !== "all") {
        const res = await axiosInstance.get(
          `/conversations/topic/${selectedTopicId}?isHistory=true`
        );
        const data: Conversation[] = res.data || [];
        const topicObj = topics.find((t) => t.id === selectedTopicId);
        setConversations(
          data.map((c) => ({
            ...c,
            topic: topicObj || c.topic,
          }))
        );
      } else {
        // Fetch for all topics and aggregate
        if (topics.length === 0) {
          setConversations([]);
          return;
        }
        const requests = topics.map((t) =>
          axiosInstance
            .get(`/conversations/topic/${t.id}?isHistory=true`)
            .then((res) =>
              (res.data || []).map((c: Conversation) => ({
                ...c,
                topic: t,
              }))
            )
            .catch(() => [])
        );
        const results = await Promise.all(requests);
        const allConvs = results.flat();
        // Sort by lastMessageAt descending
        allConvs.sort(
          (a, b) =>
            new Date(b.lastMessageAt || b.createdAt).getTime() -
            new Date(a.lastMessageAt || a.createdAt).getTime()
        );
        setConversations(allConvs);
      }
    } catch (err) {
      console.error("Failed to fetch conversation history:", err);
      toast.error("ບໍ່ສາມາດໂຫຼດປະຫວັດການສົນທະນາໄດ້");
    } finally {
      setLoadingConversations(false);
    }
  }, [selectedTopicId, topics]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 3. Filter conversations based on search query and date range
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      // Search text match (Name, Phone number, or last message)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = conv.externalUser?.name?.toLowerCase().includes(q);
        const telMatch = conv.externalUser?.tel?.toLowerCase().includes(q);
        const msgMatch = conv.lastMessage?.toLowerCase().includes(q);
        if (!nameMatch && !telMatch && !msgMatch) return false;
      }

      // Date Range match on lastMessageAt or createdAt
      const dateToCheck = conv.lastMessageAt || conv.createdAt;
      if (startDate && dateToCheck) {
        if (new Date(dateToCheck) < new Date(`${startDate}T00:00:00`)) {
          return false;
        }
      }
      if (endDate && dateToCheck) {
        if (new Date(dateToCheck) > new Date(`${endDate}T23:59:59`)) {
          return false;
        }
      }

      return true;
    });
  }, [conversations, searchQuery, startDate, endDate]);

  // 4. Fetch messages for selected conversation
  const fetchMessages = useCallback(
    async (pageNum = 1, append = false) => {
      if (!selectedConversation) return;
      if (pageNum === 1) {
        setLoadingMessages(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const res = await axiosInstance.get(
          `/conversations/callget?externalUserId=${selectedConversation.externalUserId}&topicId=${selectedConversation.topicId}&page=${pageNum}&limit=15&isHistory=true`
        );
        const data: Message[] = res.data || [];

        if (append) {
          setMessages((prev) => [...prev, ...data]);
        } else {
          setMessages(data);
        }

        if (data.length < 15) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        setPage(pageNum);
      } catch (err) {
        console.error("Failed to load message history:", err);
      } finally {
        setLoadingMessages(false);
        setLoadingMore(false);
      }
    },
    [selectedConversation]
  );

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(1, false);
    } else {
      setMessages([]);
    }
  }, [selectedConversation, fetchMessages]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchMessages(page + 1, true);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans">
      <ChatHistoryList
        topics={topics}
        selectedTopicId={selectedTopicId}
        onSelectTopicId={setSelectedTopicId}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        loadingConversations={loadingConversations}
        filteredConversations={filteredConversations}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
        onRefresh={fetchConversations}
      />

      <ChatHistoryArea
        selectedConversation={selectedConversation}
        messages={messages}
        loadingMessages={loadingMessages}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        chatContainerRef={chatContainerRef}
        messagesEndRef={messagesEndRef}
        backendUrl={backendUrl}
        onBack={() => setSelectedConversation(null)}
      />
    </div>
  );
}
