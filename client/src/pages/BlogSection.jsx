import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { VoiceButton } from '../components/voice/VoiceButton';
import { useVoice } from '../hooks/useVoice';

export function BlogSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { speak } = useVoice();
  const [messages, setMessages] = useState([
    {
      id: '1',
      message: `Welcome to the blog section! What would you like to explore today?`,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const userMessage = {
      id: Date.now().toString(),
      message: inputMessage.trim(),
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate AI response for blog exploration
    setTimeout(() => {
      const responses = [
        'Here are some recent blog posts you might like.',
        'Would you like to create a new blog post or read existing ones?',
        'I can help you draft a blog post. What topic interests you?'
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

  useEffect(() => {
    speak('Welcome to the blog section. Ready to read or write some posts?');
  }, [speak]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-sm sm:max-w-md md:max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center">
            <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-gray-100 mr-3">
              <ArrowLeft size={22} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">{t('blogSection')}</h1>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`max-w-lg w-full p-4 rounded-lg shadow ${msg.isUser ? 'bg-green-100 ml-auto text-right' : 'bg-white mr-auto text-left'}`}>
            {msg.message}
          </div>
        ))}
        <div className="flex w-full max-w-lg gap-2">
          <VoiceButton onResult={handleVoiceInput} size="md" />
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            placeholder={t('typeOrSpeak')}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200"
          />
          <Button onClick={handleSendMessage} icon={Send} size="md" />
        </div>
      </div>
    </div>
  );
}
