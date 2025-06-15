import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';

const INTEREST_CATEGORIES = [
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { id: 'general', label: 'General', icon: '📰' },
    { id: 'health', label: 'Health', icon: '🏥' },
    { id: 'science', label: 'Science', icon: '🔬' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'technology', label: 'Technology', icon: '💻' }
];

export function InterestSelectionModal({
    isOpen,
    onClose,
    onSave,
    initialInterests = [],
    title = "Select Your Interests",
    description = "Choose the topics you're interested in to personalize your news feed."
}) {
    const [selectedInterests, setSelectedInterests] = useState(initialInterests);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setSelectedInterests(initialInterests);
    }, [initialInterests]);

    const handleInterestToggle = (interestId) => {
        setSelectedInterests(prev => {
            if (prev.includes(interestId)) {
                return prev.filter(id => id !== interestId);
            } else {
                return [...prev, interestId];
            }
        });
    };

    const handleSave = async () => {
        if (selectedInterests.length === 0) {
            alert('Please select at least one interest category.');
            return;
        }

        setIsLoading(true);
        try {
            await onSave(selectedInterests);
            onClose();
        } catch (error) {
            console.error('Error saving interests:', error);
            alert('Failed to save interests. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                            <p className="text-gray-600 mt-2">{description}</p>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isLoading}
                            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="grid grid-cols-2 gap-3">
                        {INTEREST_CATEGORIES.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleInterestToggle(category.id)}
                                disabled={isLoading}
                                className={`
                  relative p-4 rounded-lg border-2 transition-all duration-200 text-left
                  ${selectedInterests.includes(category.id)
                                        ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                    }
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{category.icon}</span>
                                    <span className={`font-medium ${selectedInterests.includes(category.id)
                                            ? 'text-blue-700'
                                            : 'text-gray-700'
                                        }`}>
                                        {category.label}
                                    </span>
                                </div>

                                {/* Checkmark for selected items */}
                                {selectedInterests.includes(category.id) && (
                                    <div className="absolute top-2 right-2">
                                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Selection count */}
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                            {selectedInterests.length} of {INTEREST_CATEGORIES.length} categories selected
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <div className="flex space-x-3">
                        <Button
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isLoading || selectedInterests.length === 0}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Saving...
                                </div>
                            ) : (
                                'Save Interests'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
} 