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
  { code: 'hi', name: 'Hindi' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' }
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
    <main className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col items-center justify-center pb-32">
      {/* Profile Card */}
      <div className="w-full max-w-lg mx-auto mt-8 mb-6 p-6 rounded-3xl shadow-2xl bg-white/90 border border-blue-100 relative animate-fade-in">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-blue-300 shadow-lg bg-white"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-5xl font-bold border-4 border-blue-200 shadow-lg">
                <User size={56} />
              </div>
            )}
            <span className="absolute bottom-2 right-2 bg-green-400 border-2 border-white w-5 h-5 rounded-full"></span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">{user.name}</h2>
          <p className="text-gray-500 text-lg">{user.email}</p>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {user.age && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                <span className="font-semibold">{user.age}</span> {t('years', 'years')}
              </span>
            )}
            {user.gender && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm font-medium border border-pink-200">
                {user.gender}
              </span>
            )}
          </div>
          {user.address && (
            <div className="mt-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 text-center text-sm max-w-xs shadow-sm">
              <span className="font-medium text-gray-500">{t('address', 'Address')}: </span>{user.address}
            </div>
          )}
        </div>
      </div>
      {/* Details Section */}
      <section className="container mx-auto w-full max-w-lg px-4 py-4">
        {/* Health Information */}
        <Card className="mb-6 animate-fade-in-up">
          <div className="flex items-center mb-4">
            <Heart className="text-red-600 mr-3" size={24} aria-hidden="true" />
            <h3 className="text-lg font-semibold">{t('healthInfo')}</h3>
          </div>
          {user.healthCondition ? (
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                {t(user.healthCondition)}
              </span>
            </div>
          ) : (
            <p className="text-gray-600">{t('noHealthConditions', 'No health conditions recorded')}</p>
          )}
          {user.currentMedicalStatus && (
            <div className="mt-3">
              <p className="text-sm text-gray-600">{t('currentMedicalStatus', 'Current Medical Status')}</p>
              <p className="text-lg font-medium">{user.currentMedicalStatus}</p>
            </div>
          )}
          {user.medicalCertificates && (
            <div className="mt-3">
              <p className="text-sm text-gray-600">{t('medicalCertificates', 'Medical Certificates')}</p>
              <a href={user.medicalCertificates} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{t('viewCertificate', 'View Certificate')}</a>
            </div>
          )}
        </Card>
        {/* Emergency Contacts */}
        {user.emergencyContacts && user.emergencyContacts.length > 0 && (
          <Card className="mb-6 animate-fade-in-up">
            <div className="flex items-center mb-4">
              <Settings className="text-yellow-600 mr-3" size={24} aria-hidden="true" />
              <h3 className="text-lg font-semibold">{t('emergencyContacts', 'Emergency Contacts')}</h3>
            </div>
            <ul className="space-y-2">
              {user.emergencyContacts.map((contact, idx) => (
                <li key={idx} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 bg-yellow-50 rounded-lg px-4 py-2">
                  <span className="font-medium text-yellow-800">{contact.name}</span>
                  <span className="text-yellow-700">{contact.number}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {/* Language Selection */}
        <Card className="mb-6 animate-fade-in-up">
          <div className="space-y-4">
            <div>
              <div className="flex items-center mb-2">
                <Globe className="text-blue-600 mr-2" size={20} aria-hidden="true" />
                <p className="font-medium">{t('changeLanguage')}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`p-3 rounded-lg border-2 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                      language === lang.code
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                    aria-label={lang.name}
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
          className="w-full animate-fade-in-up"
          size="lg"
          icon={LogOut}
          ariaLabel={t('logout')}
        >
          {t('logout')}
        </Button>
      </section>
    </main>
  );
}