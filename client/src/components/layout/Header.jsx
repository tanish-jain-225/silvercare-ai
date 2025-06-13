import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Menu,
  X,
  Globe,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "hi", label: "Hindi" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
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

  return (
    <header className="bg-white shadow-md w-full sticky top-0 z-50">
      <div className="w-full flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 md:py-4">
        {/* Logo and Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-200 rounded mx-2"
        >
          <img
            src="/voice-search.png"
            alt="VoiceBuddy Logo"
            className="w-8 h-8"
          />
          <span className="text-xl font-bold text-gray-800 tracking-tight">
            VoiceBuddy
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-6 px-2">
            <Link to="/" className="hover:text-blue-600">
              Home
            </Link>
            <Link to="/emergency" className="hover:text-blue-600">
              Emergency
            </Link>
            <Link to="/reminders" className="hover:text-blue-600">
              Reminders
            </Link>
            <Link to="/ask-queries" className="hover:text-blue-600">
              Ask
            </Link>
            <Link to="/daily-planner" className="hover:text-blue-600">
              Planner
            </Link>
          </div>
          {/* Language Dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-1 text-gray-700 font-medium hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 rounded px-2 py-1"
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
                className="absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-white py-1 z-50 border border-gray-100"
                role="listbox"
                tabIndex={-1}
              >
                {LANGUAGES.map((lang) => (
                  <li key={lang.code}>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        i18n.language === lang.code
                          ? "text-blue-600 font-bold"
                          : "text-gray-700"
                      } hover:bg-gray-100`}
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
            <div className="relative">
              <button
                className="flex items-center gap-2 text-gray-700 font-medium hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 rounded px-2 py-1"
                onClick={() => setIsMenuOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={isMenuOpen}
                type="button"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <ChevronDown size={16} />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-white py-1 z-50 border border-gray-100">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User size={16} className="mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 hover:text-blue-600 hover:bg-gray-100"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <nav className="flex flex-col gap-1 px-6 py-4">
            <Link
              to="/"
              className="py-2 hover:text-blue-600"
            >
              Home
            </Link>
            <Link
              to="/emergency"
              className="py-2 hover:text-blue-600"
            >
              Emergency
            </Link>
            <Link
              to="/reminders"
              className="py-2 hover:text-blue-600"
            >
              Reminders
            </Link>
            <Link
              to="/ask-queries"
              className="py-2 hover:text-blue-600"
            >
              Ask
            </Link>
            <Link
              to="/daily-planner"
              className="py-2 hover:text-blue-600"
            >
              Planner
            </Link>
            {/* Language Switcher Mobile */}
            <div className="py-2">
              <span className="block text-xs text-gray-500 mb-1">Language</span>
              <div className="flex gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    className={`px-3 py-1 rounded text-sm border focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                      i18n.language === lang.code
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-blue-50"
                    }`}
                    onClick={() => handleLanguageChange(lang.code)}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="py-2 flex items-center text-red-600 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
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
