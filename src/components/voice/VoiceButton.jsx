import React from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useVoice } from '../../hooks/useVoice';

export function VoiceButton({ onResult, language = 'en-US', className = '' }) {
  const { isListening, isSpeaking, listen, stop } = useVoice();

  const handleClick = async () => {
    if (isListening) {
      stop();
      return;
    }

    try {
      const result = await listen(language);
      if (result && onResult) {
        onResult(result);
      }
    } catch (error) {
      console.error('Voice recognition error:', error);
    }
  };

  const getIcon = () => {
    if (isSpeaking) return Volume2;
    if (isListening) return MicOff;
    return Mic;
  };

  const Icon = getIcon();
  
  return (
    <button
      onClick={handleClick}
      disabled={isSpeaking}
      className={`
        inline-flex items-center justify-center w-12 h-12 rounded-full
        ${isListening 
          ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
          : 'bg-blue-600 hover:bg-blue-700 text-white'
        }
        ${isSpeaking ? 'bg-green-600' : ''}
        transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <Icon size={20} />
    </button>
  );
}