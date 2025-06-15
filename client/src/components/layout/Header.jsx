import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X, Globe, ChevronDown, LogOut, User } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { ThemeToggle } from "../ui/ThemeToggle";

const LANGUAGES = [
  { code: "en", name: "English", label: "English" },
  { code: "hi", name: "Hindi", label: "हिंदी" },
  { code: "mr", name: "Marathi", label: "मराठी" },
  { code: "gu", name: "Gujarati", label: "ગુજરાતી" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, logout } = useApp();

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMenuOpen(false);
  };

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    setIsLangOpen(false);
  };

  const navigateAndClose = (path) => {
    setIsMenuOpen(false);
    setTimeout(() => navigate(path), 50);
  };

  const handleMenuLinkClick = () => setIsMenuOpen(false);

  // Add effect to close desktop dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md dark:shadow-gray-800/20 w-full sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="w-full flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 md:py-4">
        {/* Logo and Brand */}
        <Link
          to="/home"
          className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 rounded mx-2"
        >
          <img
            src="/voice-search.png"
            alt="SilverCare AI Logo"
            className="w-8 h-8"
          />
          <span className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
            SilverCare AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-6 px-2">
            <Link
              to="/home"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/emergency"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Emergency
            </Link>
            <Link
              to="/reminders"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Reminders
            </Link>
            <Link
              to="/ask-queries"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Ask
            </Link>
            <Link
              to="/blog"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Blog
            </Link>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Language Dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-1 text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 rounded px-2 py-1 transition-colors"
              onClick={() => setIsLangOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={isLangOpen}
              type="button"
            >
              <Globe size={18} />
              <span className="hidden sm:inline">
                {LANGUAGES.find((l) => l.code === i18n.language)?.label ||
                  "Language"}
              </span>
              <ChevronDown size={14} />
            </button>
            {isLangOpen && (
              <ul
                className="absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-white dark:bg-gray-800 py-1 z-50 border border-gray-100 dark:border-gray-700"
                role="listbox"
                tabIndex={-1}
              >
                {LANGUAGES.map((lang) => (
                  <li key={lang.code}>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                        i18n.language === lang.code
                          ? "text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/20"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => handleLanguageChange(lang.code)}
                      role="option"
                      aria-selected={i18n.language === lang.code}
                      type="button"
                    >
                      {lang.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* User Profile Dropdown */}
          {user && (
            <div className="relative flex items-center" ref={menuRef}>
              <button
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 rounded px-2 py-1 transition-colors"
                onClick={() => setIsMenuOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={isMenuOpen}
                type="button"
              >
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-200 dark:border-blue-800 shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                    <User size={22} />
                  </div>
                )}
                <ChevronDown size={16} />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-md shadow-lg bg-white dark:bg-gray-800 py-1 z-50 border border-gray-100 dark:border-gray-700">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={16} className="mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    type="button"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Mobile Profile and Menu Combined */}
        <div className="flex md:hidden items-center gap-2">
          {/* Theme Toggle for Mobile */}
          <ThemeToggle />

          <div
            className="flex items-center gap-1 rounded-full border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 shadow-sm p-1 cursor-pointer transition hover:shadow-md"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={isMenuOpen}
          >
            {user && user.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                <User size={22} />
              </div>
            )}
            {isMenuOpen ? (
              <X size={28} className="text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu size={28} className="text-gray-700 dark:text-gray-300" />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute right-2 top-16 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shadow-lg rounded-xl z-50">
          <nav className="flex flex-col gap-1 px-6 py-4">
            <Link
              to="/home"
              className="py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={handleMenuLinkClick}
            >
              Home
            </Link>
            <Link
              to="/emergency"
              className="py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={handleMenuLinkClick}
            >
              Emergency
            </Link>
            <Link
              to="/reminders"
              className="py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={handleMenuLinkClick}
            >
              Reminders
            </Link>
            <Link
              to="/ask-queries"
              className="py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={handleMenuLinkClick}
            >
              Ask
            </Link>
            <Link
              to="/blog"
              className="py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={handleMenuLinkClick}
            >
              Planner
            </Link>
            {/* Language Switcher Mobile */}
            <div className="py-2">
              <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Language
              </span>
              <div className="flex gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    className={`px-3 py-1 rounded text-sm border focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-colors ${
                      i18n.language === lang.code
                        ? "bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700"
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    }`}
                    onClick={() => handleLanguageChange(lang.code)}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                handleMenuLinkClick();
                handleLogout();
              }}
              className="py-2 flex items-center text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-colors"
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
