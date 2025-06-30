import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Menu, X, Globe, ChevronDown, LogOut, User } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { ThemeToggle } from "../ui/ThemeToggle";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useApp();

  const handleLogout = () => {
    // Reset Theme and icon - this will ensure the theme is set to light on logout and the icon is set to moon
    // Give a small delay to ensure the theme is set before logging out - sleep is not recommended, but here we use a timeout to ensure the theme is set
    setTimeout(() => {
      document.documentElement.classList.remove("dark"); // Remove dark class
      document.documentElement.classList.add("light"); // Add light class
      document.documentElement.style.setProperty("--theme-color", "#ffffff"); // Reset theme color to light
      document.documentElement.style.setProperty("--theme-icon", "moon"); // Reset theme icon to moon with Light theme
    }, 1000); // Reset theme to light before actually logging out - 1 second delay

    // Call logout function from context
    logout();
    navigate("/login");
    setIsMenuOpen(false);
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
    <header className="bg-white dark:bg-dark-50 shadow-lg dark:shadow-dark-100/20 w-full sticky top-0 z-50 border-b border-primary-100/20 dark:border-dark-600/20 backdrop-blur-sm m-0 p-2">
      <div className="w-full flex items-center justify-between px-0 sm:px-0 py-0 m-0">
        {/* Logo and Brand */}
        <Link
          to="/home"
          className="flex items-center gap-1 focus:outline-none  rounded-lg p-1 transition-all hover:scale-105"
        >
          <img
            src="/voice-search.png"
            alt="SilverCareAI Logo"
            className="w-10 h-10"
          />
          <span className="text-lg font-bold text-primary-300 dark:text-primary-100 tracking-tight">
            SilverCareAI
          </span>
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-primary-300 dark:text-primary-100 focus:outline-none rounded-lg p-2"
          onClick={() => setIsMenuOpen((v) => !v)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/home"
              className="text-primary-300 dark:text-primary-100 hover:text-primary-400 dark:hover:text-primary-200 hover:bg-primary-100/10 dark:hover:bg-primary-100/10 transition-colors font-medium rounded-lg px-2 py-1"
            >
              Home
            </Link>
            <Link
              to="/emergency"
              className="text-primary-300 dark:text-primary-100 hover:text-primary-400 dark:hover:text-primary-200 hover:bg-primary-100/10 dark:hover:bg-primary-100/10 transition-colors font-medium rounded-lg px-2 py-1"
            >
              Emergency
            </Link>
            <Link
              to="/reminders"
              className="text-primary-300 dark:text-primary-100 hover:text-primary-400 dark:hover:text-primary-200 hover:bg-primary-100/10 dark:hover:bg-primary-100/10 transition-colors font-medium rounded-lg px-2 py-1"
            >
              Reminders
            </Link>
            <Link
              to="/ask-queries"
              className="text-primary-300 dark:text-primary-100 hover:text-primary-400 dark:hover:text-primary-200 hover:bg-primary-100/10 dark:hover:bg-primary-100/10 transition-colors font-medium rounded-lg px-2 py-1"
            >
              Ask
            </Link>
            <Link
              to="/blog"
              className="text-primary-300 dark:text-primary-100 hover:text-primary-400 dark:hover:text-primary-200 hover:bg-primary-100/10 dark:hover:bg-primary-100/10 transition-colors font-medium rounded-lg px-2 py-1"
            >
              Blog
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Profile Dropdown */}
            {user && (
              <div className="relative flex items-center" ref={menuRef}>
                <button
                  className="flex items-center gap-2 text-primary-300 dark:text-primary-100 font-medium hover:text-primary-200 dark:hover:text-primary-100 focus:outline-none rounded-lg px-1 py-2 transition-all hover:bg-primary-100/10 dark:hover:bg-primary-100/5"
                  onClick={() => setIsMenuOpen((v) => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={isMenuOpen}
                  type="button"
                >
                  {user.profilePicture && user.profilePicture.data ? (
                    <img
                      src={user.profilePicture.data}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-primary-200 dark:border-primary-100 shadow-sm"
                    />
                  ) : user.profileImage ? (
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
                      className="block w-full text-left px-4 py-2 text-sm text-primary-300 dark:text-primary-100 hover:bg-primary-100/10 dark:hover:bg-primary-100/10 hover:text-primary-400 dark:hover:text-primary-200 rounded-lg"
                      onClick={() => navigateAndClose("/profile")}
                    >
                      Profile
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-primary-300 dark:text-primary-100 hover:bg-primary-100/10 dark:hover:bg-primary-100/10 dark:hover:text-red-500 hover:text-red-500 rounded-lg"
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
                className="block text-primary-300 dark:text-primary-100 hover:text-primary-400 dark:hover:text-primary-200 hover:bg-primary-100/10 dark:hover:bg-primary-100/10 transition-colors font-medium px-2 py-1 rounded-lg"
                onClick={handleMenuLinkClick}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/emergency"
                className="block text-primary-300 dark:text-primary-100 hover:text-primary-400 dark:hover:text-primary-200 hover:bg-primary-100/10 dark:hover:bg-primary-100/10 transition-colors font-medium px-2 py-1 rounded-lg"
                onClick={handleMenuLinkClick}
              >
                Emergency
              </Link>
            </li>
            <li>
              <Link
                to="/reminders"
                className="block text-primary-300 dark:text-primary-100 hover:text-primary-400 dark:hover:text-primary-200 hover:bg-primary-100/10 dark:hover:bg-primary-100/10 transition-colors font-medium px-2 py-1 rounded-lg"
                onClick={handleMenuLinkClick}
              >
                Reminders
              </Link>
            </li>
            <li>
              <Link
                to="/ask-queries"
                className="block text-primary-300 dark:text-primary-100 hover:text-primary-400 dark:hover:text-primary-200 hover:bg-primary-100/10 dark:hover:bg-primary-100/10 transition-colors font-medium px-2 py-1 rounded-lg"
                onClick={handleMenuLinkClick}
              >
                Ask
              </Link>
            </li>
            <li>
              <Link
                to="/blog"
                className="block text-primary-300 dark:text-primary-100 hover:text-primary-400 dark:hover:text-primary-200 hover:bg-primary-100/10 dark:hover:bg-primary-100/10 transition-colors font-medium px-2 py-1 rounded-lg"
                onClick={handleMenuLinkClick}
              >
                Blog
              </Link>
            </li>
            <li>
              <button
                className="block w-full text-left text-primary-300 dark:text-primary-100 hover:bg-primary-100/10 dark:hover:bg-primary-100/10 hover:text-primary-400 dark:hover:text-primary-200 py-2 px-2 font-medium rounded-lg"
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
                className="block w-full text-left text-primary-300 dark:text-primary-100 hover:bg-primary-100/10 dark:hover:bg-primary-100/10 hover:text-red-500 dark:hover:text-red-500 py-2 px-2 font-medium rounded-lg"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
            <li className="flex items-center gap-2 p-1">
              {/* Toggle  */}
              <ThemeToggle className="w-full text-left text-primary-300 dark:text-primary-100 hover:bg-primary-100/10 dark:hover:bg-primary-100/10 py-1 px-1 text-sm font-medium rounded-full" />
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
