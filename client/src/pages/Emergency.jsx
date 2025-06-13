import React, { useState } from 'react';
import { ArrowLeft, Phone, Users, MapPin, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useVoice } from '../hooks/useVoice';
import { useApp } from '../context/AppContext';

export function Emergency() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { speak } = useVoice();
  const { user } = useApp();
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  const emergencyContacts = [
    { id: '1', name: 'Dr. Smith', phone: '+1-555-0123', relationship: 'Doctor' },
    { id: '2', name: 'John (Son)', phone: '+1-555-0124', relationship: 'Family' },
    { id: '3', name: 'Emergency Services', phone: '911', relationship: 'Emergency' }
  ];

  const handleEmergencyCall = () => {
    setIsEmergencyActive(true);
    speak('Emergency help is being activated. Stay calm, help is on the way.');
    
    // Simulate emergency call
    setTimeout(() => {
      speak('Emergency contacts are being notified. If this is a medical emergency, please call 911 directly.');
      setIsEmergencyActive(false);
    }, 3000);
  };

  const handleContactCall = (contact) => {
    speak(`Calling ${contact.name}`);
    // In a real app, this would initiate a phone call
    window.location.href = `tel:${contact.phone}`;
  };

  React.useEffect(() => {
    speak('Emergency help is available. You can get immediate help or contact your emergency contacts.');
  }, [speak]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-red-50 to-orange-100 flex flex-col items-center justify-center">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 w-full">
        <div className="container mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-2 sm:mr-3"
            >
              <ArrowLeft size={22} className="text-gray-600" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">{t('emergencyHelp')}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl px-2 sm:px-4 py-4 sm:py-6">
        {/* Emergency Button */}
        <Card className="mb-6 bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="text-center py-4">
            <AlertTriangle size={40} className="mx-auto mb-3 sm:mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Need Help Now?</h2>
            <p className="text-sm sm:text-base text-red-100 mb-4 sm:mb-6">Press the button below for immediate assistance</p>
            <Button
              onClick={handleEmergencyCall}
              disabled={isEmergencyActive}
              className="bg-white text-red-600 hover:bg-gray-100 text-lg sm:text-xl font-bold"
              size="xl"
            >
              {isEmergencyActive ? 'Getting Help...' : t('helpNow')}
            </Button>
          </div>
        </Card>

        {/* Location Info */}
        <Card className="mb-6">
          <div className="flex items-center mb-4">
            <MapPin className="text-blue-600 mr-3" size={24} />
            <h3 className="text-lg font-semibold">Your Location</h3>
          </div>
          <p className="text-gray-600">
            Location sharing is enabled for emergency services. 
            Your approximate location will be shared when you request help.
          </p>
        </Card>

        {/* Emergency Contacts */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Users className="text-green-600 mr-3" size={24} />
            <h3 className="text-lg font-semibold">{t('emergencyContacts')}</h3>
          </div>
          
          <div className="space-y-3">
            {emergencyContacts.map((contact) => (
              <Card
                key={contact.id}
                onClick={() => handleContactCall(contact)}
                className="cursor-pointer hover:shadow-lg active:scale-95"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800">{contact.name}</h4>
                    <p className="text-gray-600 text-sm">{contact.relationship}</p>
                    <p className="text-blue-600 font-medium">{contact.phone}</p>
                  </div>
                  <Phone className="text-green-600" size={24} />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Important Notice */}
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important</h3>
            <p className="text-yellow-700">
              For immediate medical emergencies, always call 911 directly. 
              This app is designed to supplement, not replace, emergency services.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}