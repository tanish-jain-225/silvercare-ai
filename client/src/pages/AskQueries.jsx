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
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">{t('askQueries')}</h1>
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
          <Button onClick={() => handleSendMessage()} icon={Send} size="sm" className="px-3 py-2" aria-label="Send" />
        </div>
        {/* Sample Questions */}
        <div className="mt-6">
          <div className="text-xs sm:text-sm text-gray-500 mb-2">{t('sampleQuestions')}</div>
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