import React, { useState, useEffect } from "react";
import { ChatHistoryPanel } from "../components/chat/ChatHistoryPanel";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export function ChatHistoryDemo() {
  // Initialize state with localStorage persistence
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(() => {
    const saved = localStorage.getItem("chatHistoryPanelOpen");
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Default: visible on large screens, hidden on smaller screens
    return window.innerWidth >= 1024;
  });

  const [selectedChatId, setSelectedChatId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  // const [chatHistory, setChatHistory] = useState([
  //     {
  //         id: "1",
  //         title: "Health consultation about sleep",
  //         preview: "I've been having trouble sleeping lately and it's affecting my daily routine. Can you help me understand what might be causing this?",
  //         timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  //         messageCount: 8
  //     },
  //     {
  //         id: "2",
  //         title: "Diet and nutrition advice",
  //         preview: "What foods should I eat for better energy throughout the day? I'm looking for healthy meal suggestions.",
  //         timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  //         messageCount: 12
  //     },
  //     {
  //         id: "3",
  //         title: "Exercise routine questions",
  //         preview: "I want to start a workout routine but I'm not sure where to begin. Can you suggest some beginner exercises?",
  //         timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  //         messageCount: 6
  //     },
  //     {
  //         id: "4",
  //         title: "Mental health support",
  //         preview: "I've been feeling anxious lately and I'm not sure how to cope. What are some techniques I can try?",
  //         timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
  //         messageCount: 15
  //     },
  //     {
  //         id: "5",
  //         title: "Medication questions",
  //         preview: "I have some questions about my prescription medication. What are the common side effects?",
  //         timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
  //         messageCount: 9
  //     }
  // ]);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/chat/list?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.chats) {
          setChatHistory(
            data.chats.map((chat) => ({
              id: chat.chatId,
              title: "Conversation", // You can add a title field in your backend if needed
              preview: "", // Optionally fetch the last message as preview
              timestamp: new Date(chat.updatedAt || chat.createdAt),
              messageCount: 0, // Optionally fetch message count
            }))
          );
        }
      });
  }, [user]);
  // Save panel state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "chatHistoryPanelOpen",
      JSON.stringify(isHistoryPanelOpen)
    );
  }, [isHistoryPanelOpen]);

  // Handle responsive behavior on window resize
  useEffect(() => {
    const handleResize = () => {
      const isLargeScreen = window.innerWidth >= 1024;
      const isMediumScreen =
        window.innerWidth >= 768 && window.innerWidth < 1024;

      // Auto-hide panel on medium screens if it was open
      if (isMediumScreen && isHistoryPanelOpen) {
        setIsHistoryPanelOpen(false);
      }

      // Auto-show panel on large screens if it was hidden
      if (isLargeScreen && !isHistoryPanelOpen) {
        setIsHistoryPanelOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isHistoryPanelOpen]);

  const handleNewChat = async () => {
    if (!user?.id) return;
    const res = await fetch("/chat/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    const data = await res.json();
    if (data.chatId) {
      const chatNumber = chatHistory.length + 1;
      const newChat = {
        id: data.chatId,
        title: `Chat ${chatNumber}`,
        preview: "",
        timestamp: new Date(),
        messageCount: 0,
      };
      setChatHistory((prev) => [newChat, ...prev]);
      setSelectedChatId(data.chatId);

      if (window.innerWidth < 1024) setIsHistoryPanelOpen(false);
    }
  };

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);

    // Close panel on mobile/tablet
    if (window.innerWidth < 1024) {
      setIsHistoryPanelOpen(false);
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (!user?.id) return;
    await fetch("/chat/clear", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, chatId }),
    });
    setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId));
    if (selectedChatId === chatId) setSelectedChatId(null);
  };

  const handleToggleHistoryPanel = () => {
    setIsHistoryPanelOpen(!isHistoryPanelOpen);
  };

  const handleOutsideClick = () => {
    // Only close panel on mobile/tablet when clicking outside
    if (window.innerWidth < 1024 && isHistoryPanelOpen) {
      setIsHistoryPanelOpen(false);
    }
  };

  const getCurrentBreakpoint = () => {
    const width = window.innerWidth;
    if (width >= 1024) return "Large (≥1024px)";
    if (width >= 768) return "Medium (768px-1023px)";
    return "Small (<768px)";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      {/* Chat History Panel */}
      <ChatHistoryPanel
        chatHistory={chatHistory}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onTogglePanel={handleToggleHistoryPanel}
        selectedChatId={selectedChatId}
        isOpen={isHistoryPanelOpen}
      />

      {/* Main Content */}
      <div
        className={`
                flex-1 flex flex-col p-8
                transition-all duration-300 ease-in-out
                ${isHistoryPanelOpen ? "lg:max-w-none" : "lg:max-w-7xl"}
            `}
      >
        <div className="max-w-4xl w-full mx-auto">
          {/* Header with Toggle Buttons */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Enhanced Chat History Panel Demo
            </h1>

            {/* Header Controls */}
            <div className="flex items-center gap-2">
              {/* New Chat Button */}
              <button
                onClick={handleNewChat}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="New Chat"
              >
                <Plus size={18} />
              </button>

              {/* History Toggle Button */}
              <button
                onClick={handleToggleHistoryPanel}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label={
                  isHistoryPanelOpen ? "Hide chat history" : "Show chat history"
                }
              >
                {isHistoryPanelOpen ? (
                  <PanelLeftClose size={18} />
                ) : (
                  <PanelLeftOpen size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Current State Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Current State
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Panel State
                </h3>
                <p className="text-blue-700 dark:text-blue-300">
                  {isHistoryPanelOpen ? "Open" : "Closed"}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  Breakpoint
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  {getCurrentBreakpoint()}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                  Selected Chat
                </h3>
                <p className="text-purple-700 dark:text-purple-300">
                  {selectedChatId
                    ? chatHistory.find((c) => c.id === selectedChatId)?.title
                    : "None"}
                </p>
              </div>
            </div>
          </div>

          {/* New Features */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              New Enhanced Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Header Integration
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Toggle button in header (all devices)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    New chat button adjacent to toggle
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Consistent icon design (PanelLeftClose/Open)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Proper spacing and alignment
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Responsive Improvements
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Smooth container expansion (max-w-7xl)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    300ms transition animations
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Mobile overlay with close button
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Enhanced localStorage persistence
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Interactive Controls
            </h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleToggleHistoryPanel}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isHistoryPanelOpen ? "Hide" : "Show"} Panel
              </button>

              <button
                onClick={handleNewChat}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Add New Chat
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem("chatHistoryPanelOpen");
                  window.location.reload();
                }}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Reset localStorage
              </button>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Technical Implementation
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Header Layout
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Toggle button positioned in header (all breakpoints)</li>
                  <li>New chat button adjacent to toggle button</li>
                  <li>Consistent icon design with PanelLeftClose/Open</li>
                  <li>Proper spacing and responsive alignment</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Responsive Behavior
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>
                    Large devices: Panel slides out, container expands to
                    max-w-7xl
                  </li>
                  <li>
                    Medium/Small devices: Panel overlays with close button
                  </li>
                  <li>300ms smooth transitions for all animations</li>
                  <li>localStorage persistence for user preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Mobile Enhancements
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Close button (×) in panel header for mobile/tablet</li>
                  <li>Semi-transparent backdrop overlay</li>
                  <li>Touch-friendly button sizes and spacing</li>
                  <li>Auto-close on outside click</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isHistoryPanelOpen && window.innerWidth < 1024 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={handleOutsideClick}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
