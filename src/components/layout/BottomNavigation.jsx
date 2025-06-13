import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Mic, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { icon: Home, label: t('home'), path: '/home' },
    { icon: Mic, label: t('voiceAssistant'), path: '/voice' },
    { icon: User, label: t('profile'), path: '/profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs mt-1 font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}