import React, { useState, useEffect } from "react";
import { ArrowLeft, Send, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/Button";
import { VoiceButton } from "../components/voice/VoiceButton";
import { useVoice } from "../hooks/useVoice";
import ReactMarkdown from "react-markdown";

const sampleQuestions = [
  "What should I eat for better heart health?",
  "How can I manage my blood pressure?",
  "What exercises are good for seniors?",
  "How do I take my medication properly?",
  "What are the symptoms of diabetes?",
  "How can I improve my sleep quality?",
];

const route_endpoint = "http://localhost:8000";

const userId = "default"; // Replace with dynamic user ID in production

export function AskQueries() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { speak } = useVoice();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message) => {
    const messageToSend = message || inputMessage;
    if (!messageToSend.trim()) return;

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
      const response = await fetch(`${route_endpoint}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend, userId }),
      });

      const data = await response.json();

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        message: data.reply || "Sorry, I could not understand that.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      speak(aiMessage.message);
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
    try {
      const res = await fetch(
        `${route_endpoint}/chat/history?userId=${userId}`
      );
      const data = await res.json();

      const loadedMessages = data.history.map((msg, index) => ({
        id: `${Date.now()}-${index}`,
        message: msg.content,
        isUser: msg.role === "user",
        timestamp: new Date(),
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
  }, [speak, t]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-sm sm:max-w-md md:max-w-lg mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-2 sm:mr-3"
            >
              <ArrowLeft size={22} className="text-gray-600" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">
              {t("askQueries")}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-sm sm:max-w-md md:max-w-lg mx-auto px-2 sm:px-4 py-4 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-xl px-3 py-2 max-w-[90%] sm:max-w-[75%] text-base sm:text-lg shadow-sm ${
                msg.isUser
                  ? "bg-blue-100 ml-auto text-right"
                  : "bg-white mr-auto text-left"
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
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
            </div>
          )}
        </div>

        <div className="flex items-end gap-2">
          <VoiceButton onResult={handleVoiceInput} size="md" />
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-base sm:text-lg"
            placeholder={t("typeMessage")}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button
            onClick={() => handleSendMessage()}
            icon={Send}
            size="sm"
            className="px-3 py-2"
            aria-label="Send"
          />
        </div>

        <div className="mt-6">
          <div className="text-xs sm:text-sm text-gray-500 mb-2">
            {t("sampleQuestions")}
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-xl text-xs sm:text-sm transition-colors border border-blue-100"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
