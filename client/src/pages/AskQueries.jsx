import React, { useState, useEffect, useRef } from "react";
import { Send, Pause } from "lucide-react";
import { VoiceButton } from "../components/voice/VoiceButton";
import { MessageBubble } from "../components/chat/MessageBubble";
import { LoadingIndicator } from "../components/chat/LoadingIndicator";
import { useApp } from "../context/AppContext";
import { route_endpoint } from "../utils/helper.js";
import TrueFocus from "../components/ask-queries/TrueFocus";
import { motion } from "framer-motion";
import { useVoice } from "../hooks/useVoice";
import { BottomNavigation } from "../components/layout/BottomNavigation";

export function AskQueries() {
  const { user } = useApp();
  const endOfMessagesRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { speak, listen, stop, isSpeaking } = useVoice();
  const [inputDisabled, setInputDisabled] = useState(true); // Start disabled on initial load

  // Initialize messages with a welcome message
  useEffect(() => {
    if (user?.id) {
      const welcomeMessage = {
        id: "welcome",
        message: "Welcome, How can I assist you today?",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, welcomeMessage]);
      setInputDisabled(true); // Disable input and voice button while speaking welcome
      speak(welcomeMessage.message, {
        onended: () => {
          setInputDisabled(false); // Enable input after welcome speech ends or if stopped
        },
      });
    }
  }, [user]);

  // Send a message
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
      response = await fetch(`${route_endpoint}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: messageToSend,
          userId: user.id,
        }),
      });
      data = await response.json();
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        message: data.message || "Sorry, I could not understand that.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => {
        const updated = [...prev, aiMessage];
        return updated;
      });

      setInputDisabled(true); // Disable input while speaking
      speak(aiMessage.message, {
        onended: () => {
          setInputDisabled(false); // Enable input after speaking ends
        },
      });
    } catch (error) {
      setError("Unable to connect to the server. Please try again.");
      const errorMessage = {
        id: (Date.now() + 2).toString(),
        message:
          error.message || "Unable to connect to the server. Please try again.",
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
    // Set the input message to the recognized text
    if (isSpeaking) {
      stop();
    }
    setInputMessage(text);
  };

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="relative min-h-screen pb-20">
      {/* Main chat UI */}
      <div className="bg-gradient-to-br from-primary-100/90 via-primary-200/90 to-accent-yellow/40 dark:from-dark-100/90 dark:via-dark-200/90 dark:to-accent-yellow/30 flex items-center justify-center p-4 h-[90vh]">
        <motion.div
          layout
          transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
          className="flex flex-col w-full max-w-4xl bg-white/95 dark:bg-dark-200/90 rounded-2xl shadow-lg border border-primary-100/30 dark:border-primary-200/40 overflow-hidden h-[80vh] mx-auto"
        >
          <motion.div
            layout
            transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
            className="mb-4 sm:mb-6 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6"
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
              className="inline-flex items-center justify-center ml-3"
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
                mainClassName="text-2xl sm:text-3xl font-semibold text-white px-2 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-2 bg-primary-200 overflow-hidden justify-center rounded-lg font-['Poppins'] transition-all duration-500 ease-in-out"
                staggerFrom="last"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2000}
              />
            </motion.div>
          </motion.div>
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 custom-scrollbar">
            {messages.map((msg, index) => (
              <MessageBubble
                key={msg.id}
                message={msg.message}
                isUser={msg.isUser}
                isError={msg.isError}
                timestamp={msg.timestamp}
                index={index}
                className={
                  msg.isUser
                    ? "bg-accent-yellow/20 text-primary-300 border border-primary-100/30 dark:bg-primary-900/40 dark:text-white dark:border-primary-800/40"
                    : "bg-primary-100/80 text-primary-200 border border-primary-100/30 dark:bg-primary-900/40 dark:text-primary-100 dark:border-primary-700/40"
                }
              />
            ))}
            {isLoading && <LoadingIndicator />}
            {error && (
              <div className="flex justify-center animate-fade-in">
                <div className="bg-accent-yellow/20 border border-primary-100/30 rounded-lg px-4 py-3 max-w-md dark:bg-white dark:text-accent-yellow dark:border-blue-700/40">
                  <p className="text-red-700 font-semibold text-sm text-center">
                    {error}
                  </p>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>
          <div className="border-t border-primary-100/30 dark:border-blue-800/40 p-3 sm:p-4 lg:p-6 bg-white/95 dark:bg-dark-200/90 shadow-xl rounded-2xl mx-2 sm:mx-4 mb-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap lg:flex-nowrap">
              <VoiceButton
                onResult={handleVoiceInput}
                size="lg"
                className="!w-10 !h-10 sm:!w-12 sm:!h-12 rounded-full bg-primary-200 dark:bg-primary-200/80 shadow-md flex items-center justify-center dark:hover:bg-blue-700 [&>svg]:scale-75 sm:[&>svg]:scale-100"
                disabled={isLoading || inputDisabled}
              />
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 min-w-0 px-4 py-3 sm:px-5 sm:py-4 rounded-xl border-2 border-primary-100/30 dark:border-blue-800/40 bg-primary-50/80 dark:bg-dark-100/80 text-primary-300 dark:text-white placeholder:text-primary-200 dark:placeholder:text-blue-200/60 text-sm sm:text-base shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Type your message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isLoading || inputDisabled}
              />
              {isSpeaking ? (
                <button
                  onClick={() => {
                    stop();
                    setInputDisabled(false); // Enable input when pause is clicked
                  }}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary-200 hover:bg-blue-700 dark:bg-primary-200 dark:hover:bg-blue-700 text-white dark:text-white border border-primary-100/30 dark:border-blue-700/40 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105"
                  aria-label="Pause/Stop Speaking"
                  type="button"
                >
                  <Pause size={20} />
                </button>
              ) : (
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || inputDisabled}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary-200 hover:bg-primary-300 dark:bg-primary-200 dark:hover:bg-blue-700 text-white dark:text-white border border-primary-100/30 dark:border-blue-700/40 shadow-md flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                  aria-label="Send Message"
                  type="button"
                >
                  <Send size={20} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      {/* Bottom Navigation Bar */}
      <BottomNavigation />
      <style>{`
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
