import React, { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { VoiceButton } from '../components/voice/VoiceButton';
import { useVoice } from '../hooks/useVoice';

export function DailyPlanner() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { speak } = useVoice();
  const [messages, setMessages] = useState([
    {
      id: '1',
      message: 'Hello! I\'m here to help you plan your day. What would you like to do today?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'That sounds like a great plan! Would you like me to set a reminder for that?',
        'I can help you schedule that activity. What time would work best for you?',
        'That\'s a wonderful idea! Let me help you organize your day around that.',
        'I\'ll help you plan that. Would you like to break it down into smaller steps?'
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        message: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      speak(response);
    }, 1000);
  };

  const handleVoiceInput = (text) => {
    setInputMessage(text);
  };

  React.useEffect(() => {
    speak('Welcome to your daily planner. What would you like to plan for today?');
  }, [speak]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/home')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">{t('planYourDay')}</h1>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-6 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 shadow-md'
                }`}
              >
                <p className="text-base">{message.message}</p>
                <p className={`text-xs mt-2 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={t('typeOrSpeak')}
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <VoiceButton onResult={handleVoiceInput} />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              icon={Send}
              className="p-3"
            >
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}