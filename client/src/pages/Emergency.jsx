import React, { useState } from 'react';
import { ArrowLeft, Phone, Users, MapPin, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useVoice } from '../hooks/useVoice';
import { useApp } from '../context/AppContext';
import { useLocation } from '../hooks/useLocation';
import LocationComponent from '../components/location/LocationComponet'

export function Emergency() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { speak } = useVoice();
  const { user } = useApp();
  const { location, loading: locationLoading, error: locationError } = useLocation();
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  const emergencyContacts = [
    { id: '1', name: 'Dr. Smith', phone: '+1-555-0123', relationship: 'Doctor' },
    { id: '2', name: 'John (Son)', phone: '+1-555-0124', relationship: 'Family' },
    { id: '3', name: 'Emergency Services', phone: '911', relationship: 'Emergency' }
  ];

  const handleEmergencyCall = () => {
    // Use actual location if available, otherwise use fallback coordinates
    const currentLocation = location || { lat: 28.6139, lng: 77.2090 };

    console.log('Sending emergency call with location:', currentLocation);

    fetch('http://127.0.0.1:8000/send-emergency', {
      method: "POST",
      body: JSON.stringify({
        "contacts": ["+919222001998", "+919321242515", "+918104439075"],
        "latitude": currentLocation.lat,
        "longitude": currentLocation.lng
      }),
      headers: { "Content-Type": "application/json" }
    }).then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }).then(data => {
      console.log('Emergency call sent successfully:', data);
    }).catch(error => {
      console.error('Error sending emergency call:', error);
    });

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
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-red-50 to-orange-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 w-full sticky top-0 z-10 flex items-center justify-start">
        <div className="w-full max-w-2xl px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-gray-100/50 transition-all duration-300 mr-2"
            >
              <ArrowLeft size={22} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-600">
              {t('Emergency Help - SilverCare AI')}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto w-full max-w-2xl px-4 py-6 flex-1">
        {/* Emergency Button */}
        <div className="mb-8 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-xl opacity-90 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-2xl"></div>
          <Card className="flex items-center justify-center relative overflow-hidden border-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute -right-5 -bottom-5 w-20 h-20 bg-white/10 rounded-full"></div>
            <div className="relative text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 mx-auto">
                <AlertTriangle size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Need Immediate Help?</h2>
              <p className="text-white/90 mb-6">Press the button below for emergency assistance</p>
              <Button
                onClick={handleEmergencyCall}
                disabled={isEmergencyActive || locationLoading}
                className={`relative z-10 ${isEmergencyActive
                  ? 'bg-white/90 text-red-600'
                  : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                  } text-lg font-bold px-8 py-4 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 w-full max-w-xs`}
                size="xl"
              >
                {isEmergencyActive ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Getting Help...
                  </span>
                ) : locationLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Getting Location...
                  </span>
                ) : (
                  t('Get Help')
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Location Info */}
        <Card className="mb-8 p-6 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-start">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100/50 rounded-full mr-4">
              <MapPin className="text-blue-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Current Location</h3>
              {locationLoading ? (
                <p className="text-gray-600">
                  <span className="font-medium text-yellow-600">Loading location...</span>
                  Please allow location access for emergency services.
                </p>
              ) : locationError ? (
                <p className="text-gray-600">
                  <span className="font-medium text-red-600">Location unavailable</span>
                  Please enable location permissions for emergency services.
                </p>
              ) : location ? (
                <p className="text-gray-600">
                  Location sharing is <span className="font-medium text-green-600">active</span> for emergency services.
                  <br />
                  <span className="text-sm text-gray-500">
                    Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </span>
                </p>
              ) : (
                <p className="text-gray-600">
                  <span className="font-medium text-orange-600">Location not available</span>
                  Using fallback coordinates for emergency services.
                </p>
              )}
            </div>
          </div>
          <div className='pt-3'>
            <LocationComponent />
          </div>
        </Card>

        {/* Emergency Contacts Section */}
        <div className="mb-8">
          {/* Section Header */}
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-green-50 rounded-lg mr-4">
              <Users className="text-green-600" size={24} />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">{t('emergencyContacts')}</h3>
          </div>

          {/* Contacts List */}
          <div className="grid gap-3">
            {emergencyContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => handleContactCall(contact)}
                className="group p-5 bg-white rounded-xl border border-gray-100 shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer hover:border-green-100 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  {/* Contact Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{contact.name}</h4>
                      <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md">
                        {contact.relationship}
                      </span>
                    </div>
                    <p className="text-blue-600 font-medium flex items-center">
                      <Phone className="mr-2" size={16} />
                      {contact.phone}
                    </p>
                  </div>

                  {/* Call Button */}
                  <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                    <Phone className="text-green-600" size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important Notice */}
        <Card className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start">
            <div className="flex items-center justify-center w-12 h-12 bg-amber-100/50 rounded-full mr-4">
              <AlertTriangle className="text-amber-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">Important Notice</h3>
              <p className="text-amber-700/90">
                For immediate medical emergencies, always call 911 directly.
                This app is designed to supplement, not replace, emergency services.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}