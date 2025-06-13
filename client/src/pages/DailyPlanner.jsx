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
        <div className="max-w-sm sm:max-w-md md:max-w-lg mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-2 sm:mr-3"
            >
              <ArrowLeft size={22} className="text-gray-600" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">{t('planYourDay')}</h1>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 max-w-sm sm:max-w-md md:max-w-lg mx-auto px-2 sm:px-4 py-4 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-xl px-3 py-2 max-w-[90%] sm:max-w-[75%] text-base sm:text-lg shadow-sm ${msg.isUser ? 'bg-blue-100 ml-auto text-right' : 'bg-white mr-auto text-left'}`}
            >
              {msg.message}
            </div>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <VoiceButton onResult={handleVoiceInput} size="md" />
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-base sm:text-lg"
            placeholder={t('typeMessage')}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage} icon={Send} size="sm" className="px-3 py-2" aria-label="Send" />
        </div>
      </div>
    </div>
  );
}