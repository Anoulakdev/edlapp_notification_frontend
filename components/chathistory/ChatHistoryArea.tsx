"use client";

import React from "react";
import {
  ArrowLeft,
  Loader2,
  Phone,
  Image as ImageIcon,
  Mic,
  MapPin,
  Star,
  MessageSquare,
  Search,
  ChevronDown,
  X,
  Send,
  Calendar,
} from "lucide-react";
import moment from "moment";
import { Conversation, Message, AgentRating } from "./types";
import axiosInstance from "@/lib/axiosInstance";

interface ChatHistoryAreaProps {
  selectedConversation: Conversation | null;
  messages: Message[];
  loadingMessages: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  backendUrl: string;
  onBack?: () => void;
}

export function ChatHistoryArea({
  selectedConversation,
  messages,
  loadingMessages,
  loadingMore,
  hasMore,
  onLoadMore,
  chatContainerRef,
  messagesEndRef,
  backendUrl,
  onBack,
}: ChatHistoryAreaProps) {
  const [previewImageUrl, setPreviewImageUrl] = React.useState<string | null>(
    null
  );
  const [agentRatings, setAgentRatings] = React.useState<AgentRating[]>([]);

  React.useEffect(() => {
    if (!selectedConversation?.id) {
      setAgentRatings([]);
      return;
    }
    const fetchRating = async () => {
      try {
        const res = await axiosInstance.get(
          `/conversations/rating/${selectedConversation.id}`
        );
        const data = Array.isArray(res.data)
          ? res.data
          : res.data
          ? [res.data]
          : [];
        setAgentRatings(data);
      } catch (err) {
        setAgentRatings([]);
      }
    };
    fetchRating();
  }, [selectedConversation?.id]);

  const prevConvIdRef = React.useRef<number | undefined>(undefined);
  const scrollHeightBeforeLoadRef = React.useRef<number>(0);
  const isFetchingMoreRef = React.useRef<boolean>(false);

  // Auto-scroll to bottom (latest message) when switching conversation & messages finish loading
  React.useEffect(() => {
    if (!selectedConversation || loadingMessages || messages.length === 0) return;

    const isNewConv = prevConvIdRef.current !== selectedConversation.id;
    if (isNewConv) {
      prevConvIdRef.current = selectedConversation.id;
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "instant" });
        }
      }, 50);
    }
  }, [selectedConversation, messages, loadingMessages, messagesEndRef]);

  const handleLoadMore = () => {
    if (chatContainerRef.current) {
      scrollHeightBeforeLoadRef.current = chatContainerRef.current.scrollHeight;
      isFetchingMoreRef.current = true;
    }
    onLoadMore();
  };

  React.useLayoutEffect(() => {
    if (isFetchingMoreRef.current && chatContainerRef.current) {
      const newScrollHeight = chatContainerRef.current.scrollHeight;
      const heightDifference = newScrollHeight - scrollHeightBeforeLoadRef.current;
      chatContainerRef.current.scrollTop += heightDifference;
      isFetchingMoreRef.current = false;
    }
  }, [messages]);

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

  if (!selectedConversation) {
    return (
      <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-900/30 text-center select-none">
        <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mb-4">
          <MessageSquare className="w-12 h-12 text-blue-500/80" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">
          ເລືອກຫ້ອງສົນທະນາ
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">
          ກະລຸນາເລືອກລາຍຊື່ລູກຄ້າຢູ່ດ້ານຊ້າຍ ເພື່ອເບິ່ງປະຫວັດການສົນທະນາ ແລະ ຂໍ້ຄວາມຍ້ອນຫຼັງ
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/30 dark:bg-slate-950 relative overflow-hidden">
      {/* Top Header */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 shadow-xs z-10">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* User Avatar */}
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center shrink-0 shadow-sm text-sm">
            {selectedConversation.externalUser?.name?.substring(0, 2).toUpperCase() || "EX"}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {selectedConversation.externalUser?.name || "ບໍ່ມີຊື່"}
              </h3>
              {selectedConversation.topic && (
                <span className="text-[10px] px-2 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold rounded-full shrink-0">
                  {selectedConversation.topic.name}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{selectedConversation.externalUser?.tel || "-"}</span>
            </p>
          </div>
        </div>


      </div>

      {/* Messages Scroll Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-0"
      >
        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center my-2">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-4 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-xs hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all flex items-center gap-1.5"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  <span>ກຳລັງໂຫຼດຂໍ້ຄວາມເກົ່າ...</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                  <span>ໂຫຼດຂໍ້ຄວາມເກົ່າເພີ່ມຕື່ມ</span>
                </>
              )}
            </button>
          </div>
        )}

        {loadingMessages ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : messages.length > 0 ? (
          // Messages rendered in chronological order (oldest at top, newest at bottom)
          (() => {
            const chronological = [...messages].reverse();
            return chronological.map((msg, index) => {
              const isEdlApp = msg.senderType === "edlapp";

              const currentDate = moment(msg.createdAt).startOf("day");
              const prevMsg = chronological[index - 1];
              const showDateSeparator =
                !prevMsg ||
                !moment(prevMsg.createdAt).startOf("day").isSame(currentDate);

              return (
                <React.Fragment key={msg.id || index}>
                  {showDateSeparator && (
                    <div className="flex justify-center my-3 select-none">
                      <span className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-500 dark:text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800/60 shadow-xs">
                        {formatSeparatorDate(msg.createdAt)}
                      </span>
                    </div>
                  )}

                  <div className="space-y-1">
                    {/* Message Bubble */}
                    <div
                      className={`flex flex-col ${isEdlApp ? "items-start" : "items-end"
                        }`}
                    >
                      {/* Sender Name */}
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1 px-1">
                        {isEdlApp
                          ? selectedConversation.externalUser?.name || "ລູກຄ້າ"
                          : msg.agentUser?.employee
                            ? `${msg.agentUser.employee.first_name} ${msg.agentUser.employee.last_name}`
                            : "Call Center Agent"}
                      </span>

                      <div
                        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 shadow-xs relative ${isEdlApp
                          ? "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs"
                          : "bg-blue-600 text-white rounded-tr-xs"
                          }`}
                      >
                        {/* Image Attachment */}
                        {msg.fileImg && (
                          <div
                            onClick={() =>
                              setPreviewImageUrl(
                                `${backendUrl}/upload/conversation/${msg.fileImg}`
                              )
                            }
                            className="mt-1.5 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800/50 max-w-sm shadow-sm bg-slate-50 dark:bg-slate-950 cursor-zoom-in group/img"
                          >
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
                              className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                                !isEdlApp
                                  ? "bg-white text-blue-600 border-white hover:bg-blue-50"
                                  : "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30 hover:bg-blue-100"
                              }`}
                            >
                              <MapPin className="w-4 h-4" />
                              <span>ເບິ່ງແຜນທີ່ Google Maps</span>
                            </a>
                          </div>
                        )}

                        {/* Text Content / Service Rating Card */}
                        {msg.content && (
                          msg.content.includes("ປະເມິນ") ||
                          msg.content.includes("ให้คะแนน") ||
                          msg.content.includes("ขอคะแนน") ||
                          msg.content.includes("ຂໍດາວ") ? (() => {
                            const ratingForMsg = agentRatings.find(
                              (r) => r.messageId === msg.id
                            );

                            return (
                              <div className="flex flex-col gap-3 my-1.5 p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-yellow-950/40 border border-amber-500/35 text-slate-100 shadow-xl shadow-amber-950/20 backdrop-blur-md min-w-[260px] relative overflow-hidden group/card">
                                {/* Ambient background glow effect */}
                                <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/15 rounded-full blur-xl pointer-events-none group-hover/card:bg-amber-500/25 transition-all duration-500" />

                                {/* Header Card */}
                                <div className="flex items-center justify-between pb-2.5 border-b border-amber-500/25 relative z-10">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/30 to-amber-600/30 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/40 shadow-sm">
                                      <Star className="w-4.5 h-4.5 fill-amber-400 text-amber-400 animate-pulse" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-black text-amber-300 tracking-wide">
                                        {ratingForMsg ? "ຜົນການປະເມິນການບໍລິການ" : "ຄຳຮ້ອງຂໍປະເມິນການບໍລິການ"}
                                      </span>
                                      <span className="text-[10px] text-amber-200/70 font-medium">
                                        {ratingForMsg ? "Submitted Service Rating" : "EDL Service Rating Request"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Message Content */}
                                {!ratingForMsg && (
                                  <p className="text-xs font-semibold text-slate-200 leading-relaxed pr-1 relative z-10">
                                    {msg.content}
                                  </p>
                                )}

                                {/* 5 Stars Rating Display */}
                                <div className="flex flex-col items-center gap-1.5 py-2.5 px-4 rounded-xl bg-black/40 border border-amber-500/25 shadow-inner relative z-10">
                                  <div className="flex items-center justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                      const isFilled = ratingForMsg ? star <= ratingForMsg.rating : false;
                                      return (
                                        <Star
                                          key={star}
                                          className={`w-5 h-5 drop-shadow-md transition-all duration-300 ${
                                            isFilled
                                              ? "fill-amber-400 text-amber-400 scale-105"
                                              : ratingForMsg
                                              ? "fill-slate-800 text-slate-700/60 opacity-40"
                                              : "fill-amber-400/30 text-amber-400/50 animate-pulse"
                                          }`}
                                        />
                                      );
                                    })}
                                  </div>

                                  {ratingForMsg?.comment && (
                                    <div className="mt-1 p-2 rounded-xl bg-amber-500/10 border border-amber-400/20 text-xs italic text-amber-200 text-center font-medium w-full flex items-center justify-center gap-1.5">
                                      <span>💬</span>
                                      <span>"{ratingForMsg.comment}"</span>
                                    </div>
                                  )}
                                </div>

                                {/* Footer Status Badge */}
                                <div className="flex justify-end relative z-10">
                                  {ratingForMsg ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm">
                                      <span>✓ ປະເມິນແລ້ວ ({ratingForMsg.rating} ດາວ)</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm animate-pulse">
                                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                      <span>ລໍຖ້າການປະເມິນ...</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })() : (
                            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>
                          )
                        )}

                        {/* Footer Timestamp */}
                        <div
                          className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] ${isEdlApp
                            ? "text-slate-400 dark:text-slate-500"
                            : "text-blue-100"
                            }`}
                        >
                          <span>{moment(msg.createdAt).format("HH:mm")}</span>
                          {!isEdlApp && (
                            <span>
                              {msg.status === "seen" ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            });
          })()
        ) : (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500 text-xs">
            ບໍ່ມີຂໍ້ຄວາມໃນຫ້ອງສົນທະນານີ້
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>



      {/* Image Modal Preview */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute -top-12 right-0 text-white bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImageUrl}
              alt="Full Preview"
              className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
