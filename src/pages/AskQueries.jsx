import React, { useState } from 'react';
import { ArrowLeft, Send, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { VoiceButton } from '../components/voice/VoiceButton';
import { useVoice } from '../hooks/useVoice';

const sampleQuestions = [
  "What should I eat for better heart health?",
  "How can I manage my blood pressure?",
  "What exercises are good for seniors?",
  "How do I take my medication properly?",
  "What are the symptoms of diabetes?",
  "How can I improve my sleep quality?"
];

export function AskQueries() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { speak } = useVoice();
  const [messages, setMessages] = useState([
    {
      id: '1',
      message: 'Hello! I\'m your health assistant. I can help answer questions about health, wellness, and daily living. What would you like to know?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = async (message) => {
    const messageToSend = message || inputMessage;
    if (!messageToSend.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      message: messageToSend,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate AI response based on the question
    setTimeout(() => {
      let response = '';
      
      if (messageToSend.toLowerCase().includes('heart')) {
        response = 'For better heart health, focus on eating plenty of fruits, vegetables, whole grains, and lean proteins. Limit sodium, saturated fats, and processed foods. Regular exercise like walking is also excellent for your heart.';
      } else if (messageToSend.toLowerCase().includes('blood pressure')) {
        response = 'To manage blood pressure, maintain a healthy weight, exercise regularly, limit sodium intake, manage stress, and take prescribed medications as directed. Monitor your blood pressure regularly and consult your doctor.';
      } else if (messageToSend.toLowerCase().includes('exercise')) {
        response = 'Great exercises for seniors include walking, swimming, gentle yoga, chair exercises, and resistance training with light weights. Start slowly and gradually increase intensity. Always consult your doctor before starting new exercises.';
      } else if (messageToSend.toLowerCase().includes('medication')) {
        response = 'Take medications exactly as prescribed by your doctor. Use a pill organizer, set reminders, and never skip doses. Keep a list of all medications and their schedules. If you have questions, contact your pharmacist or doctor.';
      } else if (messageToSend.toLowerCase().includes('diabetes')) {
        response = 'Common diabetes symptoms include frequent urination, excessive thirst, unexplained weight loss, fatigue, blurred vision, and slow-healing wounds. If you experience these symptoms, consult your healthcare provider for proper testing.';
      } else if (messageToSend.toLowerCase().includes('sleep')) {
        response = 'To improve sleep quality: maintain a regular sleep schedule, create a comfortable sleep environment, limit caffeine and screens before bedtime, and establish a relaxing bedtime routine. If problems persist, consult your doctor.';
      } else {
        response = 'That\'s an interesting question! For specific medical concerns, I recommend consulting with your healthcare provider. They can give you personalized advice based on your health history and current condition.';
      }

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
    speak(t('healthQuestions'));
  }, [speak, t]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex flex-col">
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
            <div className="flex items-center">
              <Brain className="text-purple-600 mr-2" size={24} />
              <h1 className="text-xl font-bold text-gray-800">{t('askQuestion')}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Questions */}
      <div className="max-w-md mx-auto w-full px-4 py-4 border-b border-gray-200 bg-white">
        <p className="text-sm text-gray-600 mb-3">Popular questions:</p>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.slice(0, 3).map((question, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(question)}
              className="text-xs bg-purple-100 text-purple-700 px-3 py-2 rounded-full hover:bg-purple-200 transition-colors"
            >
              {question}
            </button>
          ))}
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
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-800 shadow-md'
                }`}
              >
                <p className="text-base leading-relaxed">{message.message}</p>
                <p className={`text-xs mt-2 ${message.isUser ? 'text-purple-100' : 'text-gray-500'}`}>
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
                placeholder="Ask about health, medication, or daily living..."
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
              />
            </div>
            <VoiceButton onResult={handleVoiceInput} />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim()}
              icon={Send}
              className="p-3 bg-purple-600 hover:bg-purple-700"
            >
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}