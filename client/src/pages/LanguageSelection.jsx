import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useApp } from '../context/AppContext';
import { voiceService } from '../utils/voice';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' }
];

export function LanguageSelection() {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const { setLanguage } = useApp();
  const [selectedLanguage, setSelectedLanguage] = React.useState('en');

  const handleLanguageSelect = (languageCode) => {
    setSelectedLanguage(languageCode);
    setLanguage(languageCode);
    i18n.changeLanguage(languageCode);
  };

  const handleContinue = () => {
    const selectedLang = languages.find(lang => lang.code === selectedLanguage);
    if (selectedLang) {
      voiceService.speak(`Language set to ${selectedLang.name}`);
    }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 sm:w-20 bg-blue-600 rounded-full mb-3 sm:mb-4">
            <Globe size={32} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">SilverCare AI</h1>
          <p className="text-lg sm:text-xl text-gray-600">{t('selectLanguage')}</p>
        </div>

        <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
          {languages.map((language) => (
            <Card
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              className={`cursor-pointer transition-all duration-200 ${selectedLanguage === language.code
                ? 'ring-4 ring-blue-200 border-blue-500 bg-blue-50'
                : 'hover:border-blue-300'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <span className="text-base sm:text-lg font-medium text-gray-800">{language.name}</span>
                </div>
                {selectedLanguage === language.code && (
                  <ChevronRight className="text-blue-600" size={20} />
                )}
              </div>
            </Card>
          ))}
        </div>

        <Button
          onClick={handleContinue}
          className="w-full"
          size="xl"
        >
          {t('continue')}
        </Button>
      </div>
    </div>
  );
}