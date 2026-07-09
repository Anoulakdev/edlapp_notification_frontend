import React from "react";
import { Phone, Loader2, Image as ImageIcon, Mic, Square, X, Send, MessageSquare, ArrowLeft, Volume2, ChevronDown, MapPin, Trash2 } from "lucide-react";
import moment from "moment";
import { Conversation, Message } from "./types";
import { LocationPickerModal } from "./LocationPickerModal";

if (typeof window !== "undefined") {
  console.assert = () => {};
}

interface ChatAreaProps {
  selectedConversation: Conversation | null;
  messages: Message[];
  loadingMessages: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  inputText: string;
  onInputTextChange: (val: string) => void;
  selectedImgFile: File | null;
  selectedAudioFile: File | null;
  imgPreview: string | null;
  onImgChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAudioChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVoiceRecordComplete?: (file: File) => void;
  onEditMessage?: (messageId: number, newContent: string) => Promise<void>;
  onDeleteMessage?: (messageId: number) => Promise<void>;
  onSendLocation?: (lat: number, lng: number) => Promise<void>;
  onClearAttachments: () => void;
  onSubmitMessage: (e: React.FormEvent) => void;
  sending: boolean;
  backendUrl: string;
  onBack?: () => void;
  currentUserId?: number;
}

