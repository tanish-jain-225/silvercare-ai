import React from 'react';

const LoadingScreen = () => {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-1000"
            role="status"
            aria-label="Loading screen"
        >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 animate-gradient-shift"></div>

            {/* Blur overlay */}
            <div className="absolute inset-0 backdrop-blur-xl bg-white/30"></div>

            {/* Main content container */}
            <div className="relative flex flex-col items-center space-y-8 p-8">
                {/* Logo Container with Enhanced Pulse Animation */}
                <div className="relative">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-blue-200/30 blur-xl"></div>
                    <div className="relative h-24 w-24 rounded-full bg-white/80 p-4 shadow-lg backdrop-blur-sm">
                        <img src="/voice-search.png" alt="SilverCare AI Logo" className="w-full h-full object-contain" />
                    </div>
                </div>

                {/* Title and Subtitle */}
                <div className="text-center space-y-3">
                    <h1 className="text-4xl font-bold text-blue-900 animate-pulse font-poppins">
                        SilverCare AI
                    </h1>
                    <p className="text-lg text-blue-700 animate-pulse font-poppins">
                        Compassionate care through technology
                    </p>
                </div>

                {/* Enhanced Loading Indicator */}
                <div className="relative w-48 h-1.5 bg-blue-200/50 rounded-full overflow-hidden backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 animate-pulse"></div>
                </div>

                {/* Loading Spinner */}
                <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="text-blue-600">Loading...</span>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen; 