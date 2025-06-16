import React, { useEffect, useState } from 'react';

const LoadingScreen = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Set display time to 6 seconds
        const timer = setTimeout(() => {
            setIsExiting(true);
            // Add additional delay for fade-out animation
            setTimeout(() => {
                setIsVisible(false);
            }, 2000); // Increased fade-out duration for smoother transition
        }, 6000);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-1000 ${isExiting ? 'opacity-0 backdrop-blur-none' : 'opacity-100 backdrop-blur-xl'
                }`}
            role="status"
            aria-label="Loading screen"
        >
            {/* Animated gradient background with transition */}
            <div className={`absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 animate-gradient-shift transition-opacity duration-1000 ${isExiting ? 'opacity-0' : 'opacity-100'
                }`}></div>

            {/* Blur overlay with transition */}
            <div className={`absolute inset-0 backdrop-blur-xl bg-white/30 transition-all duration-1000 ${isExiting ? 'opacity-0 backdrop-blur-none' : 'opacity-100 backdrop-blur-xl'
                }`}></div>

            {/* Main content container with transition */}
            <div className={`relative flex flex-col items-center space-y-8 p-8 transition-all duration-1000 ${isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}>
                {/* Logo Container with Enhanced Pulse Animation */}
                <div className="relative">
                    <div className={`absolute inset-0 animate-pulse-slow rounded-full bg-blue-200/30 blur-xl transition-opacity duration-1000 ${isExiting ? 'opacity-0' : 'opacity-100'
                        }`}></div>
                    <div className="relative h-24 w-24 rounded-full bg-white/80 p-4 shadow-lg backdrop-blur-sm">
                        {/* Replace this div with your actual logo */}
                        <img src="/voice-search.png" alt="Logo" />
                    </div>
                </div>

                {/* Title and Subtitle with Enhanced Typography */}
                <div className="text-center space-y-3">
                    <h1 className="text-4xl font-bold text-blue-900 animate-fade-in font-poppins">
                        SilverCare AI
                    </h1>
                    <p className="text-lg text-blue-700 animate-fade-in-delay font-poppins">
                        Compassionate care through technology
                    </p>
                </div>

                {/* Enhanced Loading Indicator */}
                <div className="relative w-48 h-1.5 bg-blue-200/50 rounded-full overflow-hidden backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 animate-loading-bar"></div>
                </div>

                {/* Decorative Elements */}
                <div className={`absolute -bottom-4 -right-4 opacity-10 animate-float transition-opacity duration-1000 ${isExiting ? 'opacity-0' : 'opacity-10'
                    }`}>
                    <svg className="w-32 h-32 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                </div>

                {/* Additional decorative elements with transitions */}
                <div className={`absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-blue-200/20 blur-xl animate-pulse-slow transition-opacity duration-1000 ${isExiting ? 'opacity-0' : 'opacity-100'
                    }`}></div>
                <div className={`absolute bottom-1/4 right-1/4 w-20 h-20 rounded-full bg-blue-300/20 blur-xl animate-pulse-slow delay-300 transition-opacity duration-1000 ${isExiting ? 'opacity-0' : 'opacity-100'
                    }`}></div>
            </div>
        </div>
    );
};

export default LoadingScreen; 