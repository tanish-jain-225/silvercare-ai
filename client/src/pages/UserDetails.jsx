import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Calendar,
  Phone,
  MapPin,
  ClipboardList,
  Upload,
  Heart,
  Mic,
  Sparkles,
  Shield,
  Activity,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useApp } from "../context/AppContext";
import { useVoice } from "../hooks/useVoice";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const VoiceButton = ({ listening, onClick, fieldName }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2.5 rounded-full transition-all duration-300 transform hover:scale-110 ${
      listening
        ? "bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse shadow-lg shadow-red-500/50"
        : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-md hover:shadow-lg"
    }`}
    aria-label={
      listening ? "Stop recording" : `Start voice input for ${fieldName}`
    }
  >
    <Mic
      size={18}
      className={`transition-transform duration-300 ${
        listening ? "animate-bounce" : ""
      }`}
    />
  </button>
);

export function UserDetails() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, setUser } = useApp();
  const { speak } = useVoice();
  const [isLoading, setIsLoading] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState(null);

  // Speech recognition hooks
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    address: "",
    emergencyContacts: [
      { name: "", number: "" },
      { name: "", number: "" },
    ],
    healthCondition: { selected: "", custom: "" },
    currentMedicalStatus: "",
    medicalCertificates: null,
  });

  // Options for dropdowns
  const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];
  const healthConditionOptions = [
    "Heart Disease",
    "Cancer",
    "Tuberculosis (TB)",
    "Diabetes",
    "High Blood Pressure",
    "Asthma",
    "None",
  ];
  const medicalStatusOptions = [
    "Stable",
    "Under Treatment",
    "Critical",
    "Recovering",
    "Chronic",
  ];
  // Update form field with transcript - MODIFIED VERSION
  useEffect(() => {
    console.log("Current transcript:", transcript);
    console.log("Active field:", activeVoiceField);
    console.log("Is listening:", listening);

    if (!activeVoiceField || !transcript) return;

    // Only update if we're still listening for the same field
    if (listening && activeVoiceField) {
      switch (activeVoiceField) {
        case "name":
          setFormData((prev) => ({ ...prev, name: transcript }));
          break;
        case "age":
          const ageMatch = transcript.match(/\d+/);
          if (ageMatch) setFormData((prev) => ({ ...prev, age: ageMatch[0] }));
          break;
        case "address":
          setFormData((prev) => ({ ...prev, address: transcript }));
          break;
        case "contactName_0":
          setFormData((prev) => ({
            ...prev,
            emergencyContacts: [
              { ...prev.emergencyContacts[0], name: transcript },
              prev.emergencyContacts[1],
            ],
          }));
          break;
        case "contactNumber_0":
          setFormData((prev) => ({
            ...prev,
            emergencyContacts: [
              { ...prev.emergencyContacts[0], number: transcript },
              prev.emergencyContacts[1],
            ],
          }));
          break;
        case "contactName_1":
          setFormData((prev) => ({
            ...prev,
            emergencyContacts: [
              prev.emergencyContacts[0],
              { ...prev.emergencyContacts[1], name: transcript },
            ],
          }));
          break;
        case "contactNumber_1":
          setFormData((prev) => ({
            ...prev,
            emergencyContacts: [
              prev.emergencyContacts[0],
              { ...prev.emergencyContacts[1], number: transcript },
            ],
          }));
          break;
        default:
          break;
      }
    }  }, [transcript, activeVoiceField, listening]);

  // Welcome message effect - must be at top level
  useEffect(() => {
    if (browserSupportsSpeechRecognition) {
      speak(
        "Please provide your medical information for better healthcare assistance."
      );
    }
  }, [speak, browserSupportsSpeechRecognition]);

  const toggleVoiceInput = (fieldName) => {
    if (!browserSupportsSpeechRecognition) {
      alert(
        "Speech recognition not supported in your browser. Please use Chrome or Edge."
      );
      return;
    }

    if (!isMicrophoneAvailable) {
      alert(
        "Microphone access is required for voice input. Please enable microphone permissions."
      );
      return;
    }

    // If we're already listening for this field, stop
    if (listening && activeVoiceField === fieldName) {
      SpeechRecognition.stopListening();
      setActiveVoiceField(null);
      resetTranscript();
      return;
    }

    // If listening to a different field, stop that first
    if (listening) {
      SpeechRecognition.stopListening();
    }

    // Start listening for the new field
    setActiveVoiceField(fieldName);
    resetTranscript();

    try {
      SpeechRecognition.startListening({
        continuous: true,
        language: "en-US",
      });
    } catch (error) {
      console.error("Error starting voice recognition:", error);
      alert("Failed to start voice recognition. Please try again.");
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle emergency contact changes
  const handleEmergencyContactChange = (index, field, value) => {
    const updatedContacts = [...formData.emergencyContacts];
    updatedContacts[index][field] = value;
    setFormData((prev) => ({ ...prev, emergencyContacts: updatedContacts }));
  };

  // Handle health condition selection
  const handleHealthConditionChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      healthCondition: {
        ...prev.healthCondition,
        selected: value,
        custom: value === "Other" ? prev.healthCondition.custom : "",
      },
    }));
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    setFormData((prev) => ({
      ...prev,
      medicalCertificates: e.target.files[0],
    }));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Process form data
      const userData = {
        ...formData,
        healthCondition:
          formData.healthCondition.selected === "Other"
            ? formData.healthCondition.custom
            : formData.healthCondition.selected,
      };

      // Update user context if needed
      if (user) {
        const updatedUser = {
          ...user,
          ...userData,
        };
        setUser(updatedUser);
      }

      speak("Your medical information has been saved successfully.");
      navigate("/home");
    } catch (error) {
      console.error("Error saving medical information:", error);    } finally {
      setIsLoading(false);
    }
  };

  // Check for browser support
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl max-w-md text-center border border-white/20">
          <div className="text-red-500 mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            Browser Not Supported
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Your browser doesn't support speech recognition. Please use Chrome
            or Edge for the best experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 rounded-full mb-6 shadow-2xl transform transition-all duration-500 hover:scale-110 hover:shadow-3xl relative">
            <Heart size={36} className="text-white animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full animate-ping"></div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-700 leading-tight">
            {t("SilverCare AI Medical Form")}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto opacity-90 leading-relaxed">
            {t(
              "Please provide your Medical Information for Better Healthcare Assistance"
            )}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
            <span className="text-sm text-purple-600 font-medium">
              Voice-enabled for easy input
            </span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-3xl border border-white/20 relative">
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 rounded-3xl pointer-events-none"></div>

          {/* Global listening indicator */}
          {listening && activeVoiceField && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg animate-pulse">
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5 animate-bounce" />
                <span className="font-semibold">
                  Listening for: {activeVoiceField.replace(/_/g, " ")}
                </span>
                <span className="text-sm opacity-90">
                  {transcript || "Speak now..."}
                </span>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="p-8 sm:p-10 space-y-10 relative"
          >
            {/* Personal Information Section */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-2 bg-gradient-to-b from-purple-400 via-pink-400 to-purple-600 rounded-full animate-pulse"></div>
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-800 tracking-wide">
                    {t("Enter Your Details")}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name */}
                <div className="relative group">
                  <Input
                    type="text"
                    label={t("Full Name")}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    icon={User}
                    required
                    className="pr-14 group-hover:border-purple-300 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  />
                  <div className="absolute right-3 top-10">
                    <VoiceButton
                      listening={listening && activeVoiceField === "name"}
                      onClick={() => toggleVoiceInput("name")}
                      fieldName="name"
                    />
                  </div>
                  {listening && activeVoiceField === "name" && (
                    <div className="absolute -bottom-6 left-0 text-sm text-purple-600 flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                      <Mic className="w-4 h-4 animate-pulse" />
                      <span className="animate-pulse">
                        Listening: {transcript || "Speak now..."}
                      </span>
                    </div>
                  )}
                </div>

                {/* Age */}
                <div className="relative group">
                  <Input
                    type="number"
                    label={t("Age")}
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    icon={Calendar}
                    min="1"
                    max="120"
                    required
                    className="pr-14 group-hover:border-purple-300 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  />
                  <div className="absolute right-3 top-10">
                    <VoiceButton
                      listening={listening && activeVoiceField === "age"}
                      onClick={() => toggleVoiceInput("age")}
                      fieldName="age"
                    />
                  </div>
                  {listening && activeVoiceField === "age" && (
                    <div className="absolute -bottom-6 left-0 text-sm text-purple-600 flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                      <Mic className="w-4 h-4 animate-pulse" />
                      <span className="animate-pulse">
                        Listening: {transcript || "Speak now..."}
                      </span>
                    </div>
                  )}
                </div>

                {/* Gender */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 group-hover:text-purple-600 transition-colors">
                    {t("Gender")}
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all duration-300 shadow-sm group-hover:shadow-md bg-white/50 backdrop-blur-sm"
                    required
                  >
                    <option value="">{t("Select Gender")}</option>
                    {genderOptions.map((option) => (
                      <option key={option} value={option}>
                        {t(option)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Address */}
                <div className="relative md:col-span-2 group">
                  <Input
                    type="text"
                    label={t("Address")}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    icon={MapPin}
                    required
                    className="pr-14 group-hover:border-purple-300 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  />
                  <div className="absolute right-3 top-10">
                    <VoiceButton
                      listening={listening && activeVoiceField === "address"}
                      onClick={() => toggleVoiceInput("address")}
                      fieldName="address"
                    />
                  </div>
                  {listening && activeVoiceField === "address" && (
                    <div className="absolute -bottom-6 left-0 text-sm text-purple-600 flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                      <Mic className="w-4 h-4 animate-pulse" />
                      <span className="animate-pulse">
                        Listening: {transcript || "Speak now..."}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency Contacts Section */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-2 bg-gradient-to-b from-indigo-400 via-blue-400 to-indigo-600 rounded-full animate-pulse"></div>
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-2xl font-bold text-gray-800 tracking-wide">
                    {t("emergencyContacts")}
                  </h2>
                </div>
              </div>

              <div className="space-y-6">
                {formData.emergencyContacts.map((contact, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 p-6 rounded-2xl border border-indigo-100/50 hover:border-indigo-200 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm group"
                  >
                    <h3 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
                      <span className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform">
                        {index + 1}
                      </span>
                      {t("Contact")} {index + 1}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Contact Name */}
                      <div className="relative group">
                        <Input
                          type="text"
                          label={t("Contact Name")}
                          value={contact.name}
                          onChange={(e) =>
                            handleEmergencyContactChange(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          icon={User}
                          className="pr-14 group-hover:border-indigo-300 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        />
                        <div className="absolute right-3 top-10">
                          <VoiceButton
                            listening={
                              listening &&
                              activeVoiceField === `contactName_${index}`
                            }
                            onClick={() =>
                              toggleVoiceInput(`contactName_${index}`)
                            }
                            fieldName={`contact ${index + 1} name`}
                          />
                        </div>
                        {listening &&
                          activeVoiceField === `contactName_${index}` && (
                            <div className="absolute -bottom-6 left-0 text-sm text-indigo-600 flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                              <Mic className="w-4 h-4 animate-pulse" />
                              <span className="animate-pulse">
                                Listening: {transcript || "Speak now..."}
                              </span>
                            </div>
                          )}
                      </div>

                      {/* Contact Number */}
                      <div className="relative group">
                        <Input
                          type="tel"
                          label={t("Contact Number")}
                          value={contact.number}
                          onChange={(e) =>
                            handleEmergencyContactChange(
                              index,
                              "number",
                              e.target.value
                            )
                          }
                          icon={Phone}
                          className="pr-14 group-hover:border-indigo-300 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        />
                        <div className="absolute right-3 top-10">
                          <VoiceButton
                            listening={
                              listening &&
                              activeVoiceField === `contactNumber_${index}`
                            }
                            onClick={() =>
                              toggleVoiceInput(`contactNumber_${index}`)
                            }
                            fieldName={`contact ${index + 1} number`}
                          />
                        </div>
                        {listening &&
                          activeVoiceField === `contactNumber_${index}` && (
                            <div className="absolute -bottom-6 left-0 text-sm text-indigo-600 flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                              <Mic className="w-4 h-4 animate-pulse" />
                              <span className="animate-pulse">
                                Listening: {transcript || "Speak now..."}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Information Section */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-2 bg-gradient-to-b from-pink-400 via-rose-400 to-pink-600 rounded-full animate-pulse"></div>
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-pink-600" />
                  <h2 className="text-2xl font-bold text-gray-800 tracking-wide">
                    {t("Health Information")}
                  </h2>
                </div>
              </div>

              {/* Health Condition */}
              <div className="space-y-4 group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 group-hover:text-pink-600 transition-colors">
                  {t("Health Condition")}
                </label>
                <select
                  value={formData.healthCondition.selected}
                  onChange={handleHealthConditionChange}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all duration-300 shadow-sm group-hover:shadow-md bg-white/50 backdrop-blur-sm"
                  required
                >
                  <option value="">{t("Select Your Health Condition")}</option>
                  {healthConditionOptions.map((option) => (
                    <option key={option} value={option}>
                      {t(option)}
                    </option>
                  ))}
                  <option value="Other">{t("Other")}</option>
                </select>

                {formData.healthCondition.selected === "Other" && (
                  <div className="mt-4 animate-fade-in">
                    <Input
                      type="text"
                      label={t("specifyCondition")}
                      value={formData.healthCondition.custom}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          healthCondition: {
                            ...prev.healthCondition,
                            custom: e.target.value,
                          },
                        }))
                      }
                      className="hover:border-pink-300 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                )}
              </div>

              {/* Current Medical Status */}
              <div className="space-y-4 group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 group-hover:text-pink-600 transition-colors">
                  {t("Current Medical Status")}
                </label>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <select
                    name="currentMedicalStatus"
                    value={formData.currentMedicalStatus}
                    onChange={handleChange}
                    className="flex-1 w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all duration-300 shadow-sm group-hover:shadow-md bg-white/50 backdrop-blur-sm"
                  >
                    <option value="">{t("Select Status")}</option>
                    {medicalStatusOptions.map((option) => (
                      <option key={option} value={option}>
                        {t(option)}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-500 text-sm font-medium transform group-hover:scale-105 transition-transform">
                    or
                  </span>
                  <input
                    type="text"
                    name="currentMedicalStatus"
                    value={formData.currentMedicalStatus}
                    onChange={handleChange}
                    placeholder={t("Describe Your Status")}
                    className="flex-1 w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all duration-300 shadow-sm group-hover:shadow-md bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Medical Certificates */}
              <div className="space-y-4 group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 group-hover:text-pink-600 transition-colors">
                  {t("Medical Certificates")}
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-4 p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-pink-300 transition-all duration-300 bg-white/30 hover:bg-pink-50/50 backdrop-blur-sm group-hover:shadow-md">
                      <Upload className="text-gray-500 group-hover:text-pink-500 transition-colors w-6 h-6" />
                      <span className="text-sm text-gray-600 group-hover:text-pink-600 transition-colors font-medium">
                        {formData.medicalCertificates
                          ? formData.medicalCertificates.name
                          : t("Click to Upload")}
                      </span>
                    </div>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".jpg,.jpeg,.png"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2 opacity-80">
                  {t("The maximum file size allowed is")} (max 5MB)
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="animate-fade-in-up">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 hover:from-purple-600 hover:via-pink-600 hover:to-indigo-700 text-white py-5 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 active:translate-y-0 font-semibold text-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg
                      className="animate-spin h-6 w-6 text-white"
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
                    {t("Saving")}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <span>{t("Save Information")}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
