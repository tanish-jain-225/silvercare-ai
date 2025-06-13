import React, { useState } from 'react';
import { ArrowLeft, User, Heart, Settings, Globe, LogOut, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useApp } from '../context/AppContext';
import { useVoice } from '../hooks/useVoice';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी (Hindi)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' }
];

export function Profile() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, setUser, language, setLanguage, logout } = useApp();
  const { speak } = useVoice();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  const handleSave = () => {
    if (editedUser) {
      setUser(editedUser);
      setIsEditing(false);
      speak('Profile updated successfully');
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
    const langName = languages.find(l => l.code === newLanguage)?.name || newLanguage;
    speak(`Language changed to ${langName}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  React.useEffect(() => {
    speak('Welcome to your profile. You can view and edit your information here.');
  }, [speak]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/home')}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-800">{t('profile')}</h1>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              size="sm"
              icon={Edit}
            >
              {isEditing ? t('cancel') : t('edit')}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Personal Information */}
        <Card className="mb-6">
          <div className="flex items-center mb-4">
            <User className="text-blue-600 mr-3" size={24} />
            <h3 className="text-lg font-semibold">{t('personalInfo')}</h3>
          </div>
          
          {isEditing ? (
            <div className="space-y-4">
              <Input
                label={t('name')}
                value={editedUser?.name || ''}
                onChange={(e) => setEditedUser(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
              <Input
                label={t('email')}
                value={editedUser?.email || ''}
                onChange={(e) => setEditedUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                type="email"
              />
              <Input
                label={t('age')}
                value={editedUser?.age?.toString() || ''}
                onChange={(e) => setEditedUser(prev => prev ? { ...prev, age: parseInt(e.target.value) || 0 } : null)}
                type="number"
              />
              <Button onClick={handleSave} className="w-full">
                {t('save')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">{t('name')}</p>
                <p className="text-lg font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('email')}</p>
                <p className="text-lg font-medium">{user.email}</p>
              </div>
              {user.age && (
                <div>
                  <p className="text-sm text-gray-600">{t('age')}</p>
                  <p className="text-lg font-medium">{user.age} years</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Health Information */}
        <Card className="mb-6">
          <div className="flex items-center mb-4">
            <Heart className="text-red-600 mr-3" size={24} />
            <h3 className="text-lg font-semibold">{t('healthInfo')}</h3>
          </div>
          
          {user.healthConditions && user.healthConditions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.healthConditions.map((condition, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                >
                  {t(condition)}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No health conditions recorded</p>
          )}
        </Card>

        {/* Settings */}
        <Card className="mb-6">
          <div className="flex items-center mb-4">
            <Settings className="text-gray-600 mr-3" size={24} />
            <h3 className="text-lg font-semibold">{t('settings')}</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center mb-2">
                <Globe className="text-blue-600 mr-2" size={20} />
                <p className="font-medium">{t('changeLanguage')}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      language === lang.code
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-sm font-medium">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="danger"
          icon={LogOut}
          className="w-full"
          size="lg"
        >
          {t('logout')}
        </Button>
      </div>
    </div>
  );
}