import React from "react";
import { Loader2, MessageSquare } from "lucide-react";
import { Topic } from "./types";

interface TopicSelectorProps {
  topics: Topic[];
  loadingTopics: boolean;
  onSelectTopic: (topic: Topic) => void;
}

export function TopicSelector({
  topics,
  loadingTopics,
  onSelectTopic,
}: TopicSelectorProps) {
  return (
    <div className="py-8 px-6 w-full select-none animate-fade-in">
      {/* Header Title styled as a beautiful modern header */}
      <div className="flex flex-col items-center mb-12 text-center">
        <div className="inline-flex p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-2xl mb-4 shadow-sm border border-blue-100/50 dark:border-blue-900/30">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          ເລືອກຫົວຂໍ້ການສົນທະນາ
        </h1>
      </div>

      {/* Grid list styled as modern white + blue cards */}
      {loadingTopics ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(topic)}
              className="group flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/30 hover:bg-blue-50/10 dark:hover:bg-blue-950/10 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_-4px_rgba(59,130,246,0.08)]"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Icon wrapper */}
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-xl group-hover:scale-105 transition-transform duration-300 shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                {/* Text details */}
                <div className="min-w-0">
                  <span className="text-base font-bold text-slate-800 dark:text-slate-100 truncate block">
                    {topic.name}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 block mt-0.5 font-medium">
                    ຄລິກເພື່ອເຂົ້າສູ່ຫ້ອງສົນທະນາ
                  </span>
                </div>
              </div>
              {/* Right Indicator: Unread Count Badge or Arrow */}
              {topic.unreadCount !== undefined && topic.unreadCount > 0 ? (
                <div className="flex items-center justify-center min-w-6 h-6 px-1.5 text-xs font-black text-white bg-red-500 rounded-full shrink-0 shadow-sm transition-all duration-300">
                  {topic.unreadCount}
                </div>
              ) : (
                <div className="text-slate-300 dark:text-slate-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300 shrink-0 pr-1 text-lg font-bold">
                  &rarr;
                </div>
              )}
            </button>
          ))}

          {topics.length === 0 && (
            <div className="col-span-full text-center py-12 text-sm text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              ບໍ່ມີຫົວຂໍ້ການສົນທະນາໃນລະບົບ
            </div>
          )}
        </div>
      )}
    </div>
  );
}
