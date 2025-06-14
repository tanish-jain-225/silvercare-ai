import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const RootLayout = ({ children }) => {
    const { isDarkMode, isLoaded } = useTheme();

    // Apply theme classes to body element for global coverage
    React.useEffect(() => {
        if (!isLoaded) return;

        const body = document.body;

        // Remove any existing theme classes
        body.classList.remove('light-theme', 'dark-theme');

        // Add current theme class
        if (isDarkMode) {
            body.classList.add('dark-theme');
        } else {
            body.classList.add('light-theme');
        }
    }, [isDarkMode, isLoaded]);

    return (
        <div className={`
      min-h-screen w-full
      bg-white dark:bg-gray-900
      text-gray-900 dark:text-gray-100
      transition-colors duration-300
      ${isLoaded ? 'theme-loaded' : 'theme-loading'}
    `}>
            {children}
        </div>
    );
}; 