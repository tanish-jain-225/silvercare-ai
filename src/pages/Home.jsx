import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, AlertTriangle, MessageSquare, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/ui/Card';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { useApp } from '../context/AppContext';
import { useVoice } from '../hooks/useVoice';

export function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useApp();
  const { speak } = useVoice();

  const features = [
    {
      icon: Calendar,
      title: t('dailyPlanner'),
      description: 'Plan your day with voice assistance',
      path: '/daily-planner',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Clock,
      title: t('reminders'),
      description: 'Set and manage your reminders',
      path: '/reminders',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: AlertTriangle,
      title: t('emergency'),
      description: 'Quick access to emergency help',
      path: '/emergency',
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: MessageSquare,
      title: t('askQueries'),
      description: 'Ask health and life questions',
      path: '/ask-queries',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const handleFeatureClick = (path, title) => {
    speak(`Opening ${title}`);
    navigate(path);
  };

  React.useEffect(() => {
    if (user) {
      speak(t('welcome', { name: user.name }));
    }
  }, [user, speak, t]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {user ? t('welcome', { name: user.name }) : 'Welcome'}
              </h1>
              <p className="text-gray-600">How can I help you today?</p>
            </div>
            <button className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
              <Bell size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature) => (
            <Card
              key={feature.path}
              onClick={() => handleFeatureClick(feature.path, feature.title)}
              className="h-32 cursor-pointer hover:shadow-lg active:scale-95 transition-all duration-200"
            >
              <div className="text-center h-full flex flex-col justify-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 mx-auto ${feature.color}`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-tight">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Health Check */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Daily Health Check</h3>
              <p className="text-green-100 mb-4">How are you feeling today?</p>
              <div className="flex justify-center space-x-4">
                <button className="flex flex-col items-center p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all">
                  <span className="text-2xl mb-1">😊</span>
                  <span className="text-sm">Great</span>
                </button>
                <button className="flex flex-col items-center p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all">
                  <span className="text-2xl mb-1">😐</span>
                  <span className="text-sm">Okay</span>
                </button>
                <button className="flex flex-col items-center p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all">
                  <span className="text-2xl mb-1">😔</span>
                  <span className="text-sm">Not Good</span>
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}