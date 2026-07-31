import React from "react";
import { Search, Loader2, MoreVertical, Eraser, Trash2, X, AlertTriangle } from "lucide-react";
import moment from "moment";
import { Conversation } from "./types";

interface ConversationListProps {
  searchQuery: string;
  onSearchQueryChange: (val: string) => void;
  loadingConversations: boolean;
  filteredConversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conv: Conversation) => void;
  onClearChat?: (convId: number) => Promise<void>;
  onDeleteChat?: (convId: number) => Promise<void>;
}

export function ConversationList({
  searchQuery,
  onSearchQueryChange,
  loadingConversations,
  filteredConversations,
  selectedConversation,
  onSelectConversation,
  onClearChat,
  onDeleteChat,
}: ConversationListProps) {
  const [activeMenuId, setActiveMenuId] = React.useState<number | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<{
    type: "clear" | "delete";
    conversation: Conversation;
  } | null>(null);
  const [processing, setProcessing] = React.useState(false);

  const handleExecuteAction = async () => {
    if (!confirmAction) return;
    setProcessing(true);
    try {
      if (confirmAction.type === "clear" && onClearChat) {
        await onClearChat(confirmAction.conversation.id);
      } else if (confirmAction.type === "delete" && onDeleteChat) {
        await onDeleteChat(confirmAction.conversation.id);
      }
    } finally {
      setProcessing(false);
      setConfirmAction(null);
    }
  };

  return (
    <div
      className={`w-full md:w-[340px] border-r border-slate-100 dark:border-slate-800 flex-col bg-white dark:bg-slate-900 shrink-0 h-full ${selectedConversation ? "hidden md:flex" : "flex"
        }`}
    >
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
            const isMenuOpen = activeMenuId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`w-full flex items-start gap-3.5 p-4 text-left transition-all duration-150 hover:bg-slate-50/80 dark:hover:bg-slate-850/50 relative border-b border-slate-50 dark:border-slate-850/10 cursor-pointer group/item ${isSelected
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
                </div>

                {/* Conversation Details */}
                <div className="flex-1 min-w-0 pr-6">
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

                {/* More Action Button (WhatsApp Style) */}
                <div className="absolute right-3 top-3.5 z-20">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(isMenuOpen ? null : conv.id);
                    }}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-all opacity-0 group-hover/item:opacity-100"
                    title="ຫ້ອງແຊັດ"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30 cursor-default"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(null);
                        }}
                      />
                      <div className="absolute right-0 top-7 z-40 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl py-1.5 w-48 text-xs font-semibold text-slate-700 dark:text-slate-200 animate-in fade-in zoom-in-95">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            setConfirmAction({ type: "clear", conversation: conv });
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-2.5 transition-colors text-slate-700 dark:text-slate-200"
                        >
                          <Eraser className="w-4 h-4 text-amber-500" />
                          <span>ລ້າງປະຫວັດ (Clear Chat)</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            setConfirmAction({ type: "delete", conversation: conv });
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2.5 transition-colors text-red-500"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                          <span>ລົບຫ້ອງ (Delete Chat)</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Unread badge indicator */}
                {isUnread && (
                  <span className="absolute right-4 bottom-3 min-w-[18px] h-[18px] bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm pointer-events-none">
                    {conv.unreadAgentCount}
                  </span>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-sm text-slate-400 dark:text-slate-500">
            ບໍ່ມີລາຍການສົນທະນາ
          </div>
        )}
      </div>

      {/* Confirmation Modal for Clear / Delete Chat */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setConfirmAction(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-full ${confirmAction.type === "clear" ? "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" : "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"}`}>
                {confirmAction.type === "clear" ? <Eraser className="w-6 h-6" /> : <Trash2 className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {confirmAction.type === "clear" ? "ລ້າງປະຫວັດການສົນທະນາ" : "ລົບຫ້ອງສົນທະນາ"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {confirmAction.conversation.externalUser?.name || "ລູກຄ້າ"}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              {confirmAction.type === "clear"
                ? "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບຂໍ້ຄວາມທັງໝົດໃນຫ້ອງແຊັດນີ້?"
                : "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບຫ້ອງສົນທະນານີ້ອອກຈາກລາຍການ?"}
            </p>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={processing}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                ຍົກເລີກ
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={processing}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-1.5 shadow-sm ${confirmAction.type === "clear" ? "bg-amber-500 hover:bg-amber-600" : "bg-red-500 hover:bg-red-600"}`}
              >
                {processing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{confirmAction.type === "clear" ? "ລ້າງຂໍ້ຄວາມ" : "ລົບຫ້ອງແຊັດ"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
