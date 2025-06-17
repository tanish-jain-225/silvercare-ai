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
  { code: "bn", name: "Bengali", label: "বাংলা" },
  { code: "fr", name: "French", label: "Français" },
  { code: "es", name: "Spanish", label: "Español" },
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
          className="flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-100 rounded-lg p-1 transition-all hover:scale-105"
        >
          <img
            src="/voice-search.png"
            alt="SilverCare AI Logo"
            className="w-10 h-10"
          />
          <span className="text-lg font-bold text-primary-300 dark:text-primary-100 tracking-tight">
            SilverCareAI
          </span>
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-primary-300 dark:text-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-100 rounded-lg p-2"
          onClick={() => setIsMenuOpen((v) => !v)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-4">
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

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-1 text-primary-300 dark:text-primary-100 font-medium hover:text-primary-200 dark:hover:text-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-100 rounded-lg px-1 py-2 transition-all hover:bg-primary-100/10 dark:hover:bg-primary-100/5"
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
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${i18n.language === lang.code
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
                  className="flex items-center gap-2 text-primary-300 dark:text-primary-100 font-medium hover:text-primary-200 dark:hover:text-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-100 rounded-lg px-1 py-2 transition-all hover:bg-primary-100/10 dark:hover:bg-primary-100/5"
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
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-primary-300 dark:text-primary-100 hover:bg-primary-100/5 dark:hover:bg-primary-100/5"
                      onClick={() => navigateAndClose("/profile")}
                    >
                      Profile
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-primary-300 dark:text-primary-100 hover:bg-primary-100/5 dark:hover:bg-primary-100/5"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden bg-white dark:bg-dark-50 shadow-lg rounded-b-xl py-4 px-6">
          <ul className="space-y-4">
            <li>
              <Link
                to="/home"
                className="block text-primary-300 dark:text-primary-100 hover:text-primary-200 dark:hover:text-primary-200 transition-colors font-medium px-2 py-1 rounded-lg"
                onClick={handleMenuLinkClick}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/emergency"
                className="block text-primary-300 dark:text-primary-100 hover:text-accent-orange dark:hover:text-accent-orange transition-colors font-medium px-2 py-1 rounded-lg"
                onClick={handleMenuLinkClick}
              >
                Emergency
              </Link>
            </li>
            <li>
              <Link
                to="/reminders"
                className="block text-primary-300 dark:text-primary-100 hover:text-primary-200 dark:hover:text-primary-200 transition-colors font-medium px-2 py-1 rounded-lg"
                onClick={handleMenuLinkClick}
              >
                Reminders
              </Link>
            </li>
            <li>
              <Link
                to="/ask-queries"
                className="block text-primary-300 dark:text-primary-100 hover:text-accent-yellow dark:hover:text-accent-yellow transition-colors font-medium px-2 py-1 rounded-lg"
                onClick={handleMenuLinkClick}
              >
                Ask
              </Link>
            </li>
            <li>
              <Link
                to="/blog"
                className="block text-primary-300 dark:text-primary-100 hover:text-primary-200 dark:hover:text-primary-200 transition-colors font-medium px-2 py-1 rounded-lg"
                onClick={handleMenuLinkClick}
              >
                Blog
              </Link>
            </li>
            <li>
              <button
                className="block w-full text-left text-primary-300 dark:text-primary-100 hover:bg-primary-100/5 dark:hover:bg-primary-100/5 py-2 px-2 font-medium rounded-lg"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate("/profile");
                }}
              >
                Profile
              </button>
            </li>
            <li>
              <button
                className="block w-full text-left text-primary-300 dark:text-primary-100 hover:bg-primary-100/5 dark:hover:bg-primary-100/5 py-2 px-2 font-medium rounded-lg"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
            <li className="flex items-center gap-2 p-1">
              {/* Toggle  */}
              <ThemeToggle className="w-full text-left text-primary-300 dark:text-primary-100 hover:bg-primary-100/5 dark:hover:bg-primary-100/5 py-1 px-1 text-sm font-medium rounded-full" />
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
