import React, { useState, useEffect, useRef } from "react";
import { Send, Pause, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/Button";
import { VoiceButton } from "../components/voice/VoiceButton";
import { useVoice } from "../hooks/useVoice";
import { Header } from "../components/layout/Header";
import { MessageBubble } from "../components/chat/MessageBubble";
import { LoadingIndicator } from "../components/chat/LoadingIndicator";
import { useApp } from "../context/AppContext";
import { route_endpoint } from "../utils/helper";
import TrueFocus from '../components/ask-queries/TrueFocus';
import { motion } from "framer-motion";

export function AskQueries() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { speak, stop, isSpeaking } = useVoice();
  const endOfMessagesRef = useRef(null);
  const { user } = useApp();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSpoken, setHasSpoken] = useState(false); // Fix for speech glitch

  // Helper: Detect reminder keywords
  const isReminder = (text) => {
    const keywords = ["remind", "reminder"];
    const lower = text.toLowerCase();
    return keywords.some((kw) => lower.includes(kw));
  };

  // Clear chat functionality
  const handleClearChat = async () => {
    try {
      // Clear messages from MongoDB
      const response = await fetch(`${route_endpoint}/chat/clear`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to clear chat history");
      }

      // Reset local state after successful API call
      setMessages([{
        id: "1",
        message: "Hello! I'm your health assistant. I can help answer questions about health, wellness, and daily living. What would you like to know?",
        isUser: false,
        timestamp: new Date(),
      }]);
      setError(null);
      setHasSpoken(false);
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
          body: JSON.stringify({ input: messageToSend, userId: user.id }),
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
      } else {
        response = await fetch(`${route_endpoint}/chat/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: messageToSend, userId: user.id }),
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
    if (!user?.id) return;
    try {
      const res = await fetch(
        `${route_endpoint}/chat/history?userId=${user.id}`
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

      // Fix for speech glitch - only speak once on initial load
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
  }, [user, speak, t]);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="h-[89vh] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-7xl max-h-[90vh] mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Page Title */}
        <div className="mb-4 sm:mb-6 flex items-center justify-center gap-2 text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold text-black dark:text-white font-['Poppins']">
            Ask
          </h1>
          <motion.div
            layout
            transition={{ layout: { duration: 0.4, ease: "easeInOut" } }}
            className="inline-flex items-center justify-center"
          >
            <TrueFocus
              texts={['Health', 'Medicines', 'Sleep', 'Diet', 'Pain', 'Anxiety']}
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
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-120%' }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 400,
              }}
              rotationInterval={2000}
            />
          </motion.div>
        </div>

        {/* Chat Container - Fixed Layout */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
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
        </div>
      </div>

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
      `}</style>
    </div>
  );
}
