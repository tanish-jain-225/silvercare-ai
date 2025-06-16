import React, { useState } from "react";
import {
  Plus,
  MessageSquare,
  Trash2,
  MoreVertical,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ChatHistoryPanel({
  chatHistory = [],
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onTogglePanel,
  selectedChatId = null,
  isOpen = true,
}) {
  const [hoveredChatId, setHoveredChatId] = useState(null);

  // Sample chat history data for demonstration
  const sampleChats = [
    {
      id: "1",
      title: "Health consultation about sleep",
      preview: "I've been having trouble sleeping lately...",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      messageCount: 8,
    },
    {
      id: "2",
      title: "Diet and nutrition advice",
      preview: "What foods should I eat for better energy?",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      messageCount: 12,
    },
    {
      id: "3",
      title: "Exercise routine questions",
      preview: "I want to start a workout routine...",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      messageCount: 6,
    },
    {
      id: "4",
      title: "Mental health support",
      preview: "I've been feeling anxious lately...",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      messageCount: 15,
    },
  ];

  const chats = chatHistory.length > 0 ? chatHistory : sampleChats;

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const truncateText = (text, maxLength = 50) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <motion.div
      initial={{ x: -320, opacity: 0 }}
      animate={{
        x: isOpen ? 0 : -320,
        opacity: isOpen ? 1 : 0,
      }}
      exit={{ x: -320, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`
        fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 
        shadow-lg z-30 transform transition-all duration-300 ease-in-out
        lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-80 lg:shadow-xl lg:z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Chat History
        </h2>
        <div className="flex items-center gap-2">
          {/* Add New Chat Button - Only visible on large devices */}
          <button
            onClick={onNewChat}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="New Chat"
          >
            <Plus size={16} />
          </button>

          {/* Close button for large screens (overlay mode) */}
          <button
            onClick={onTogglePanel}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Close chat history"
          >
            <X size={16} />
          </button>

          {/* Close button for mobile/tablet */}
          <button
            onClick={onTogglePanel}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Close chat history"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-2 space-y-1">
          <AnimatePresence>
            {chats.map((chat, index) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.05,
                  ease: "easeOut",
                }}
                onHoverStart={() => setHoveredChatId(chat.id)}
                onHoverEnd={() => setHoveredChatId(null)}
                className={`
                  relative group cursor-pointer rounded-lg p-3 transition-all duration-200
                  ${
                    selectedChatId === chat.id
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-[1.02]"
                  }
                `}
                onClick={() => onSelectChat?.(chat.id)}
              >
                {/* Chat Item Content */}
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={`
                    flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                    ${
                      selectedChatId === chat.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
                    }
                  `}
                  >
                    <MessageSquare size={16} />
                  </div>

                  {/* Chat Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={`
                        text-sm font-medium truncate transition-colors duration-200
                        ${
                          selectedChatId === chat.id
                            ? "text-blue-900 dark:text-blue-100"
                            : "text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                        }
                      `}
                      >
                        {chat.title}
                      </h3>

                      {/* Action Buttons */}
                      <AnimatePresence>
                        {hoveredChatId === chat.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center gap-1"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteChat?.(chat.id);
                              }}
                              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 hover:text-red-600 transition-colors duration-200"
                              aria-label="Delete chat"
                            >
                              <Trash2 size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Additional actions menu
                              }}
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-600 transition-colors duration-200"
                              aria-label="More options"
                            >
                              <MoreVertical size={12} />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <p
                      className={`
                      text-xs mt-1 truncate transition-colors duration-200
                      ${
                        selectedChatId === chat.id
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                      }
                    `}
                    >
                      {truncateText(chat.preview)}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={`
                        text-xs transition-colors duration-200
                        ${
                          selectedChatId === chat.id
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400"
                        }
                      `}
                      >
                        {formatTimestamp(chat.timestamp)}
                      </span>
                      <span
                        className={`
                        text-xs px-2 py-0.5 rounded-full transition-all duration-200
                        ${
                          selectedChatId === chat.id
                            ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20"
                        }
                      `}
                      >
                        {chat.messageCount} messages
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedChatId === chat.id && (
                  <motion.div
                    layoutId="selectedIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Empty State */}
      {chats.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <MessageSquare
              size={24}
              className="text-gray-400 dark:text-gray-500"
            />
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            No chat history
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Start a new conversation to see your chat history here
          </p>
          <button
            onClick={onNewChat}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start New Chat
          </button>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 2px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.3);
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(75, 85, 99, 0.5);
        }
      `}</style>
    </motion.div>
  );
}
