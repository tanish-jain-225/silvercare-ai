import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('silvercare_theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme !== null) {
            setIsDarkMode(savedTheme === 'dark');
        } else {
            setIsDarkMode(systemPrefersDark);
        }

        setIsLoaded(true);
    }, []);

    // Apply theme to document
    useEffect(() => {
        if (!isLoaded) return;

        const root = document.documentElement;

        // Add theme transition class for smooth switching
        root.classList.add('theme-transition');

        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Remove transition class after animation completes
        const timer = setTimeout(() => {
            root.classList.remove('theme-transition');
        }, 300);

        return () => clearTimeout(timer);
    }, [isDarkMode, isLoaded]);

    // Save theme preference to localStorage
    useEffect(() => {
        if (!isLoaded) return;

        localStorage.setItem('silvercare_theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode, isLoaded]);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e) => {
            // Only update if user hasn't manually set a preference
            const savedTheme = localStorage.getItem('silvercare_theme');
            if (savedTheme === null) {
                setIsDarkMode(e.matches);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    const setTheme = (theme) => {
        setIsDarkMode(theme === 'dark');
    };

    const value = {
        isDarkMode,
        isLoaded,
        toggleTheme,
        setTheme,
        theme: isDarkMode ? 'dark' : 'light'
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}; 