import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Mic, User, Calendar, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const navItems = [
    { icon: Home, label: t('home'), path: '/home' },
    { icon: Calendar, label: t('dailyPlanner'), path: '/daily-planner' },
    { icon: Mic, label: t('voiceAssistant'), path: '/ask-queries', isPrimary: true },
    { icon: Bell, label: t('reminders'), path: '/reminders' },
    { icon: User, label: t('profile'), path: '/profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md z-40">
      <div className="flex justify-around items-center max-w-2xl mx-auto w-full px-1 sm:px-4 py-1 sm:py-2">
        {navItems.map(({ icon: Icon, label, path, isPrimary }) => {
          const isActive = location.pathname === path;
          return isPrimary ? (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center p-2 bg-blue-600 text-white rounded-md shadow-lg w-14 h-14 sm:w-16 sm:h-16 justify-center transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
              aria-label={label}
            >
              <Icon size={28} />
              <span className="text-xs hidden sm:block">{label}</span>
            </button>
          ) : (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                isActive 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs mt-1 font-medium hidden sm:block">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}