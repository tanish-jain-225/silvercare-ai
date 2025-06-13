import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { VoiceButton } from '../components/voice/VoiceButton';
import { useApp } from '../context/AppContext';
import { useVoice } from '../hooks/useVoice';

const healthConditions = [
  'diabetes',
  'bloodPressure',
  'heartDisease',
  'arthritis'
];

export function UserDetails() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, setUser } = useApp();
  const { speak } = useVoice();
  const [age, setAge] = useState('');
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleConditionToggle = (condition) => {
    setSelectedConditions(prev => 
      prev.includes(condition) 
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update user with health details
      if (user) {
        const updatedUser = {
          ...user,
          age: parseInt(age),
          healthConditions: selectedConditions
        };
        setUser(updatedUser);
        speak('Your health details have been saved successfully.');
        navigate('/');
      }
    } catch (error) {
      console.error('Error saving user details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceAge = (text) => {
    const ageMatch = text.match(/\d+/);
    if (ageMatch) {
      setAge(ageMatch[0]);
    }
  };

  React.useEffect(() => {
    speak('Please tell us a bit about yourself to personalize your experience.');
  }, [speak]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-2 sm:p-4">
      <div className="container mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl px-2 sm:px-4">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-14 sm:w-16 md:w-20 bg-purple-600 rounded-full mb-2 sm:mb-3 md:mb-4">
            <Heart size={28} className="text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2 break-words">{t('userDetails')}</h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 break-words">Help us personalize your experience</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 md:p-8 w-full">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-7">
            {/* Age Field */}
            <div className="relative flex items-center min-w-0">
              <Input
                type="number"
                label={t('age')}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                icon={Calendar}
                min="1"
                max="120"
                required
                className="pr-14 sm:pr-16 md:pr-20 min-w-0"
              />
              <div className="absolute inset-y-0 right-4 top-4 flex items-center pointer-events-auto">
                <VoiceButton onResult={handleVoiceAge} size="sm" className="!w-9 sm:!w-10" />
              </div>
            </div>

            {/* Health Conditions */}
            <div>
              <label className="block text-sm sm:text-base md:text-lg font-medium text-gray-700 mb-2 sm:mb-3 md:mb-4">
                {t('healthConditions')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                {healthConditions.map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => handleConditionToggle(condition)}
                    className={`p-2 sm:p-3 md:p-4 rounded-xl border-2 text-left transition-all duration-200 w-full min-w-0 break-words ${
                      selectedConditions.includes(condition)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-xs sm:text-sm md:text-base font-medium break-words">{t(condition)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 mt-2"
              size="xl"
            >
              {isLoading ? 'Saving...' : t('saveDetails')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}