import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Pause,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  MessageSquare,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/Button";
import { VoiceButton } from "../components/voice/VoiceButton";
import { useVoice } from "../hooks/useVoice";
import { Header } from "../components/layout/Header";
import { MessageBubble } from "../components/chat/MessageBubble";
import { LoadingIndicator } from "../components/chat/LoadingIndicator";
import { ChatHistoryPanel } from "../components/chat/ChatHistoryPanel";
import { useApp } from "../context/AppContext";
import { route_endpoint } from "../utils/helper";
import TrueFocus from "../components/ask-queries/TrueFocus";
import { motion, AnimatePresence } from "framer-motion";

export function AskQueries() {
  const navigate = useNavigate();
  const { location } = useLocation();
  const { t, i18n } = useTranslation();
  const { speak, stop, isSpeaking } = useVoice();
  const endOfMessagesRef = useRef(null);
  const { user } = useApp();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSpoken, setHasSpoken] = useState(false); // Fix for speech glitch
  const currentLanguage = i18n.language; // Returns 'en', 'hi', etc.

  // Chat history panel state with localStorage persistence
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(() => {
    const saved = localStorage.getItem("chatHistoryPanelOpen");
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Default: hidden on all screens (will be overridden by responsive behavior)
    return false;
  });
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  // Save panel state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "chatHistoryPanelOpen",
      JSON.stringify(isHistoryPanelOpen)
    );
  }, [isHistoryPanelOpen]);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${route_endpoint}/chat/list?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.chats) {
          setChatHistory(
            data.chats.map((chat, idx) => ({
              id: chat.chatId,
              title: `Chat ${idx + 1}`,
              preview: "",
              timestamp: new Date(chat.updatedAt || chat.createdAt),
              messageCount: 0,
            }))
          );
          // Optionally auto-select the first chat
          if (data.chats.length && !selectedChatId) {
            setSelectedChatId(data.chats[0].chatId);
          }
        }
      });
  }, [user]);

  // Handle responsive behavior on window resize
  useEffect(() => {
    const handleResize = () => {
      const largeScreen = window.innerWidth >= 1024;
      const mediumScreen = window.innerWidth >= 768 && window.innerWidth < 1024;

      setIsLargeScreen(largeScreen);

      // On large screens, always start with panel hidden (overlay mode)
      if (largeScreen) {
        setIsHistoryPanelOpen(false);
      }

      // Auto-hide panel on medium screens if it was open
      if (mediumScreen && isHistoryPanelOpen) {
        setIsHistoryPanelOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isHistoryPanelOpen]);

  // Helper: Detect reminder keywords
  const isReminder = (text) => {
    const keywords = ["remind", "reminder"];
    const lower = text.toLowerCase();
    return keywords.some((kw) => lower.includes(kw));
  };

  const isEmergency = (text) => {
    const keywords = ["emergency", "sos"];
    const lower = text.toLowerCase();
    return keywords.some((kw) => lower.includes(kw));
  };

  // Chat history panel handlers
  const handleNewChat = async () => {
    if (!user?.id) return;
    const res = await fetch(`${route_endpoint}/chat/new`, {
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
      setSelectedChatId(data.chatId);
      setError(null);
      setHasSpoken(false);
      setIsHistoryPanelOpen(false);
      setError(null);
      setHasSpoken(false);
      setIsHistoryPanelOpen(false);
    }
  };

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    setIsHistoryPanelOpen(false);
  };

  const handleDeleteChat = (chatId) => {
    setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId));
    if (selectedChatId === chatId) {
      setSelectedChatId(null);
    }
  };

  const handleToggleHistoryPanel = () => {
    setIsHistoryPanelOpen(!isHistoryPanelOpen);
  };

  const handleOutsideClick = () => {
    // Close panel when clicking outside on any screen size
    if (isHistoryPanelOpen) {
      setIsHistoryPanelOpen(false);
    }
  };

  // Clear chat functionality
  const handleClearChat = async () => {
    try {
      const response = await fetch(`${route_endpoint}/chat/clear`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, chatId: selectedChatId }),
      });
      if (!response.ok) throw new Error("Failed to clear chat history");
      setMessages([
        {
          id: "1",
          message:
            "Hello! I'm your health assistant. I can help answer questions about health, wellness, and daily living. What would you like to know?",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
      setError(null);
      setHasSpoken(false);
      // Optionally remove chat from chatHistory and select another chat
      setChatHistory((prev) =>
        prev.filter((chat) => chat.id !== selectedChatId)
      );
      setSelectedChatId(null);
    } catch (error) {
      console.error("Error clearing chat:", error);
      setError("Failed to clear chat history. Please try again.");
    }
  };

  const handleSendMessage = async (message) => {
    const messageToSend = message || inputMessage;
    if (!messageToSend.trim() || !user?.id) return;

    setError(null);
    const userMessage = {
      id: Date.now().toString(),
      message: messageToSend,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      let response, data;
      if (isReminder(messageToSend)) {
        response = await fetch(`${route_endpoint}/format-reminder`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: messageToSend,
            userId: user.id,
            chatId: selectedChatId,
          }),
        });
        data = await response.json();
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          message: data.message || "Your reminder is set.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        speak(aiMessage.message);
      } else if (isEmergency(messageToSend)) {
        const currentLocation = location || { lat: 28.6139, lng: 77.209 };
        // Prepare contacts and location (replace with real data if available)
        const contacts =
          user?.emergencyContacts
            ?.map((c) => "+91" + c.number)
            .filter(Boolean) || [];
        console.log(contacts);
        // You can get real location using Geolocation API if needed
        const latitude = currentLocation.lat || "19.0760";
        const longitude = currentLocation?.lng || "72.8777";

        response = await fetch(`${route_endpoint}/send-emergency`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contacts,
            latitude,
            longitude,
          }),
        });
        data = await response.json();
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          message:
            data.message ||
            "Emergency contacts have been notified with your location.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        speak(aiMessage.message);
      } else {
        response = await fetch(`${route_endpoint}/chat/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: messageToSend,
            userId: user.id,
            chatId: selectedChatId,
            language: currentLanguage,
          }),
        });
        data = await response.json();
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          message: data.message || "Sorry, I could not understand that.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        speak(aiMessage.message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Unable to connect to the server. Please try again.");
      const errorMessage = {
        id: (Date.now() + 2).toString(),
        message: "Unable to connect to the server. Please try again.",
        isUser: false,
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = (text) => {
    setInputMessage(text);
  };

  const fetchHistory = async () => {
    if (!user?.id || !selectedChatId) return;
    try {
      const res = await fetch(
        `${route_endpoint}/chat/history?userId=${user.id}&chatId=${selectedChatId}`
      );
      const data = await res.json();
      const loadedMessages = data.history.map((msg, index) => ({
        id: `${Date.now()}-${index}`,
        message: msg.content,
        isUser: msg.role === "user",
        timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date(),
      }));
      if (loadedMessages.length === 0) {
        loadedMessages.push({
          id: "1",
          message:
            "Hello! I'm your health assistant. I can help answer questions about health, wellness, and daily living. What would you like to know?",
          isUser: false,
          timestamp: new Date(),
        });
      }
      setMessages(loadedMessages);
      if (!hasSpoken) {
        speak(t("healthQuestions"));
        setHasSpoken(true);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
      setError("Failed to load chat history. Please refresh the page.");
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, [user, selectedChatId, speak, t]);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="h-[90vh] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      {/* Chat History Panel - Only visible on small/medium screens in layout */}
      <div className="lg:hidden">
        <ChatHistoryPanel
          chatHistory={chatHistory}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onTogglePanel={handleToggleHistoryPanel}
          selectedChatId={selectedChatId}
          isOpen={isHistoryPanelOpen}
        />
      </div>

      {/* Chat History Panel Overlay - Only visible on large screens */}
      <div className="hidden lg:block">
        <ChatHistoryPanel
          chatHistory={chatHistory}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onTogglePanel={handleToggleHistoryPanel}
          selectedChatId={selectedChatId}
          isOpen={isHistoryPanelOpen}
        />
      </div>

      {/* Main Content with Framer Motion Layout Animation */}
      <motion.div
        layout
        transition={{
          layout: {
            duration: 0.3,
            ease: "easeInOut",
          },
        }}
        className="flex-1 flex flex-col max-h-[90vh] w-full"
      >
        {/* Page Title with Toggle Button */}
        <motion.div
          layout
          transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
          className={`mb-4 sm:mb-6 flex items-center relative px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 ${
            isLargeScreen ? "justify-center" : "justify-between"
          }`}
        >
          {/* Show Chats Button - Only visible when panel is hidden on large screens */}
          <AnimatePresence>
            {!isHistoryPanelOpen && isLargeScreen && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                onClick={handleToggleHistoryPanel}
                className="absolute left-4 sm:left-6 lg:left-8 flex items-center justify-center w-12 h-12 lg:w-14 lg:h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-lg lg:rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
                aria-label="Show chat history"
              >
                <MessageSquare size={20} className="lg:w-6 lg:h-6" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Title and TrueFocus - Left aligned on small/medium, centered on large */}
          <motion.div
            layout
            transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
            className="flex items-center gap-2"
          >
            <motion.h1
              layout
              transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
              className="text-2xl sm:text-3xl font-semibold text-black dark:text-white font-['Poppins']"
            >
              Ask
            </motion.h1>
            <motion.div
              layout
              transition={{ layout: { duration: 0.4, ease: "easeInOut" } }}
              className="inline-flex items-center justify-center"
            >
              <TrueFocus
                texts={[
                  "Health",
                  "Medicines",
                  "Sleep",
                  "Diet",
                  "Pain",
                  "Anxiety",
                ]}
                mainClassName="
          text-2xl sm:text-3xl font-semibold 
          text-white
          px-2 sm:px-2 md:px-3 
          py-0.5 sm:py-1 md:py-2 
          bg-violet-500 
          overflow-hidden 
          justify-center 
          rounded-lg 
          font-['Poppins'] 
          transition-all duration-500 ease-in-out
        "
                staggerFrom="last"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden"
                transition={{
                  type: "spring",
                  damping: 30,
                  stiffness: 400,
                }}
                rotationInterval={2000}
              />
            </motion.div>
          </motion.div>

          {/* Action Buttons - Only visible on small and medium devices, right aligned */}
          <AnimatePresence>
            {!isLargeScreen && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex items-center gap-2"
              >
                {/* Add New Chat Button */}
                <button
                  onClick={handleNewChat}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
                  aria-label="New Chat"
                >
                  <Plus size={16} />
                </button>

                {/* Show/Hide Chat History Button */}
                <button
                  onClick={handleToggleHistoryPanel}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-lg"
                  aria-label="Toggle chat history"
                >
                  {isHistoryPanelOpen ? (
                    <PanelLeftClose size={16} />
                  ) : (
                    <PanelLeftOpen size={16} />
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Chat Container - Fixed Layout */}
        <motion.div
          layout
          transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
          className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mx-4 sm:mx-6 lg:mx-8 mb-4 sm:mb-6"
        >
          {/* Messages Area - Scrollable */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 custom-scrollbar">
            {messages.map((msg, index) => (
              <MessageBubble
                key={msg.id}
                message={msg.message}
                isUser={msg.isUser}
                isError={msg.isError}
                timestamp={msg.timestamp}
                index={index}
              />
            ))}

            {/* Loading Indicator */}
            {isLoading && <LoadingIndicator />}

            {/* Error State */}
            {error && (
              <div className="flex justify-center animate-fade-in">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 max-w-md">
                  <p className="text-red-800 dark:text-red-200 text-sm text-center">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <div ref={endOfMessagesRef} />
          </div>

          {/* Input Area - Fixed at Bottom */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6 bg-gray-50 dark:bg-gray-900/50 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Voice Button */}
              <VoiceButton onResult={handleVoiceInput} size="md" />

              {/* Text Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all duration-200"
                  placeholder={t("typeMessage") || "Type your message..."}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading}
                />
              </div>

              {/* Clear Chat Button */}
              <button
                onClick={handleClearChat}
                disabled={isLoading}
                className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Clear Chat"
              >
                <Trash2 size={18} className="sm:w-5 sm:h-5" />
              </button>

              {/* Send/Stop Button */}
              {isSpeaking ? (
                <button
                  onClick={stop}
                  className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Stop Speaking"
                >
                  <Pause size={18} className="sm:w-5 sm:h-5" />
                </button>
              ) : (
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send Message"
                >
                  <Send size={18} className="sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Large Screen Backdrop Overlay */}
      <AnimatePresence>
        {isHistoryPanelOpen && isLargeScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-40 lg:block hidden"
            onClick={handleOutsideClick}
          />
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isHistoryPanelOpen && !isLargeScreen && (
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

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.5);
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(75, 85, 99, 0.7);
        }

        /* Responsive breakpoints */
        @media (max-width: 1023px) {
          .chat-panel-overlay {
            display: block;
          }
        }

        @media (min-width: 1024px) {
          .chat-panel-overlay {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
