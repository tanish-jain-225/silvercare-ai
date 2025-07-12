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
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useVoice } from "../hooks/useVoice";
import { useApp } from "../context/AppContext";
import { useLocation } from "../hooks/useLocation";
import LocationComponent from "../components/location/LocationComponet";
import { route_endpoint } from "../utils/helper";
import {
  getSavedContacts,
  addSavedContact,
  deleteSavedContact,
} from "../utils/apiService";

export default function Emergency() {
  const navigate = useNavigate();
  const { speak } = useVoice();
  const { user } = useApp();
  const {
    location,
    loading: locationLoading,
    error: locationError,
  } = useLocation();

  // State for emergency chat
  const [messages, setMessages] = useState({});
  const [isListening, setIsListening] = useState({});
  const [recognition, setRecognition] = useState(null);

  // State for emergency contacts
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  useEffect(() => {
    async function fetchContacts() {
      setLoadingContacts(true);
      let savedContacts = [];
      if (user && user.id) {
        try {
          savedContacts = await getSavedContacts(user.id);
        } catch (e) {
          savedContacts = [];
        }
      }
      const defaultContacts = (user?.emergencyContacts || []).map(
        (contact, index) => ({
          id: `default-${index}`,
          name: contact.name,
          phone: contact.number,
          relationship: "Emergency Contact",
          isDefault: true,
        })
      );
      setEmergencyContacts([...defaultContacts, ...savedContacts]);
      setLoadingContacts(false);
    }
    fetchContacts();
  }, [user]);

  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");

  const emergencyHelp = async () => {
    // confirm the action
    const helpConfirm = confirm(
      "Are you sure you want to activate emergency SOS? This will notify your emergency contacts for help and share your location."
    );

    if (!helpConfirm) {
      speak("SOS Message cancelled.");
      return;
    } else {
      speak("SOS Message Sent. Please wait for help.");

      // Get default emergency contacts and send message
      const emergencyMessage = `EMERGENCY SOS ALERT\n\nI need immediate help!\n\nMy current location:\nhttps://www.google.com/maps?q=${location?.lat},${location?.lng}\n\nPlease contact me or emergency services immediately.\n\nSent from SilverCare AI Emergency System\nThis is an automated emergency message.`;

      // Send emergency message to all default contacts
      const defaultContacts = emergencyContacts.filter((c) => c.isDefault);
      for (const contact of defaultContacts) {
        const whatsappUrl = `https://wa.me/${contact.phone.replace(
          /[^0-9]/g,
          ""
        )}?text=${encodeURIComponent(emergencyMessage)}`;
        window.open(whatsappUrl, "_blank");
      }
      speak(
        "Emergency SOS message sent to your default contacts via WhatsApp."
      );
    }
  };

  const handleAddContact = async () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      speak("Please enter both name and phone number for the new contact.");
      return;
    }
    if (!user || !user.id) {
      speak("User not authenticated.");
      return;
    }
    const newContact = {
      id: Date.now().toString(),
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relationship: "Custom",
    };
    try {
      await addSavedContact(user.id, newContact);
      setEmergencyContacts((prev) => [...prev, newContact]);
      setNewContactName("");
      setNewContactPhone("");
      setShowAddContactForm(false);
      speak(`${newContact.name} has been added to your emergency contacts.`);
    } catch (e) {
      speak("Failed to add contact.");
    }
  };
  const handleDeleteContact = async (contactId) => {
    if (!user || !user.id) {
      speak("User not authenticated.");
      return;
    }
    try {
      await deleteSavedContact(user.id, contactId);
      setEmergencyContacts((prev) => prev.filter((c) => c.id !== contactId));
      speak("Contact removed.");
    } catch (e) {
      speak("Failed to delete contact.");
    }
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
      // Only use default contacts from user.emergencyContacts and saved contacts from API
      const defaultContacts = user.emergencyContacts.map((contact, index) => ({
        id: `default-${index}`,
        name: contact.name,
        phone: contact.number,
        relationship: "Emergency Contact",
        isDefault: true,
      }));
      setEmergencyContacts((prev) => {
        // If already set by fetchContacts, don't duplicate
        const nonDefault = prev.filter((c) => !c.isDefault);
        return [...defaultContacts, ...nonDefault];
      });
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
    <div className="min-h-screen mb-20 w-full overflow-x-hidden bg-gradient-to-br from-primary-50 to-primary-100/30 dark:from-dark-100 dark:to-dark-200 flex flex-col px-2">
      {/* Content */}
      <div className="container mx-auto w-full max-w-4xl px-2 sm:px-4 py-6 sm:py-8 flex-1 flex flex-col gap-8">
        {/* Emergency SOS Help Button Section */}
        <section className="w-full">
          <Card className="p-4 bg-white/90 dark:bg-dark-100/90 backdrop-blur-sm border border-primary-100/20 dark:border-primary-100/10 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-start">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary-100/50 dark:bg-primary-100/10 rounded-full">
                      <AlertTriangle
                        className="text-primary-300 dark:text-primary-100"
                        size={24}
                      />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-primary-300 dark:text-primary-100">
                      Emergency SOS Button
                    </h2>
                  </div>
                  <button
                    className="text-md font-bold text-white  transition-colors duration-200 bg-red-600 hover:bg-red-700 py-2 px-4 rounded-lg"
                    onClick={() => {
                      emergencyHelp();
                    }}
                  >
                    Get Help
                  </button>
                </div>
                <p className="text-primary-200 dark:text-primary-100/90">
                  Instantly send emergency SOS alerts to your default contacts
                  via WhatsApp with your exact location for immediate
                  assistance.
                </p>
                <div className="mt-2 space-y-1">
                  <span className="text-sm text-yellow-600 block"> 
                    Numbers must be valid WhatsApp numbers
                  </span>
                  <span className="text-sm text-green-600 block">
                    Uses multiple delivery methods for reliability
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Location Section */}
        <section className="w-full">
          <Card className="p-4 sm:p-6 bg-white/90 dark:bg-dark-100/90 backdrop-blur-sm border border-primary-100/20 dark:border-primary-100/10 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-start">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary-100/50 dark:bg-primary-100/10 rounded-full">
                      <MapPin
                        className="text-primary-300 dark:text-primary-100"
                        size={24}
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-primary-300 dark:text-primary-100">
                      Your Current Location
                    </h3>
                  </div>
                  <button
                    className="text-md font-bold text-white  transition-colors duration-200 bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg"
                    onClick={() => {
                      window.location.reload();
                    }}
                  >
                    Refresh
                  </button>
                </div>
                {locationLoading ? (
                  <p className="text-primary-200 dark:text-primary-100/90">
                    <span className="font-medium text-accent-yellow dark:text-accent-yellow/90">
                      Loading location...
                    </span>{" "}
                    Please allow location access for emergency services.
                  </p>
                ) : locationError ? (
                  <p className="text-primary-200 dark:text-primary-100/90">
                    <span className="font-medium text-primary-400 dark:text-primary-200">
                      Location unavailable
                    </span>{" "}
                    Please enable location permissions for emergency services.
                  </p>
                ) : location ? (
                  <p className="text-primary-200 dark:text-primary-100/90">
                    Location sharing is{" "}
                    <span className="font-medium text-green-500 dark:text-green-500">
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
                    </span>{" "}
                    Using fallback coordinates for emergency services.
                  </p>
                )}
              </div>
            </div>
            <div className="pt-3 max-w-full overflow-x-auto">
              <LocationComponent />
            </div>
          </Card>
        </section>

        {/* Emergency Chat Section */}
        <section className="w-full">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-primary-100/50 dark:bg-primary-100/10 rounded-lg mr-3 sm:mr-4">
              <Users
                className="text-primary-300 dark:text-primary-100"
                size={24}
              />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-primary-300 dark:text-primary-100">
              Emergency Chat
            </h3>
          </div>

          {/* Send to Any Number Section */}
          <Card className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white/90 dark:bg-dark-100/90 border border-primary-100/20 dark:border-primary-100/10 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary-100/50 dark:bg-primary-100/10 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                <Send
                  className="text-primary-300 dark:text-primary-100"
                  size={24}
                />
              </div>
              <div>
                <h4 className="font-semibold text-primary-300 dark:text-primary-100 text-lg">
                  Send to Any Number
                </h4>
                <p className="text-primary-200 dark:text-primary-100/90 text-sm">
                  Send emergency message to any WhatsApp number
                </p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <input
                  type="tel"
                  placeholder="Enter phone number (e.g., +919876543210)"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="flex-1 p-3 border border-primary-100/20 dark:border-primary-100/10 rounded-lg  bg-white/50 dark:bg-dark-100/50 text-primary-300 dark:text-primary-100 placeholder-primary-200/50 dark:placeholder-primary-100/40 min-w-0"
                />
                <button
                  onClick={() => handleSpeechToText("any-number")}
                  className={`flex justify-center items-center p-3 rounded-full transition-all duration-200 ${
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
              </div>
              <textarea
                value={messages["any-number"] || ""}
                onChange={(e) =>
                  setMessages((prev) => ({
                    ...prev,
                    "any-number": e.target.value,
                  }))
                }
                placeholder="Type emergency message or use microphone..."
                className="w-full p-3 border border-primary-100/20 dark:border-primary-100/10 rounded-lg focus:outline-none  resize-none bg-white/50 dark:bg-dark-100/50 text-primary-300 dark:text-primary-100 placeholder-primary-200/50 dark:placeholder-primary-100/40"
                rows={2}
              />
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
                  const cleanNumber = phoneNumber.replace(/[^0-9]/g, "").trim();
                  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
                    message.trim()
                  )}`;
                  window.open(whatsappUrl, "_blank");
                  speak(
                    `Emergency message sent to ${phoneNumber} via WhatsApp`
                  );
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
        </section>

        {/* New Contact Button & Add Contact Form Section */}
        <section className="w-full">
          <div>
            <button
              onClick={() => setShowAddContactForm(!showAddContactForm)}
              className="mb-4 w-full bg-primary-300 hover:bg-primary-400 dark:bg-primary-100 dark:hover:bg-primary-200 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
            >
              <Users size={20} />
              {showAddContactForm ? "Cancel Adding Contact" : "Add New Contact"}
            </button>
            {showAddContactForm && (
              <Card className="mb-4 p-4 sm:p-6 bg-white/90 dark:bg-dark-100/90 border border-primary-100/20 dark:border-primary-100/10 rounded-2xl backdrop-blur-sm">
                <h4 className="font-semibold text-primary-300 dark:text-primary-100 text-lg mb-4">
                  Add New Emergency Contact
                </h4>
                <div className="space-y-3 sm:space-y-4">
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    className="w-full p-3 border border-primary-100/20 dark:border-primary-100/10 rounded-lg focus:outline-none  bg-white/50 dark:bg-dark-100/50 text-primary-300 dark:text-primary-100 placeholder-primary-200/50 dark:placeholder-primary-100/40"
                  />
                  <input
                    type="tel"
                    placeholder="Contact Phone Number"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className="w-full p-3 border border-primary-100/20 dark:border-primary-100/10 rounded-lg focus:outline-none  bg-white/50 dark:bg-dark-100/50 text-primary-300 dark:text-primary-100 placeholder-primary-200/50 dark:placeholder-primary-100/40"
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
        </section>

        {/* Default Contacts Section */}
        <section className="w-full">
          <h4 className="text-xl font-semibold text-primary-300 dark:text-primary-100 mb-4 sm:mb-6">
            Default Contacts
          </h4>
          <div className="space-y-3 sm:space-y-4">
            {defaultContacts.length > 0 ? (
              defaultContacts.map((contact) => (
                <Card
                  key={contact.id}
                  className="p-4 sm:p-6 bg-white/90 dark:bg-dark-100/90 border border-primary-100/20 dark:border-primary-100/10 hover:border-primary-200/30 dark:hover:border-primary-100/20 transition-all duration-200 rounded-2xl backdrop-blur-sm"
                >
                  {/* Contact Info Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 bg-primary-100/50 dark:bg-primary-100/10 rounded-full flex items-center justify-center">
                        <span className="text-primary-300 dark:text-primary-100 font-bold text-lg">
                          {contact.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary-300 dark:text-primary-100 text-lg">
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
                      className="w-full p-3 border border-primary-100/20 dark:border-primary-100/10 rounded-lg focus:outline-none resize-none bg-white/50 dark:bg-dark-100/50 text-primary-300 dark:text-primary-100 placeholder-primary-200/50 dark:placeholder-primary-100/40"
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
        </section>

        {/* Saved Contacts Section */}
        <section className="w-full">
          <h4 className="text-xl font-semibold text-primary-300 dark:text-primary-100 mb-4 sm:mb-6">
            Saved Contacts
          </h4>
          <div className="space-y-3 sm:space-y-4">
            {savedContacts.length > 0 ? (
              savedContacts.map((contact) => (
                <Card
                  key={contact.id}
                  className="p-4 sm:p-6 bg-white/90 dark:bg-dark-100/90 border border-primary-100/20 dark:border-primary-100/10 hover:border-primary-200/30 dark:hover:border-primary-100/20 transition-all duration-200 rounded-2xl backdrop-blur-sm"
                >
                  {/* Contact Info Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 bg-primary-100/50 dark:bg-primary-100/10 rounded-full flex items-center justify-center">
                        <span className="text-primary-300 dark:text-primary-100 font-bold text-lg">
                          {contact.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary-300 dark:text-primary-100 text-lg">
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
                      className="w-full p-3 border border-primary-100/20 dark:border-primary-100/10 rounded-lg focus:outline-none  resize-none bg-white/50 dark:bg-dark-100/50 text-primary-300 dark:text-primary-100 placeholder-primary-200/50 dark:placeholder-primary-100/40"
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
        </section>
      </div>
    </div>
  );
}
