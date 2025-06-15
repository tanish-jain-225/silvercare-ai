import React, { useState, useEffect } from "react";
import { ArrowLeft, Send, Pause } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/Button";
import { VoiceButton } from "../components/voice/VoiceButton";
import { useVoice } from "../hooks/useVoice";
import ReactMarkdown from "react-markdown";
import { useApp } from "../context/AppContext";
import { route_endpoint } from "../utils/helper";

export function AskQueries() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { speak, stop, isSpeaking } = useVoice();
  const endOfMessagesRef = useRef(null);
  const { user } = useApp();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Helper: Detect reminder keywords
  const isReminder = (text) => {
    const keywords = ["remind", "reminder"];
    const lower = text.toLowerCase();
    return keywords.some((kw) => lower.includes(kw));
  };

  const handleSendMessage = async (message) => {
    const messageToSend = message || inputMessage;
    if (!messageToSend.trim() || !user?.id) return;

    const userMessage = {
      id: Date.now().toString(),
      message: messageToSend,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true); // Start loading

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
      const errorMessage = {
        id: (Date.now() + 2).toString(),
        message: "Unable to connect to the server.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false); // Stop loading regardless of outcome
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
      speak(t("healthQuestions"));
    } catch (err) {
      console.error("Failed to load history:", err);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col relative">
      {/* Fixed back button at the top */}
      <div className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 w-full z-30">
        <div className="max-w-sm sm:max-w-md md:max-w-lg mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-full hover:bg-blue-100 transition-colors mr-2 sm:mr-3 shadow"
            >
              <ArrowLeft size={22} className="text-blue-600" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-blue-800 tracking-tight">
              {t("askQueries")}
            </h1>
          </div>
        </div>
      </div>

      <div
        className="flex-1 max-w-sm sm:max-w-md md:max-w-lg mx-auto px-2 sm:px-4 py-4 flex flex-col gap-2"
        style={{ paddingTop: "5.5rem", paddingBottom: "5.5rem" }}
      >
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-2xl px-4 py-3 max-w-[90%] sm:max-w-[75%] text-base sm:text-lg shadow-md transition-all duration-200 ${
                msg.isUser
                  ? "bg-gradient-to-r from-blue-200 to-blue-100 ml-auto text-right border border-blue-300"
                  : "bg-white mr-auto text-left border border-gray-200"
              }`}
            >
              {msg.isUser ? (
                msg.message
              ) : (
                <ReactMarkdown>{msg.message}</ReactMarkdown>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="rounded-xl px-3 py-2 max-w-[90%] sm:max-w-[75%] text-base sm:text-lg shadow-sm bg-white mr-auto text-left flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        {/* Fixed input field at the bottom */}
        <div
          className="fixed bottom-0 left-0 w-full bg-white/95 border-t border-blue-200 z-40 flex items-end gap-2 max-w-sm sm:max-w-md md:max-w-lg mx-auto px-2 sm:px-4 py-3 rounded-t-2xl shadow-lg backdrop-blur"
          style={{ boxShadow: "0 -2px 16px rgba(30,64,175,0.08)" }}
        >
          <VoiceButton onResult={handleVoiceInput} size="md" />
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-base sm:text-lg bg-blue-50 placeholder:text-blue-400"
            placeholder={t("typeMessage")}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            style={{ transition: "box-shadow 0.2s" }}
          />
          {isSpeaking ? (
            <Button
              onClick={stop}
              icon={Pause}
              size="sm"
              className="px-3 py-2 text-red-600 border-red-300 bg-red-50 hover:bg-red-100"
              aria-label="Stop Speaking"
            />
          ) : (
            <Button
              onClick={() => handleSendMessage()}
              icon={Send}
              size="sm"
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
              aria-label="Send"
            />
          )}
        </div>
      </div>
    </div>
  );
}
