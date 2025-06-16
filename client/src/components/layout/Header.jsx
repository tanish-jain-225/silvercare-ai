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
      // Only handle click outside for desktop view (md and above)
      if (
        window.innerWidth >= 768 &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
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
    <header className="bg-white dark:bg-dark-50 shadow-lg dark:shadow-dark-100/20 w-full sticky top-0 z-50 border-b border-primary-100/20 dark:border-dark-600/20 backdrop-blur-sm">
      <div className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        {/* Logo and Brand */}
        <Link
          to="/home"
          className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-100 rounded-lg p-1 transition-all hover:scale-105"
        >
          <img
            src="/voice-search.png"
            alt="SilverCare AI Logo"
            className="w-10 h-10"
          />
          <span className="text-xl font-bold text-primary-300 dark:text-primary-100 tracking-tight">
            SilverCare AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-8 px-4">
            <Link
              to="/home"
              className="text-primary-300 dark:text-primary-100 hover:text-primary-200 dark:hover:text-primary-200 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/emergency"
              className="text-primary-300 dark:text-primary-100 hover:text-accent-orange dark:hover:text-accent-orange transition-colors font-medium"
            >
              Emergency
            </Link>
            <Link
              to="/reminders"
              className="text-primary-300 dark:text-primary-100 hover:text-primary-200 dark:hover:text-primary-200 transition-colors font-medium"
            >
              Reminders
            </Link>
            <Link
              to="/ask-queries"
              className="text-primary-300 dark:text-primary-100 hover:text-accent-yellow dark:hover:text-accent-yellow transition-colors font-medium"
            >
              Ask
            </Link>
            <Link
              to="/blog"
              className="text-primary-300 dark:text-primary-100 hover:text-primary-200 dark:hover:text-primary-200 transition-colors font-medium"
            >
              Blog
            </Link>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Language Dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-2 text-primary-300 dark:text-primary-100 font-medium hover:text-primary-200 dark:hover:text-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-100 rounded-lg px-3 py-2 transition-all hover:bg-primary-100/10 dark:hover:bg-primary-100/5"
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
              <ChevronDown
                size={14}
                className="transition-transform duration-200"
                style={{
                  transform: isLangOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>
            {isLangOpen && (
              <ul
                className="absolute right-0 mt-2 w-40 rounded-xl shadow-lg bg-white dark:bg-dark-50 py-2 z-50 border border-primary-100/20 dark:border-dark-600/20 backdrop-blur-sm"
                role="listbox"
                tabIndex={-1}
              >
                {LANGUAGES.map((lang) => (
                  <li key={lang.code}>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                        i18n.language === lang.code
                          ? "text-primary-200 dark:text-primary-100 font-bold bg-primary-100/10 dark:bg-primary-100/5"
                          : "text-primary-300 dark:text-primary-100 hover:bg-primary-100/5 dark:hover:bg-primary-100/5"
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
                className="flex items-center gap-2 text-primary-300 dark:text-primary-100 font-medium hover:text-primary-200 dark:hover:text-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-100 rounded-lg px-3 py-2 transition-all hover:bg-primary-100/10 dark:hover:bg-primary-100/5"
                onClick={() => setIsMenuOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={isMenuOpen}
                type="button"
              >
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-primary-200 dark:border-primary-100 shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-100/20 dark:bg-primary-100/10 flex items-center justify-center text-primary-200 dark:text-primary-100 font-bold">
                    <User size={22} />
                  </div>
                )}
                <ChevronDown
                  size={16}
                  className="transition-transform duration-200"
                  style={{
                    transform: isMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg bg-white dark:bg-dark-50 py-2 z-50 border border-primary-100/20 dark:border-dark-600/20 backdrop-blur-sm">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-primary-300 dark:text-primary-100 hover:bg-primary-100/10 dark:hover:bg-primary-100/5 transition-colors"
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
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-accent-orange dark:text-accent-orange hover:bg-primary-100/10 dark:hover:bg-primary-100/5 transition-colors"
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
        <div className="flex md:hidden items-center gap-3">
          {/* Theme Toggle for Mobile */}
          <ThemeToggle />

          <div
            className="flex items-center gap-2 rounded-xl border border-primary-100/20 dark:border-dark-600/20 bg-white dark:bg-dark-50 shadow-sm p-2 cursor-pointer transition-all hover:shadow-md hover:scale-105"
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
              <div className="w-8 h-8 rounded-full bg-primary-100/20 dark:bg-primary-100/10 flex items-center justify-center text-primary-200 dark:text-primary-100 font-bold">
                <User size={22} />
              </div>
            )}
            {isMenuOpen ? (
              <X size={24} className="text-primary-300 dark:text-primary-100" />
            ) : (
              <Menu
                size={24}
                className="text-primary-300 dark:text-primary-100"
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute right-4 top-16 bg-white dark:bg-dark-50 border border-primary-100/20 dark:border-dark-600/20 shadow-lg rounded-xl z-50 backdrop-blur-sm">
          <nav className="flex flex-col gap-1 px-6 py-4">
            <Link
              to="/home"
              className="py-2 text-primary-300 dark:text-primary-100 hover:text-primary-200 dark:hover:text-primary-200 transition-colors font-medium"
              onClick={handleMenuLinkClick}
            >
              Home
            </Link>
            <Link
              to="/emergency"
              className="py-2 text-primary-300 dark:text-primary-100 hover:text-accent-orange dark:hover:text-accent-orange transition-colors font-medium"
              onClick={handleMenuLinkClick}
            >
              Emergency
            </Link>
            <Link
              to="/reminders"
              className="py-2 text-primary-300 dark:text-primary-100 hover:text-primary-200 dark:hover:text-primary-200 transition-colors font-medium"
              onClick={handleMenuLinkClick}
            >
              Reminders
            </Link>
            <Link
              to="/ask-queries"
              className="py-2 text-primary-300 dark:text-primary-100 hover:text-accent-yellow dark:hover:text-accent-yellow transition-colors font-medium"
              onClick={handleMenuLinkClick}
            >
              Ask
            </Link>
            <Link
              to="/blog"
              className="py-2 text-primary-300 dark:text-primary-100 hover:text-primary-200 dark:hover:text-primary-200 transition-colors font-medium"
              onClick={handleMenuLinkClick}
            >
              Blog
            </Link>
            {/* Language Switcher Mobile */}
            <div className="py-3">
              <span className="block text-xs text-primary-200 dark:text-primary-100 mb-2 font-medium">
                Language
              </span>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    className={`px-3 py-1.5 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-100 transition-all ${
                      i18n.language === lang.code
                        ? "bg-primary-200 dark:bg-primary-100 text-white border-primary-200 dark:border-primary-100"
                        : "bg-white dark:bg-dark-50 text-primary-300 dark:text-primary-100 border-primary-100/20 dark:border-dark-600/20 hover:bg-primary-100/10 dark:hover:bg-primary-100/5"
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
              className="py-2 flex items-center text-accent-orange dark:text-accent-orange hover:bg-primary-100/10 dark:hover:bg-primary-100/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-100 transition-colors"
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
