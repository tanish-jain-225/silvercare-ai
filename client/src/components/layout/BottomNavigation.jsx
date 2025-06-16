import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Mic, User, BookText, Bell } from "lucide-react";
import { useTranslation } from "react-i18next";

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const navItems = [
    { icon: Home, label: t("home"), path: "/home" },
    { icon: BookText, label: t("Blog"), path: "/blog" },
    {
      icon: Mic,
      label: t("voiceAssistant"),
      path: "/ask-queries",
      isPrimary: true,
    },
    { icon: Bell, label: t("reminders"), path: "/reminders" },
    { icon: User, label: t("profile"), path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-dark-50/80 backdrop-blur-lg border-t border-primary-100/20 dark:border-dark-600/20 shadow-sm z-20">
      <div className="flex justify-between items-center max-w-2xl mx-auto w-full px-3 sm:px-6 py-2">
        {navItems.map(({ icon: Icon, label, path, isPrimary }) => {
          const isActive = location.pathname === path;
          return isPrimary ? (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center p-3 bg-primary-200/95 dark:bg-primary-100/95 backdrop-blur-sm text-white rounded-2xl shadow-lg w-20 h-16 sm:w-24 sm:h-20 justify-center transform hover:scale-105 hover:bg-primary-300 dark:hover:bg-primary-200 transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-primary-200/50 dark:focus:ring-primary-100/50 focus:ring-offset-2 focus:ring-offset-white/80 dark:focus:ring-offset-dark-50/80"
              aria-label={label}
            >
              <Icon size={24} className="drop-shadow-sm" />
              <span className="text-xs mt-1 font-medium hidden sm:block drop-shadow-sm whitespace-nowrap">
                {label}
              </span>
            </button>
          ) : (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-primary-200/50 dark:focus:ring-primary-100/50 focus:ring-offset-2 focus:ring-offset-white/80 dark:focus:ring-offset-dark-50/80 w-20 h-16 sm:w-24 sm:h-20 justify-center ${
                isActive
                  ? "bg-primary-100/80 dark:bg-primary-100/20 text-primary-300 dark:text-primary-100 shadow-sm"
                  : "text-primary-200 dark:text-primary-100/60 hover:text-primary-300 dark:hover:text-primary-100 hover:bg-primary-100/60 dark:hover:bg-primary-100/10"
              }`}
              aria-label={label}
            >
              <Icon size={20} className="drop-shadow-sm" />
              <span className="text-sm font-semibold mt-1 hidden sm:block whitespace-nowrap">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
