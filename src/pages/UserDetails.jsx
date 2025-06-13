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
        navigate('/home');
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600 rounded-full mb-4">
            <Heart size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('userDetails')}</h1>
          <p className="text-lg text-gray-600">Help us personalize your experience</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                type="number"
                label={t('age')}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                icon={Calendar}
                min="1"
                max="120"
                required
                className="pr-16"
              />
              <div className="absolute right-3 top-12">
                <VoiceButton onResult={handleVoiceAge} />
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-4">
                {t('healthConditions')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {healthConditions.map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => handleConditionToggle(condition)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      selectedConditions.includes(condition)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-sm font-medium">{t(condition)}</div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700"
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