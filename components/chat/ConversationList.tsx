import React from "react";
import { Search, Loader2 } from "lucide-react";
import moment from "moment";
import { Conversation } from "./types";

interface ConversationListProps {
  searchQuery: string;
  onSearchQueryChange: (val: string) => void;
  loadingConversations: boolean;
  filteredConversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conv: Conversation) => void;
}

export function ConversationList({
  searchQuery,
  onSearchQueryChange,
  loadingConversations,
  filteredConversations,
  selectedConversation,
  onSelectConversation,
}: ConversationListProps) {
  return (
    <div className={`w-full md:w-[340px] border-r border-slate-100 dark:border-slate-800 flex-col bg-white dark:bg-slate-900 shrink-0 h-full ${selectedConversation ? "hidden md:flex" : "flex"
      }`}>
      {/* Search box container */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="ຄົ້ນຫາລາຍຊື່ ຫຼື ເບີໂທ..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Conversations scroll area */}
      <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-slate-100/50 dark:divide-slate-800/40">
        {loadingConversations ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => {
            const isSelected = selectedConversation?.id === conv.id;
            const userInitials = conv.externalUser?.name?.substring(0, 2) || "EX";
            const isUnread = conv.unreadAgentCount > 0;

            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`w-full flex items-start gap-3.5 p-4 text-left transition-all duration-150 hover:bg-slate-50/80 dark:hover:bg-slate-850/50 relative border-b border-slate-50 dark:border-slate-850/10 ${isSelected
                  ? "bg-blue-50/60 dark:bg-blue-950/20 border-l-4 border-blue-500 pl-3"
                  : ""
                  }`}
              >
                {/* User avatar circle */}
                <div className="relative shrink-0 mt-0.5">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm select-none ${isSelected
                      ? "bg-blue-500 text-white"
                      : "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                      }`}
                  >
                    {userInitials}
                  </div>
                  {/* <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" /> */}
                </div>

                {/* Conversation Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4
                      className={`text-sm font-bold truncate ${isSelected
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-800 dark:text-slate-200"
                        }`}
                    >
                      {conv.externalUser?.name || "ບໍ່ມີຊື່"}
                    </h4>
                    {conv.lastMessageAt && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {moment(conv.lastMessageAt).format("HH:mm")}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate mb-1">
                    {conv.externalUser?.tel || ""}
                  </p>
                  <p
                    className={`text-xs truncate ${isUnread
                      ? "text-slate-900 dark:text-slate-100 font-extrabold"
                      : "text-slate-500 dark:text-slate-400 font-normal"
                      }`}
                  >
                    {conv.lastMessage || "ເລີ່ມຕົ້ນສົນທະນາ"}
                  </p>
                </div>

                {/* Unread badge indicator */}
                {isUnread && (
                  <span className="absolute right-4 bottom-4.5 min-w-[18px] h-[18px] bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
                    {conv.unreadAgentCount}
                  </span>
                )}
              </button>
            );
          })
        ) : (
          <div className="text-center py-12 text-sm text-slate-400 dark:text-slate-500">
            ບໍ່ມີລາຍການສົນທະນາ
          </div>
        )}
      </div>
    </div>
  );
}
