import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, Users, MapPin, AlertTriangle, Mic, Send, MicOff, Trash2 } from 'lucide-react'; // Added Trash2
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useVoice } from '../hooks/useVoice';
import { useApp } from '../context/AppContext';
import { useLocation } from '../hooks/useLocation';
import LocationComponent from '../components/location/LocationComponet'

export default function Emergency() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { speak } = useVoice();
  const { user } = useApp();  const { location, loading: locationLoading, error: locationError } = useLocation();
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  
  // State for emergency chat
  const [messages, setMessages] = useState({});
  const [isListening, setIsListening] = useState({});
  const [recognition, setRecognition] = useState(null);

  // State for emergency contacts
  // const initialContacts = []; // No longer using hardcoded initial contacts here

  const [emergencyContacts, setEmergencyContacts] = useState(() => {
    const savedContacts = localStorage.getItem('emergencyContacts');
    return savedContacts ? JSON.parse(savedContacts) : []; // Initialize with empty array if nothing in localStorage
  });

  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      speak("Please enter both name and phone number for the new contact.");
      return;
    }
    const newContact = {
      id: Date.now().toString(), // Simple unique ID
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relationship: 'Custom' // Or allow user to specify
    };
    setEmergencyContacts(prevContacts => {
      const updatedContacts = [...prevContacts, newContact];
      localStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
      return updatedContacts;
    });
    setNewContactName('');
    setNewContactPhone('');
    setShowAddContactForm(false);
    speak(`${newContact.name} has been added to your emergency contacts.`);
  };

  const handleDeleteContact = (contactId) => {
    setEmergencyContacts(prevContacts => {
      const updatedContacts = prevContacts.filter(contact => contact.id !== contactId);
      localStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
      speak("Contact removed.");
      return updatedContacts;
    });
  };

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

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      setRecognition(recognitionInstance);
    }
  }, []);

  // Handle speech-to-text
  const handleSpeechToText = (contactId) => {
    if (!recognition) {
      speak('Speech recognition is not supported on this device');
      return;
    }

    if (isListening[contactId]) {
      recognition.stop();
      setIsListening(prev => ({ ...prev, [contactId]: false }));
      return;
    }

    setIsListening(prev => ({ ...prev, [contactId]: true }));
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessages(prev => ({
        ...prev,
        [contactId]: transcript
      }));
      setIsListening(prev => ({ ...prev, [contactId]: false }));
      speak('Message captured');
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(prev => ({ ...prev, [contactId]: false }));
      speak('Speech recognition failed');
    };

    recognition.onend = () => {
      setIsListening(prev => ({ ...prev, [contactId]: false }));
    };

    recognition.start();
    speak('Listening for your message');
  };

  // Handle sending message via WhatsApp
  const handleSendWhatsApp = (contact) => {
    const message = messages[contact.id];
    if (!message || !message.trim()) {
      speak('Please enter a message first');
      return;
    }
    const emergencyMessage = `${message.trim()}`;

    const whatsappUrl = `https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(emergencyMessage)}`;
    
    window.open(whatsappUrl, '_blank');
    speak(`Emergency message sent to ${contact.name} via WhatsApp`);
    
    // Clear the message after sending
    setMessages(prev => ({
      ...prev,
      [contact.id]: ''
    }));
  };
  React.useEffect(() => {
    speak('Emergency chat is ready. Use the microphone to record messages or type manually, then send via WhatsApp.');
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
            </button>            <h1 className="text-xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-600">
              Emergency Chat - VoiceBuddy AI
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
        </Card>        {/* Emergency Chat Section */}
        <div className="mb-8">
          {/* Section Header */}
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-lg mr-4">
              <Send className="text-red-600" size={24} />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">Emergency Chat</h3>
          </div>

          {/* Emergency Chat Cards */}
          <div className="space-y-4">
            <div>
              <button
                onClick={() => setShowAddContactForm(!showAddContactForm)}
                className="mb-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
              >
                <Users size={20} />
                {showAddContactForm ? 'Cancel Adding Contact' : 'Add New Contact'}
              </button>
              {showAddContactForm && (
                <Card className="p-4 sm:p-6 bg-white border border-gray-200 mb-4">
                  <h4 className="font-semibold text-gray-900 text-lg mb-3">Add New Emergency Contact</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="tel"
                      placeholder="Contact Phone Number"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddContact}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                    >
                      Save Contact
                    </button>
                  </div>
                </Card>
              )}
            </div>
            {emergencyContacts.map((contact) => (
              <Card 
                key={contact.id} 
                className="p-4 sm:p-6 bg-white border border-gray-200 hover:border-red-200 transition-all duration-200"
              >
                {/* Contact Info Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-bold text-lg">
                        {contact.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{contact.name}</h4>
                      <p className="text-gray-600 text-sm">{contact.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Microphone Button */}
                    <button
                      onClick={() => handleSpeechToText(contact.id)}
                      className={`p-3 rounded-full transition-all duration-200 ${
                        isListening[contact.id] 
                          ? 'bg-red-600 text-white animate-pulse' 
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                      title={isListening[contact.id] ? 'Listening...' : 'Start voice recording'}
                    >
                      {isListening[contact.id] ? (
                        <MicOff size={22} />
                      ) : (
                        <Mic size={22} />
                      )}
                    </button>
                    {/* Delete Contact Button */}
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-3 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all duration-200"
                      title="Delete Contact"
                    >
                      <Trash2 size={22} />
                    </button>
                  </div>
                </div>

                {/* Message Input */}
                <div className="mb-4">
                  <textarea
                    value={messages[contact.id] || ''}
                    onChange={(e) => setMessages(prev => ({
                      ...prev,
                      [contact.id]: e.target.value
                    }))}
                    placeholder="Type emergency message or use microphone..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  {isListening[contact.id] && (
                    <p className="text-red-600 text-sm mt-2 animate-pulse">
                      Listening for your voice...
                    </p>
                  )}
                </div>

                {/* Send WhatsApp Button */}
                <button
                  onClick={() => handleSendWhatsApp(contact)}
                  disabled={!messages[contact.id]?.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
                >
                  <Send size={20} />
                  Send via WhatsApp
                </button>
              </Card>
            ))}
          </div>
        </div>

        {/* Important Notice */}
        <Card className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 rounded-2xl p-6 shadow-sm my-20">
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
      </div>    </div>
  );
}

