"use client";

import React from "react";
import {
  Search,
  Loader2,
  X,
  Filter,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import moment from "moment";
import { Conversation, Topic } from "./types";

interface ChatHistoryListProps {
  topics: Topic[];
  selectedTopicId: number | "all";
  onSelectTopicId: (id: number | "all") => void;
  searchQuery: string;
  onSearchQueryChange: (val: string) => void;
  startDate: string;
  onStartDateChange: (val: string) => void;
  endDate: string;
  onEndDateChange: (val: string) => void;
  loadingConversations: boolean;
  filteredConversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conv: Conversation) => void;
  onRefresh?: () => void;
}

export function ChatHistoryList({
  topics,
  selectedTopicId,
  onSelectTopicId,
  searchQuery,
  onSearchQueryChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  loadingConversations,
  filteredConversations,
  selectedConversation,
  onSelectConversation,
  onRefresh,
}: ChatHistoryListProps) {
  const [showFilters, setShowFilters] = React.useState(false);

  const hasActiveFilters = Boolean(
    startDate || endDate || selectedTopicId !== "all" || searchQuery
  );

  return (
    <div
      className={`w-full md:w-[380px] border-r border-slate-100 dark:border-slate-800 flex-col bg-white dark:bg-slate-900 shrink-0 h-full ${selectedConversation ? "hidden md:flex" : "flex"
        }`}
    >
      {/* Top Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                ປະຫວັດການສົນທະນາ
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                {filteredConversations.length} ລາຍການ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="p-2 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                title="ໂຫຼດຄືນ"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingConversations ? "animate-spin text-blue-500" : ""
                    }`}
                />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl transition-all relative ${showFilters || hasActiveFilters
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 font-bold"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              title="ตัวกรอง"
            >
              <Filter className="w-4 h-4" />
              {hasActiveFilters && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="ຄົ້ນຫາຊື່ ຫຼື ເບີໂທລູກຄ້າ..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchQueryChange("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 space-y-2.5 animate-in fade-in zoom-in-95">
            {/* Topic Filter */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                ຫົວຂໍ້ການສົນທະນາ
              </label>
              <select
                value={selectedTopicId}
                onChange={(e) =>
                  onSelectTopicId(
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  )
                }
                className="w-full py-1.5 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200"
              >
                <option value="all">-- ທຸກຫົວຂໍ້ (All Topics) --</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                  ຕັ້ງແຕ່ວັນທີ
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    className="w-full py-1.5 px-2.5 text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                  ຫາວັນທີ
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    className="w-full py-1.5 px-2.5 text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  onSearchQueryChange("");
                  onSelectTopicId("all");
                  onStartDateChange("");
                  onEndDateChange("");
                }}
                className="w-full py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl font-semibold transition-colors text-center"
              >
                ລ້າງຕົວກອງทັງໝົດ
              </button>
            )}
          </div>
        )}
      </div>

      {/* Conversations scroll area */}
      <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-slate-100/50 dark:divide-slate-800/40">
        {loadingConversations ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
          </div>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => {
            const isSelected = selectedConversation?.id === conv.id;
            const userInitials =
              conv.externalUser?.name?.substring(0, 2).toUpperCase() || "EX";

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`w-full flex items-start gap-3.5 p-4 text-left transition-all duration-150 hover:bg-slate-50/80 dark:hover:bg-slate-850/50 relative cursor-pointer group/item ${isSelected
                  ? "bg-blue-50/70 dark:bg-blue-950/30 border-l-4 border-blue-500 pl-3 shadow-xs"
                  : ""
                  }`}
              >
                {/* User avatar circle */}
                <div className="relative shrink-0 mt-0.5">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs select-none ${isSelected
                      ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                      : "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                      }`}
                  >
                    {userInitials}
                  </div>
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
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium shrink-0 ml-1">
                        {moment(conv.lastMessageAt).format("DD/MM HH:mm")}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
                      📞 {conv.externalUser?.tel || "-"}
                    </p>
                    {conv.topic && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md font-semibold truncate max-w-[110px]">
                        {conv.topic.name}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-normal truncate">
                    {conv.lastMessage || "ເລີ່ມຕົ້ນສົນທະນາ"}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 px-4">
            <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
              ບໍ່ມີລາຍການປະຫວັດການສົນທະນາ
            </p>
            {hasActiveFilters && (
              <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
                ລອງປ່ຽນຄຳຄົ້ນຫາ ຫຼື ຕົວກອງວັນທີ
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
