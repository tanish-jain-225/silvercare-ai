import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Mic, User, BookText, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const navItems = [
    { icon: Home, label: t('home'), path: '/home' },
    { icon: BookText, label: t('Blog'), path: '/blog' },
    { icon: Mic, label: t('voiceAssistant'), path: '/ask-queries', isPrimary: true },
    { icon: Bell, label: t('reminders'), path: '/reminders' },
    { icon: User, label: t('profile'), path: '/profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-100/50 dark:border-gray-700/50 shadow-sm z-20">
      {/* Reduced py-4 to py-2 or py-3 */}
      <div className="flex justify-between items-center max-w-2xl mx-auto w-full px-3 sm:px-6 py-2">
        {navItems.map(({ icon: Icon, label, path, isPrimary }) => {
          const isActive = location.pathname === path;
          return isPrimary ? (
            <button
              key={path}
              onClick={() => navigate(path)}
              // Reduced h-20 to h-16 and sm:h-24 to sm:h-20
              className="flex flex-col items-center p-3 bg-indigo-500/95 dark:bg-indigo-600/95 backdrop-blur-sm text-white rounded-2xl shadow-lg w-20 h-16 sm:w-24 sm:h-20 justify-center transform hover:scale-105 hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-200/50 dark:focus:ring-indigo-800/50 focus:ring-offset-2 focus:ring-offset-white/80 dark:focus:ring-offset-gray-900/80"
              aria-label={label}
            >
              {/* Reduced icon size from 28 to 24 */}
              <Icon size={24} className="drop-shadow-sm" />
              <span className="text-xs mt-1 font-medium hidden sm:block drop-shadow-sm whitespace-nowrap">{label}</span>
            </button>
          ) : (
            <button
              key={path}
              onClick={() => navigate(path)}
              // Reduced h-20 to h-16 and sm:h-24 to sm:h-20
              className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-200/50 dark:focus:ring-indigo-800/50 focus:ring-offset-2 focus:ring-offset-white/80 dark:focus:ring-offset-gray-900/80 w-20 h-16 sm:w-24 sm:h-20 justify-center ${isActive
                  ? 'bg-indigo-50/80 dark:bg-indigo-900/80 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-900/60'
                }`}
            >
              {/* Reduced icon size from 24 to 20 */}
              <Icon size={20} className="drop-shadow-sm" />
              <span className="text-sm font-semibold mt-1 hidden sm:block whitespace-nowrap">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}