import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Phone,
  Users,
  MapPin,
  AlertTriangle,
  Mic,
  Send,
  MicOff,
  Trash2,
} from "lucide-react"; // Added Trash2
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useVoice } from "../hooks/useVoice";
import { useApp } from "../context/AppContext";
import { useLocation } from "../hooks/useLocation";
import LocationComponent from "../components/location/LocationComponet";
import { route_endpoint } from "../utils/helper";

export default function Emergency() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { speak } = useVoice();
  const { user } = useApp();
  const {
    location,
    loading: locationLoading,
    error: locationError,
  } = useLocation();
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  // State for emergency chat
  const [messages, setMessages] = useState({});
  const [isListening, setIsListening] = useState({});
  const [recognition, setRecognition] = useState(null);

  // State for emergency contacts
  // const initialContacts = []; // No longer using hardcoded initial contacts here
  // const [emergencyContacts, setEmergencyContacts] = useState(() => {
  //   const savedContacts = localStorage.getItem("emergencyContacts");
  //   return savedContacts ? JSON.parse(savedContacts) : []; // Initialize with empty array if nothing in localStorage
  // });
  const [emergencyContacts, setEmergencyContacts] = useState([]);

  useEffect(() => {
    // Always use latest from context, plus any saved contacts from localStorage
    const savedContacts = localStorage.getItem("emergencyContacts");
    const extraContacts = savedContacts
      ? JSON.parse(savedContacts).filter((c) => !c.isDefault)
      : [];
    const defaultContacts = (user?.emergencyContacts || []).map(
      (contact, index) => ({
        id: `default-${index}`,
        name: contact.name,
        phone: contact.number,
        relationship: "Emergency Contact",
        isDefault: true,
      })
    );
    setEmergencyContacts([...defaultContacts, ...extraContacts]);
  }, [user]);

  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      speak("Please enter both name and phone number for the new contact.");
      return;
    }
    const newContact = {
      id: Date.now().toString(), // Simple unique ID
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relationship: "Custom", // Or allow user to specify
    };
    setEmergencyContacts((prevContacts) => {
      const updatedContacts = [...prevContacts, newContact];
      localStorage.setItem(
        "emergencyContacts",
        JSON.stringify(updatedContacts)
      );
      return updatedContacts;
    });
    setNewContactName("");
    setNewContactPhone("");
    setShowAddContactForm(false);
    speak(`${newContact.name} has been added to your emergency contacts.`);
  };
  const handleDeleteContact = (contactId) => {
    setEmergencyContacts((prevContacts) => {
      const updatedContacts = prevContacts.filter(
        (contact) => contact.id !== contactId
      );
      localStorage.setItem(
        "emergencyContacts",
        JSON.stringify(updatedContacts)
      );
      speak("Contact removed.");
      return updatedContacts;
    });
  };

  const handleEmergencyCall = () => {
    // Use actual location if available, otherwise use fallback coordinates
    const currentLocation = location || { lat: 28.6139, lng: 77.209 };

    console.log("Sending emergency call with location:", currentLocation);

    fetch(`${route_endpoint}/send-emergency`, {
      method: "POST",
      body: JSON.stringify({
        contacts: ["+919222001998", "+919321242515", "+918104439075"],
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Emergency call sent successfully:", data);
      })
      .catch((error) => {
        console.error("Error sending emergency call:", error);
      });

    setIsEmergencyActive(true);
    speak("Emergency help is being activated. Stay calm, help is on the way.");

    // Simulate emergency call
    setTimeout(() => {
      speak(
        "Emergency contacts are being notified. If this is a medical emergency, please call 911 directly."
      );
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
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "en-US";

      setRecognition(recognitionInstance);
    }
  }, []);

  // Handle speech-to-text
  const handleSpeechToText = (contactId) => {
    if (!recognition) {
      speak("Speech recognition is not supported on this device");
      return;
    }

    if (isListening[contactId]) {
      recognition.stop();
      setIsListening((prev) => ({ ...prev, [contactId]: false }));
      return;
    }

    setIsListening((prev) => ({ ...prev, [contactId]: true }));

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessages((prev) => ({
        ...prev,
        [contactId]: transcript,
      }));
      setIsListening((prev) => ({ ...prev, [contactId]: false }));
      speak("Message captured");
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening((prev) => ({ ...prev, [contactId]: false }));
      speak("Speech recognition failed");
    };

    recognition.onend = () => {
      setIsListening((prev) => ({ ...prev, [contactId]: false }));
    };

    recognition.start();
    speak("Listening for your message");
  };

  // Handle sending message via WhatsApp
  const handleSendWhatsApp = (contact) => {
    const message = messages[contact.id];
    if (!message || !message.trim()) {
      speak("Please enter a message first");
      return;
    }
    const emergencyMessage = `${message.trim()}`;

    const whatsappUrl = `https://wa.me/${contact.phone.replace(
      /[^0-9]/g,
      ""
    )}?text=${encodeURIComponent(emergencyMessage)}`;

    window.open(whatsappUrl, "_blank");
    speak(`Emergency message sent to ${contact.name} via WhatsApp`);

    // Clear the message after sending
    setMessages((prev) => ({
      ...prev,
      [contact.id]: "",
    }));
  };
  // Re-initialize contacts when user changes
  useEffect(() => {
    if (user && user.emergencyContacts && user.emergencyContacts.length > 0) {
      const savedContacts = localStorage.getItem("emergencyContacts");
      let contacts = savedContacts ? JSON.parse(savedContacts) : [];

      // Check if default contacts are already added
      const hasDefaults = contacts.some((c) => c.isDefault);
      if (!hasDefaults) {
        const defaultContacts = user.emergencyContacts.map(
          (contact, index) => ({
            id: `default-${index}`,
            name: contact.name,
            phone: contact.number,
            relationship: "Emergency Contact",
            isDefault: true,
          })
        );

        contacts = [...defaultContacts, ...contacts];
        localStorage.setItem("emergencyContacts", JSON.stringify(contacts));
        setEmergencyContacts(contacts);
      }
    }
  }, [user]);
  React.useEffect(() => {
    speak(
      "Emergency chat is ready. Use the microphone to record messages or type manually, then send via WhatsApp."
    );
  }, [speak]);

  const defaultContacts = emergencyContacts.filter((c) => c.isDefault);
  const savedContacts = emergencyContacts.filter((c) => !c.isDefault);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-primary-50 to-primary-100/30 dark:from-dark-100 dark:to-dark-200 flex flex-col">
      {/* Content */}
      <div className="container mx-auto w-full max-w-7xl px-6 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Emergency Button and Location */}
          <div className="space-y-8">
            {/* Emergency Button */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-100 dark:to-primary-200 rounded-2xl shadow-xl opacity-90 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-2xl"></div>
              <Card className="flex items-center justify-center relative overflow-hidden border-0 bg-gradient-to-r from-primary-400 to-primary-500 dark:from-primary-200 dark:to-primary-300 text-white">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 dark:bg-white/5 rounded-full"></div>
                <div className="absolute -right-5 -bottom-5 w-20 h-20 bg-white/10 dark:bg-white/5 rounded-full"></div>
                <div className="relative text-center py-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 dark:bg-white/10 rounded-full mb-4 mx-auto">
                    <AlertTriangle size={32} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-white">
                    Need Immediate Help?
                  </h2>
                  <p className="text-white/90 dark:text-white/80 mb-6">
                    Press the button below for emergency assistance
                  </p>
                  <Button
                    onClick={handleEmergencyCall}
                    disabled={isEmergencyActive || locationLoading}
                    className={`relative z-10 ${
                      isEmergencyActive
                        ? "bg-white/90 text-primary-400 dark:bg-white/80 dark:text-primary-200"
                        : "bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-100 dark:to-primary-200 text-white hover:from-primary-600 hover:to-primary-700 dark:hover:from-primary-200 dark:hover:to-primary-300"
                    } text-lg font-bold px-8 py-4 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 w-full max-w-xs`}
                    size="xl"
                  >
                    {isEmergencyActive ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-400 dark:text-primary-200"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Getting Help...
                      </span>
                    ) : locationLoading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Getting Location...
                      </span>
                    ) : (
                      t("Get Help")
                    )}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Location Info */}
            <Card className="p-6 bg-white/90 dark:bg-dark-100/90 backdrop-blur-sm border border-primary-100/20 dark:border-primary-100/10 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-start">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-100/50 dark:bg-primary-100/10 rounded-full mr-4">
                  <MapPin
                    className="text-primary-300 dark:text-primary-100"
                    size={24}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary-100 dark:text-primary-100 mb-2">
                    Your Current Location
                  </h3>
                  {locationLoading ? (
                    <p className="text-primary-200 dark:text-primary-100/90">
                      <span className="font-medium text-accent-yellow dark:text-accent-yellow/90">
                        Loading location...
                      </span>
                      Please allow location access for emergency services.
                    </p>
                  ) : locationError ? (
                    <p className="text-primary-200 dark:text-primary-100/90">
                      <span className="font-medium text-primary-400 dark:text-primary-200">
                        Location unavailable
                      </span>
                      Please enable location permissions for emergency services.
                    </p>
                  ) : location ? (
                    <p className="text-primary-200 dark:text-primary-100/90">
                      Location sharing is{" "}
                      <span className="font-medium text-primary-300 dark:text-primary-100">
                        active
                      </span>{" "}
                      for emergency services.
                      <br />
                      <span className="text-sm text-primary-200/80 dark:text-primary-100/70">
                        Coordinates: {location.lat.toFixed(6)},{" "}
                        {location.lng.toFixed(6)}
                      </span>
                    </p>
                  ) : (
                    <p className="text-primary-200 dark:text-primary-100/90">
                      <span className="font-medium text-primary-300 dark:text-primary-100">
                        Location not available
                      </span>
                      Using fallback coordinates for emergency services.
                    </p>
                  )}
                </div>
              </div>
              <div className="pt-3">
                <LocationComponent />
              </div>
            </Card>
          </div>

          {/* Right Column - Emergency Chat Section */}
          <div className="space-y-8">
            {/* Section Header */}
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100/50 dark:bg-primary-100/10 rounded-lg mr-4">
                <Send
                  className="text-primary-300 dark:text-primary-100"
                  size={24}
                />
              </div>
              <h3 className="text-2xl font-semibold text-primary-100 dark:text-primary-100">
                Emergency Chat
              </h3>
            </div>

            {/* Send to Any Number Section */}
            <Card className="mb-6 p-6 bg-white/90 dark:bg-dark-100/90 border border-primary-100/20 dark:border-primary-100/10 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-100/50 dark:bg-primary-100/10 rounded-full flex items-center justify-center mr-4">
                  <Send
                    className="text-primary-300 dark:text-primary-100"
                    size={24}
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-primary-100 dark:text-primary-100 text-lg">
                    Send to Any Number
                  </h4>
                  <p className="text-primary-200 dark:text-primary-100/90 text-sm">
                    Send emergency message to any WhatsApp number
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <input
                  type="tel"
                  placeholder="Enter phone number (e.g., +919876543210)"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="w-full p-3 border border-primary-100/20 dark:border-primary-100/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-100 bg-white/50 dark:bg-dark-100/50 text-primary-300 dark:text-primary-100 placeholder-primary-200/50 dark:placeholder-primary-100/40"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSpeechToText("any-number")}
                    className={`p-3 rounded-full transition-all duration-200 ${
                      isListening["any-number"]
                        ? "bg-primary-400 text-white animate-pulse"
                        : "bg-primary-100/50 dark:bg-primary-100/10 text-primary-300 dark:text-primary-100 hover:bg-primary-200/50 dark:hover:bg-primary-100/20"
                    }`}
                    title={
                      isListening["any-number"]
                        ? "Listening..."
                        : "Start voice recording"
                    }
                  >
                    {isListening["any-number"] ? (
                      <MicOff size={22} />
                    ) : (
                      <Mic size={22} />
                    )}
                  </button>

                  <textarea
                    value={messages["any-number"] || ""}
                    onChange={(e) =>
                      setMessages((prev) => ({
                        ...prev,
                        "any-number": e.target.value,
                      }))
                    }
                    placeholder="Type emergency message or use microphone..."
                    className="flex-1 p-3 border border-primary-100/20 dark:border-primary-100/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-100 resize-none bg-white/50 dark:bg-dark-100/50 text-primary-300 dark:text-primary-100 placeholder-primary-200/50 dark:placeholder-primary-100/40"
                    rows={2}
                  />
                </div>

                {isListening["any-number"] && (
                  <p className="text-primary-300 dark:text-primary-100 text-sm animate-pulse">
                    Listening for your voice...
                  </p>
                )}

                <button
                  onClick={() => {
                    const phoneNumber = newContactPhone.trim();
                    const message = messages["any-number"];

                    if (!phoneNumber) {
                      speak("Please enter a phone number first");
                      return;
                    }

                    if (!message || !message.trim()) {
                      speak("Please enter a message first");
                      return;
                    }

                    const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
                    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
                      message.trim()
                    )}`;

                    window.open(whatsappUrl, "_blank");
                    speak(
                      `Emergency message sent to ${phoneNumber} via WhatsApp`
                    );

                    // Clear the message after sending
                    setMessages((prev) => ({
                      ...prev,
                      "any-number": "",
                    }));
                  }}
                  disabled={
                    !newContactPhone.trim() || !messages["any-number"]?.trim()
                  }
                  className="w-full bg-primary-300 hover:bg-primary-400 dark:bg-primary-100 dark:hover:bg-primary-200 disabled:bg-primary-100/30 dark:disabled:bg-primary-100/10 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
                >
                  <Send size={20} />
                  Send via WhatsApp
                </button>
              </div>
            </Card>

            {/* Add Contact Form */}
            <div>
              <button
                onClick={() => setShowAddContactForm(!showAddContactForm)}
                className="mb-4 w-full bg-primary-300 hover:bg-primary-400 dark:bg-primary-100 dark:hover:bg-primary-200 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
              >
                <Users size={20} />
                {showAddContactForm
                  ? "Cancel Adding Contact"
                  : "Add New Contact"}
              </button>
              {showAddContactForm && (
                <Card className="mb-4 p-6 bg-white/90 dark:bg-dark-100/90 border border-primary-100/20 dark:border-primary-100/10 rounded-2xl backdrop-blur-sm">
                  <h4 className="font-semibold text-primary-100 dark:text-primary-100 text-lg mb-4">
                    Add New Emergency Contact
                  </h4>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="w-full p-3 border border-primary-100/20 dark:border-primary-100/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-100 bg-white/50 dark:bg-dark-100/50 text-primary-300 dark:text-primary-100 placeholder-primary-200/50 dark:placeholder-primary-100/40"
                    />
                    <input
                      type="tel"
                      placeholder="Contact Phone Number"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="w-full p-3 border border-primary-100/20 dark:border-primary-100/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-100 bg-white/50 dark:bg-dark-100/50 text-primary-300 dark:text-primary-100 placeholder-primary-200/50 dark:placeholder-primary-100/40"
                    />
                    <button
                      onClick={handleAddContact}
                      className="w-full bg-primary-300 hover:bg-primary-400 dark:bg-primary-100 dark:hover:bg-primary-200 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                    >
                      Save Contact
                    </button>
                  </div>
                </Card>
              )}
            </div>

            {/* Contacts Sections */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Default Contacts Section */}
              <div>
                <h4 className="text-xl font-semibold text-primary-100 dark:text-primary-100 mb-6">
                  Default Contacts
                </h4>
                <div className="space-y-4">
                  {defaultContacts.length > 0 ? (
                    defaultContacts.map((contact) => (
                      <Card
                        key={contact.id}
                        className="p-6 bg-white/90 dark:bg-dark-100/90 border border-primary-100/20 dark:border-primary-100/10 hover:border-primary-200/30 dark:hover:border-primary-100/20 transition-all duration-200 rounded-2xl backdrop-blur-sm"
                      >
                        {/* Contact Info Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-100/50 dark:bg-primary-100/10 rounded-full flex items-center justify-center">
                              <span className="text-primary-300 dark:text-primary-100 font-bold text-lg">
                                {contact.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-primary-100 dark:text-primary-100 text-lg">
                                {contact.name}
                              </h4>
                              <p className="text-primary-200 dark:text-primary-100/90 text-sm">
                                {contact.phone}
                              </p>
                              <span className="inline-block px-2 py-1 text-xs bg-primary-100/50 dark:bg-primary-100/10 text-primary-300 dark:text-primary-100 rounded-full">
                                Default Contact
                              </span>
                            </div>
                          </div>

                          {/* Microphone Button */}
                          <button
                            onClick={() => handleSpeechToText(contact.id)}
                            className={`p-3 rounded-full transition-all duration-200 ${
                              isListening[contact.id]
                                ? "bg-primary-400 text-white animate-pulse"
                                : "bg-primary-100/50 dark:bg-primary-100/10 text-primary-300 dark:text-primary-100 hover:bg-primary-200/50 dark:hover:bg-primary-100/20"
                            }`}
                            title={
                              isListening[contact.id]
                                ? "Listening..."
                                : "Start voice recording"
                            }
                          >
                            {isListening[contact.id] ? (
                              <MicOff size={22} />
                            ) : (
                              <Mic size={22} />
                            )}
                          </button>
                        </div>

                        {/* Message Input */}
                        <div className="mb-4">
                          <textarea
                            value={messages[contact.id] || ""}
                            onChange={(e) =>
                              setMessages((prev) => ({
                                ...prev,
                                [contact.id]: e.target.value,
                              }))
                            }
                            placeholder="Type emergency message or use microphone..."
                            className="w-full p-3 border border-primary-100/20 dark:border-primary-100/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-100 resize-none bg-white/50 dark:bg-dark-100/50 text-primary-300 dark:text-primary-100 placeholder-primary-200/50 dark:placeholder-primary-100/40"
                            rows={3}
                          />
                          {isListening[contact.id] && (
                            <p className="text-primary-300 dark:text-primary-100 text-sm mt-2 animate-pulse">
                              Listening for your voice...
                            </p>
                          )}
                        </div>

                        {/* Send WhatsApp Button */}
                        <button
                          onClick={() => handleSendWhatsApp(contact)}
                          disabled={!messages[contact.id]?.trim()}
                          className="w-full bg-primary-300 hover:bg-primary-400 dark:bg-primary-100 dark:hover:bg-primary-200 disabled:bg-primary-100/30 dark:disabled:bg-primary-100/10 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
                        >
                          <Send size={20} />
                          Send via WhatsApp
                        </button>
                      </Card>
                    ))
                  ) : (
                    <p className="text-primary-200 dark:text-primary-100/90 text-center py-8">
                      No default contacts available.
                    </p>
                  )}
                </div>
              </div>

              {/* Saved Contacts Section */}
              <div>
                <h4 className="text-xl font-semibold text-primary-100 dark:text-primary-100 mb-6">
                  Saved Contacts
                </h4>
                <div className="space-y-4">
                  {savedContacts.length > 0 ? (
                    savedContacts.map((contact) => (
                      <Card
                        key={contact.id}
                        className="p-6 bg-white/90 dark:bg-dark-100/90 border border-primary-100/20 dark:border-primary-100/10 hover:border-primary-200/30 dark:hover:border-primary-100/20 transition-all duration-200 rounded-2xl backdrop-blur-sm"
                      >
                        {/* Contact Info Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-100/50 dark:bg-primary-100/10 rounded-full flex items-center justify-center">
                              <span className="text-primary-300 dark:text-primary-100 font-bold text-lg">
                                {contact.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-primary-100 dark:text-primary-100 text-lg">
                                {contact.name}
                              </h4>
                              <p className="text-primary-200 dark:text-primary-100/90 text-sm">
                                {contact.phone}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Microphone Button */}
                            <button
                              onClick={() => handleSpeechToText(contact.id)}
                              className={`p-3 rounded-full transition-all duration-200 ${
                                isListening[contact.id]
                                  ? "bg-primary-400 text-white animate-pulse"
                                  : "bg-primary-100/50 dark:bg-primary-100/10 text-primary-300 dark:text-primary-100 hover:bg-primary-200/50 dark:hover:bg-primary-100/20"
                              }`}
                              title={
                                isListening[contact.id]
                                  ? "Listening..."
                                  : "Start voice recording"
                              }
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
                              className="p-3 rounded-full bg-primary-100/50 dark:bg-primary-100/10 text-primary-300 dark:text-primary-100 hover:bg-primary-200/50 dark:hover:bg-primary-100/20 transition-all duration-200"
                              title="Delete Contact"
                            >
                              <Trash2 size={22} />
                            </button>
                          </div>
                        </div>

                        {/* Message Input */}
                        <div className="mb-4">
                          <textarea
                            value={messages[contact.id] || ""}
                            onChange={(e) =>
                              setMessages((prev) => ({
                                ...prev,
                                [contact.id]: e.target.value,
                              }))
                            }
                            placeholder="Type emergency message or use microphone..."
                            className="w-full p-3 border border-primary-100/20 dark:border-primary-100/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-100 resize-none bg-white/50 dark:bg-dark-100/50 text-primary-300 dark:text-primary-100 placeholder-primary-200/50 dark:placeholder-primary-100/40"
                            rows={3}
                          />
                          {isListening[contact.id] && (
                            <p className="text-primary-300 dark:text-primary-100 text-sm mt-2 animate-pulse">
                              Listening for your voice...
                            </p>
                          )}
                        </div>

                        {/* Send WhatsApp Button */}
                        <button
                          onClick={() => handleSendWhatsApp(contact)}
                          disabled={!messages[contact.id]?.trim()}
                          className="w-full bg-primary-300 hover:bg-primary-400 dark:bg-primary-100 dark:hover:bg-primary-200 disabled:bg-primary-100/30 dark:disabled:bg-primary-100/10 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
                        >
                          <Send size={20} />
                          Send via WhatsApp
                        </button>
                      </Card>
                    ))
                  ) : (
                    <p className="text-primary-200 dark:text-primary-100/90 text-center py-8">
                      No saved contacts added.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