export function ChatArea({
  selectedConversation,
  messages,
  loadingMessages,
  loadingMore,
  onScroll,
  chatContainerRef,
  messagesEndRef,
  inputText,
  onInputTextChange,
  selectedImgFile,
  selectedAudioFile,
  imgPreview,
  onImgChange,
  onAudioChange,
  onVoiceRecordComplete,
  onEditMessage,
  onDeleteMessage,
  onSendLocation,
  onClearAttachments,
  onSubmitMessage,
  sending,
  backendUrl,
  onBack,
  currentUserId,
}: ChatAreaProps) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingSeconds, setRecordingSeconds] = React.useState(0);
  const mediaRecorderRef = React.useRef<any>(null);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<any>(null);

  const [activeMenuId, setActiveMenuId] = React.useState<number | null>(null);
  const [editingMessageId, setEditingMessageId] = React.useState<number | null>(null);
  const [editingText, setEditingText] = React.useState("");
  const [isLocationModalOpen, setIsLocationModalOpen] = React.useState(false);
  const [previewImageUrl, setPreviewImageUrl] = React.useState<string | null>(null);
  const [deletingMessageId, setDeletingMessageId] = React.useState<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const formatDuration = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatSeparatorDate = (dateStr: string | Date) => {
    const mDate = moment(dateStr);
    const today = moment().startOf("day");
    const yesterday = moment().subtract(1, "days").startOf("day");

    if (mDate.isSame(today, "day")) {
      return "ມື້ນີ້";
    } else if (mDate.isSame(yesterday, "day")) {
      return "ມື້ວານນີ້";
    } else {
      return mDate.format("DD/MM/YYYY");
    }
  };

  const startRecording = async () => {
    try {
      console.log("startRecording: Requesting microphone permission...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("startRecording: Microphone access granted successfully");
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      // Dynamically import opus-media-recorder to avoid Next.js SSR issues
      console.log("startRecording: Importing opus-media-recorder dynamically...");
      // @ts-ignore
      const OpusMediaRecorder = (await import("opus-media-recorder")).default;
      console.log("startRecording: opus-media-recorder loaded successfully");

      const workerOptions = {
        OggOpusEncoderWasmPath: "/OggOpusEncoder.wasm",
        WebMOpusEncoderWasmPath: "/WebMOpusEncoder.wasm",
        encoderWorkerFactory: () => new Worker("/encoderWorker.umd.js"),
      };
      console.log("startRecording: Using worker options with encoderWorkerFactory");

      console.log("startRecording: Initializing OpusMediaRecorder instance...");
      const mediaRecorder = new OpusMediaRecorder(
        stream,
        { mimeType: "audio/ogg" },
        workerOptions
      );
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event: any) => {
        console.log("ondataavailable: Chunk received. Size:", event.data ? event.data.size : 0);
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event: any) => {
        console.error("mediaRecorder error occurred:", event.error ? event.error.message : "unknown");
      };

      mediaRecorder.onstop = () => {
        console.log("mediaRecorder.onstop: Recording stopped. Processing chunks...");
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }

        console.log("mediaRecorder.onstop: Total chunks count:", audioChunksRef.current.length);
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/ogg" });
        console.log("mediaRecorder.onstop: Created Blob of size:", audioBlob.size, "type:", audioBlob.type);
        const audioFile = new File(
          [audioBlob],
          `voice-${moment().format("YYYYMMDD-HHmmss")}.opus`,
          { type: "audio/ogg" }
        );
        console.log("mediaRecorder.onstop: Created File:", audioFile.name, "size:", audioFile.size);

        if (onVoiceRecordComplete) {
          console.log("mediaRecorder.onstop: Triggering onVoiceRecordComplete...");
          onVoiceRecordComplete(audioFile);
        }
      };

      console.log("startRecording: Calling mediaRecorder.start()...");
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error("Failed to start recording error:", err ? err.message : "unknown");
      alert("Please allow microphone access to record voice messages.");
    }
  };

  const stopRecording = () => {
    console.log("stopRecording: Stopping recording. Recorder state:", mediaRecorderRef.current ? mediaRecorderRef.current.state : "null");
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = () => {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
      };
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    audioChunksRef.current = [];
  };

  if (!selectedConversation) {
    return (
      <div className="hidden md:flex flex-1 flex-col justify-center items-center p-8 text-center select-none bg-slate-50 dark:bg-slate-900/60">
        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full shadow-sm mb-4 text-blue-500 animate-bounce">
          <MessageSquare className="w-12 h-12" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          ເລືອກຜູ້ສົນທະນາເພື່ອເລີ່ມແຊັດ
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 max-w-xs leading-relaxed">
          ເລືອກລາຍຊື່ຜູ້ສົນທະນາຈາກແຖບດ້ານຊ້າຍ ເພື່ອເບິ່ງປະຫວັດການສົນທະນາ ແລະ ຕອບກັບ
        </p>
      </div>
    );
  }

  const userInitials = selectedConversation.externalUser?.name?.substring(0, 2) || "EX";

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 h-full min-w-0">
      {/* Active User Header */}
      <div className="px-4 md:px-6 py-2.5 md:py-3 border-b border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 md:hidden hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
            {userInitials}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {selectedConversation.externalUser?.name || "ລູກຄ້າ"}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
              <Phone className="w-3 h-3 text-blue-500" />
              {selectedConversation.externalUser?.tel}
            </p>
          </div>
        </div>
      </div>

      {/* Message List Wall */}
      <div
        ref={chatContainerRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col-reverse gap-4 min-h-0 bg-[#f0f4f9] dark:bg-slate-950"
      >
        <div ref={messagesEndRef} />

        {loadingMessages ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isAgent = msg.senderType === "callcenter";
              const timeStr = moment(msg.createdAt).format("HH:mm");

              const currentDate = moment(msg.createdAt).startOf("day");
              const nextMessage = messages[index + 1];
              const showDateSeparator = !nextMessage || !moment(nextMessage.createdAt).isSame(currentDate, "day");

              return (
                <React.Fragment key={msg.id}>
                  <div
                    className={`flex ${isAgent ? "justify-end" : "justify-start"} animate-fade-in`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm relative ${isAgent
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-tr-none"
                        : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-800/80"
                        } group`}
                    >
                      {/* Arrow dropdown trigger on hover - only visible on own messages */}
                      {isAgent && msg.agentId === currentUserId && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(activeMenuId === msg.id ? null : msg.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-all absolute right-2 top-2 p-1 rounded-full shadow-sm z-20 bg-blue-600/80 text-blue-100 hover:text-white"
                          title="Actions"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      )}

                      {/* Dropdown Options */}
                      {activeMenuId === msg.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40 cursor-default"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                            }}
                          />
                          <div
                            className={`absolute z-50 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg py-1 min-w-[100px] text-xs font-semibold text-slate-700 dark:text-slate-200 ${isAgent ? "right-2 top-8" : "left-2 top-8"
                              }`}
                          >
                            {msg.content && !msg.fileImg && !msg.fileAudio && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                  setEditingMessageId(msg.id);
                                  setEditingText(msg.content || "");
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                              >
                                ແກ້ໄຂ
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                setDeletingMessageId(msg.id);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 transition-colors"
                            >
                              ລົບ
                            </button>
                          </div>
                        </>
                      )}

                      {/* Sender Name */}
                      {!isAgent && (
                        <span className="block text-[10px] font-extrabold text-blue-600 dark:text-blue-400 mb-1 select-none pr-5">
                          {msg.edlappUser?.name || "ລູກຄ້າ"}
                        </span>
                      )}
                      {isAgent && (
                        <span className="block text-[10px] font-bold text-blue-100/80 mb-1 text-right select-none pr-5">
                          {msg.agentUser?.employee
                            ? `${msg.agentUser.employee.first_name} ${msg.agentUser.employee.last_name}`
                            : "ເຈົ້າໜ້າທີ່"}
                        </span>
                      )}

                      {/* Content Text / Editor */}
                      {msg.content && (
                        editingMessageId === msg.id ? (
                          <div className="flex flex-col gap-2 min-w-[200px] py-1">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className={`w-full p-2 text-sm border rounded-xl focus:outline-none focus:ring-1 ${isAgent
                                ? "bg-blue-600 border-blue-400 text-white focus:ring-white"
                                : "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-850 dark:text-slate-100 focus:ring-blue-500"
                                }`}
                              rows={2}
                              autoFocus
                            />
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingMessageId(null)}
                                className={`px-2 py-1 text-xs rounded-lg transition-colors ${isAgent ? "hover:bg-blue-700 text-blue-100" : "hover:bg-slate-100 text-slate-500"
                                  }`}
                              >
                                ຍົກເລີກ
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (editingText.trim() && onEditMessage) {
                                    onEditMessage(msg.id, editingText.trim());
                                    setEditingMessageId(null);
                                  }
                                }}
                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${isAgent ? "bg-white text-blue-600 hover:bg-blue-50" : "bg-blue-500 text-white hover:bg-blue-600"
                                  }`}
                              >
                                ແກ້ໄຂ
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words pr-5">
                            {msg.content}
                          </p>
                        )
                      )}

                      {/* Image Attachment */}
                      {msg.fileImg && (
                        <div
                          onClick={() => setPreviewImageUrl(`${backendUrl}/upload/conversation/${msg.fileImg}`)}
                          className="mt-1.5 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800/50 max-w-sm shadow-sm bg-slate-50 dark:bg-slate-950 cursor-zoom-in group/img"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`${backendUrl}/upload/conversation/${msg.fileImg}`}
                            alt="Image Attachment"
                            className="w-full h-auto object-cover max-h-[300px] transition-all duration-350 group-hover/img:scale-[1.02]"
                          />
                        </div>
                      )}

                      {/* Audio Attachment */}
                      {msg.fileAudio && (
                        <div className="mt-1.5 min-w-[220px] rounded-xl bg-slate-50/50 dark:bg-slate-880/50 p-1.5 border border-slate-100/50 dark:border-slate-800/20">
                          <audio
                            src={`${backendUrl}/upload/conversation/${msg.fileAudio}`}
                            controls
                            className="w-full h-8"
                          />
                        </div>
                      )}

                      {/* Location Message */}
                      {msg.mType === "location" && msg.lat && msg.lng && (
                        <div className="mt-1.5 flex flex-col gap-2 min-w-[220px]">
                          <div className="w-full h-[140px] rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800/80 bg-slate-100 dark:bg-slate-900 relative">
                            <iframe
                              title="Location Map"
                              width="100%"
                              height="100%"
                              frameBorder="0"
                              style={{ border: 0 }}
                              src={`https://maps.google.com/maps?q=${msg.lat},${msg.lng}&z=15&output=embed&iwloc=near`}
                              allowFullScreen
                            />
                          </div>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${msg.lat},${msg.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl border transition-all ${isAgent
                              ? "bg-white text-blue-600 border-white hover:bg-blue-50"
                              : "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30 hover:bg-blue-100"
                              }`}
                          >
                            <MapPin className="w-4 h-4" />
                            <span>ເບິ່ງແຜນທີ່ Google Maps</span>
                          </a>
                        </div>
                      )}

                      {/* Message footer status & time */}
                      <div className="flex items-center justify-end gap-1 mt-1.5 select-none shrink-0 font-medium">
                        <span
                          className={`text-[9px] ${isAgent ? "text-blue-100/75" : "text-slate-400 dark:text-slate-500"
                            }`}
                        >
                          {timeStr}
                        </span>
                        {isAgent && (
                          <span className="text-[9px] text-blue-200 font-bold">
                            {msg.status === "seen" ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {showDateSeparator && (
                    <div className="flex justify-center my-2 select-none">
                      <span className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-500 dark:text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800/60 shadow-sm">
                        {formatSeparatorDate(msg.createdAt)}
                      </span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {loadingMore && (
              <div className="flex justify-center items-center py-4 text-slate-500 dark:text-slate-400 gap-2 shrink-0 select-none animate-fade-in">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-xs font-bold">ກຳລັງໂຫຼດຂໍ້ຄວາມເກົ່າ...</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 md:p-4 border-t border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 shrink-0">
        {/* Preview Attachment Panel */}
        {(selectedImgFile || selectedAudioFile) && (
          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl mb-3 flex items-center justify-between border border-slate-100 dark:border-slate-800/80 animate-fade-in select-none">
            <div className="flex items-center gap-3">
              {imgPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imgPreview}
                  alt="preview"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200/50 dark:border-slate-700"
                />
              ) : (
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Volume2 className="w-5 h-5" />
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[200px]">
                  {selectedImgFile?.name || selectedAudioFile?.name}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {selectedImgFile ? "ຮູບພາບ" : "ຟາຍສຽງ"}
                </p>
              </div>
            </div>
            <button
              onClick={onClearAttachments}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form controls */}
        <form onSubmit={onSubmitMessage} className="flex items-center gap-2">
          <div className="flex gap-0.5 shrink-0">
            {/* Image Trigger */}
            {!isRecording && (
              <label className="p-2 md:p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full cursor-pointer transition-all">
                <ImageIcon className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImgChange}
                  className="hidden"
                />
              </label>
            )}

            {/* Map Pin Trigger */}
            {!isRecording && (
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="p-2 md:p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full transition-all shrink-0 flex items-center justify-center"
                title="Send Location"
              >
                <MapPin className="w-5 h-5" />
              </button>
            )}

            {/* Audio Recorder Trigger */}
            {isRecording ? (
              <button
                type="button"
                onClick={stopRecording}
                className="p-2 md:p-2.5 bg-red-50 text-red-500 hover:text-red-600 rounded-full transition-all shrink-0 flex items-center justify-center animate-pulse"
                title="Stop Recording"
              >
                <Square className="w-5 h-5 fill-red-500" />
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className="p-2 md:p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full transition-all shrink-0 flex items-center justify-center"
                title="Record Voice"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>

          {isRecording ? (
            <div className="flex-1 flex items-center justify-between bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-full px-5 py-2">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-bold text-red-600 dark:text-red-400 font-mono select-none">
                  Recording {formatDuration(recordingSeconds)}
                </span>
              </div>
              <button
                type="button"
                onClick={cancelRecording}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <input
              type="text"
              placeholder="ຂຽນຂໍ້ຄວາມ..."
              value={inputText}
              onChange={(e) => onInputTextChange(e.target.value)}
              className="flex-1 px-3 md:px-5 py-2 md:py-2.5 text-sm bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-700/80 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-800 dark:text-slate-100"
            />
          )}

          <button
            type="submit"
            disabled={isRecording || sending || (!inputText.trim() && !selectedImgFile && !selectedAudioFile)}
            className="p-2 md:p-2.5 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 rounded-full transition-all shadow-sm shrink-0 flex items-center justify-center"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>

      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={(lat, lng) => {
          setIsLocationModalOpen(false);
          if (onSendLocation) {
            onSendLocation(lat, lng);
          }
        }}
      />

      {/* Full-Screen Image Lightbox Preview */}
      {previewImageUrl && (
        <div
          onClick={() => setPreviewImageUrl(null)}
          className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in select-none"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewImageUrl(null);
            }}
            className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[1000] shadow-md border border-white/10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Main Image */}
          <div className="relative max-w-full max-h-[90vh] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImageUrl}
              alt="Preview Fullscreen"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Beautiful Delete Message Confirmation Modal */}
      {deletingMessageId !== null && (
        <div
          onClick={() => setDeletingMessageId(null)}
          className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center gap-5 animate-scale-in"
          >
            {/* Soft Red Trash Icon Circle */}
            <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-2xl">
              <Trash2 className="w-8 h-8" />
            </div>

            {/* Confirmation Texts */}
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-150">
                ທ່ານຕ້ອງການລົບຂໍ້ຄວາມນີ້ແທ້ບໍ?
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed px-2">
                ຫຼັງຈາກລົບແລ້ວ ຈະບໍ່ສາມາດກູ້ຄືນຂໍ້ຄວາມນີ້ໄດ້.
              </p>
            </div>

            {/* Confirmation buttons */}
            <div className="flex items-center gap-3 w-full mt-2">
              <button
                type="button"
                onClick={() => setDeletingMessageId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                ຍົກເລີກ
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteMessage) {
                    onDeleteMessage(deletingMessageId);
                  }
                  setDeletingMessageId(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-650 text-sm font-bold text-white transition-colors shadow-sm"
              >
                ຢືນຢັນລົບ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
