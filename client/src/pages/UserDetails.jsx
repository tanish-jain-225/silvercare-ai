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
import { db } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { uploadToCloudinary } from "../utils/cloudinary";

const VoiceButton = ({ listening, onClick, fieldName }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2.5 rounded-full transition-all duration-300 transform hover:scale-110 ${listening
      ? "bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse shadow-lg shadow-red-500/50"
      : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-md hover:shadow-lg"
      }`}
    aria-label={
      listening ? "Stop recording" : `Start voice input for ${fieldName}`
    }
  >
    <Mic
      size={18}
      className={`transition-transform duration-300 ${listening ? "animate-bounce" : ""
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
  const [step, setStep] = useState(1); // Step state
  const [subStep, setSubStep] = useState(0); // For emergency contacts

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
    profileImage: null,
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

  // Step progress bar
  const steps = [
    t("Age & Gender"),
    t("Address"),
    t("Emergency Contact"),
    t("Health & Status"),
    t("Medical Certificate"),
    t("Profile Image"),
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        age: user.age || "",
        gender: user.gender || "",
        address: user.address || "",
        emergencyContacts: user.emergencyContacts || [
          { name: "", number: "" },
          { name: "", number: "" },
        ],
        healthCondition: {
          selected: user.healthCondition || "",
          custom: "",
        },
        currentMedicalStatus: user.currentMedicalStatus || "",
        medicalCertificates: null,
        profileImage: null,
      });
    }
  }, [user]);

  // Update form field with transcript - MODIFIED VERSION
  useEffect(() => {
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
        case "gender":
          // Try to match transcript to one of the gender options
          const genderMatch = genderOptions.find(
            (g) => g.toLowerCase() === transcript.trim().toLowerCase()
          );
          if (genderMatch) {
            setFormData((prev) => ({ ...prev, gender: genderMatch }));
          }
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
              {
                ...prev.emergencyContacts[0],
                number: transcript.replace(/\s+/g, ""),
              },
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
              {
                ...prev.emergencyContacts[1],
                number: transcript.replace(/\s+/g, ""),
              },
            ],
          }));
          break;
        default:
          break;
      }
    }
  }, [transcript, activeVoiceField, listening]);

  // Welcome message effect - must be at top level
  useEffect(() => {
    if (browserSupportsSpeechRecognition) {
      speak(
        "Please provide your medical information for better healthcare assistance."
      );
    }
  }, [speak, browserSupportsSpeechRecognition]);

  // Read aloud the title at each step
  useEffect(() => {
    let title = "";
    switch (step) {
      case 1:
        title = t("Enter Your Age & Gender");
        break;
      case 2:
        title = t("Enter Your Address");
        break;
      case 3:
        title = t("Enter Emergency Contact");
        break;
      case 4:
        title = t("Enter Health & Status");
        break;
      case 5:
        title = t("Upload Medical Certificate");
        break;
      case 6:
        title = t("Upload Profile Image");
        break;
      default:
        break;
    }
    if (title) speak(title);
    // eslint-disable-next-line
  }, [step, t]);

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

  // Step navigation with validation
  const validateStep = () => {
    if (step === 1) {
      return formData.age && formData.gender;
    }
    if (step === 2) {
      return formData.address;
    }
    if (step === 3) {
      const contact = formData.emergencyContacts[subStep];
      return contact.name && contact.number;
    }
    if (step === 4) {
      if (formData.healthCondition.selected === "Other") {
        return formData.healthCondition.custom && formData.currentMedicalStatus;
      }
      return formData.healthCondition.selected && formData.currentMedicalStatus;
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    if (step === 3 && subStep < 1) {
      setSubStep(subStep + 1);
    } else {
      setStep(step + 1);
      setSubStep(0);
    }
  };
  const prevStep = () => {
    if (step === 3 && subStep > 0) {
      setSubStep(subStep - 1);
    } else if (step > 1) {
      setStep(step - 1);
      if (step === 4) setSubStep(1); // Go back to last emergency contact
    }
  };

  // Add state for image previews
  const [previewUrls, setPreviewUrls] = useState({
    medicalCertificate: null,
    profileImage: null,
  });

  // Handle file upload with preview
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        medicalCertificates: file,
      }));
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrls((prev) => ({
        ...prev,
        medicalCertificate: previewUrl,
      }));
    }
  };

  // Handle profile image upload with preview
  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profileImage: file,
      }));
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrls((prev) => ({
        ...prev,
        profileImage: previewUrl,
      }));
    }
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrls.medicalCertificate) {
        URL.revokeObjectURL(previewUrls.medicalCertificate);
      }
      if (previewUrls.profileImage) {
        URL.revokeObjectURL(previewUrls.profileImage);
      }
    };
  }, [previewUrls]);

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = "";
      let medicalCertificateUrl = "";
      if (formData.profileImage) {
        imageUrl = await uploadToCloudinary(formData.profileImage);
      }
      if (formData.medicalCertificates) {
        medicalCertificateUrl = await uploadToCloudinary(
          formData.medicalCertificates
        );
      }
      const userData = {
        ...formData,
        healthCondition:
          formData.healthCondition.selected === "Other"
            ? formData.healthCondition.custom
            : formData.healthCondition.selected,
        profileImage: imageUrl,
        medicalCertificates: medicalCertificateUrl,
      };
      if (user) {
        const updatedUser = {
          ...user,
          ...userData,
        };
        console.log("Updated user data:", updatedUser);
        setUser(updatedUser);
        // Store in Firestore users collection
        await setDoc(doc(db, "users", user.id), userData);
      }
      speak("Your medical information has been saved successfully.");
      navigate("/home");
    } catch (error) {
      console.error("Error saving medical information:", error);
    } finally {
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
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-2 sm:p-4 relative">
      {/* Progress bar (show only current step on mobile) */}
      <div className="fixed top-0 left-0 w-full z-40 bg-white/80 py-2 px-1 sm:py-3 sm:px-4 flex items-center justify-center gap-1 sm:gap-2 shadow-md">
        <div className="flex-1 flex flex-col items-center sm:hidden">
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-base shadow-lg bg-gradient-to-br from-purple-500 to-indigo-500 scale-110">
            {step}
          </div>
          <span className="text-[10px] mt-1 font-medium text-indigo-700">
            {steps[step - 1]}
          </span>
        </div>
        <div className="hidden sm:flex w-full gap-2">
          {steps.map((label, idx) => (
            <div key={label} className="flex-1 flex flex-col items-center">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-white text-base sm:text-lg shadow-lg transition-all duration-300 ${step === idx + 1
                  ? "bg-gradient-to-br from-purple-500 to-indigo-500 scale-110"
                  : step > idx + 1
                    ? "bg-green-400 scale-100"
                    : "bg-gray-300 scale-90"
                  }`}
              >
                {idx + 1}
              </div>
              <span
                className={`text-[10px] sm:text-xs mt-1 font-medium ${step === idx + 1 ? "text-indigo-700" : "text-gray-400"
                  }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-lg relative z-10 mt-20 sm:mt-24">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/20 p-4 sm:p-8 animate-fade-in-up">
          <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
            {/* Step 1: Age & Gender */}
            {step === 1 && (
              <div className="space-y-6 sm:space-y-8">
                <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-4 sm:mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />{" "}
                  {t("Your Age & Gender")}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
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
                      className="bg-white/60"
                    />
                  </div>
                  <VoiceButton
                    listening={listening && activeVoiceField === "age"}
                    onClick={() => toggleVoiceInput("age")}
                    fieldName="age"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all duration-300 shadow-sm bg-white/60"
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
                  <VoiceButton
                    listening={listening && activeVoiceField === "gender"}
                    onClick={() => toggleVoiceInput("gender")}
                    fieldName="gender"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4 sm:mt-6">
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow w-full sm:w-auto"
                  >
                    {t("Next")}
                  </Button>
                </div>
              </div>
            )}
            {/* Step 2: Address */}
            {step === 2 && (
              <div className="space-y-6 sm:space-y-8">
                <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-4 sm:mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />{" "}
                  {t("Your Address")}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      label={t("Address")}
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      icon={MapPin}
                      required
                      className="bg-white/60"
                    />
                  </div>
                  <VoiceButton
                    listening={listening && activeVoiceField === "address"}
                    onClick={() => toggleVoiceInput("address")}
                    fieldName="address"
                  />
                </div>
                <div className="flex justify-between gap-2 mt-4 sm:mt-6">
                  <Button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl shadow w-1/2 sm:w-auto"
                  >
                    {t("Back")}
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow w-1/2 sm:w-auto"
                  >
                    {t("Next")}
                  </Button>
                </div>
              </div>
            )}
            {/* Step 3: Emergency Contact (one at a time) */}
            {step === 3 && (
              <div className="space-y-6 sm:space-y-8">
                <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-4 sm:mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />{" "}
                  {t("Emergency Contact")}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      label={t("Contact Name") + ` (${subStep + 1})`}
                      value={formData.emergencyContacts[subStep].name}
                      onChange={(e) =>
                        handleEmergencyContactChange(
                          subStep,
                          "name",
                          e.target.value
                        )
                      }
                      icon={User}
                      required
                      className="bg-white/60 pr-12"
                    />
                  </div>
                  <VoiceButton
                    listening={
                      listening && activeVoiceField === `contactName_${subStep}`
                    }
                    onClick={() => toggleVoiceInput(`contactName_${subStep}`)}
                    fieldName={`contact ${subStep + 1} name`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      type="tel"
                      label={t("Contact Number") + ` (${subStep + 1})`}
                      value={formData.emergencyContacts[subStep].number}
                      onChange={(e) =>
                        handleEmergencyContactChange(
                          subStep,
                          "number",
                          e.target.value
                        )
                      }
                      icon={Phone}
                      required
                      className="bg-white/60 pr-12"
                    />
                  </div>
                  <VoiceButton
                    listening={
                      listening &&
                      activeVoiceField === `contactNumber_${subStep}`
                    }
                    onClick={() => toggleVoiceInput(`contactNumber_${subStep}`)}
                    fieldName={`contact ${subStep + 1} number`}
                  />
                </div>
                <div className="flex justify-between gap-2 mt-4 sm:mt-6">
                  <Button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl shadow w-1/2 sm:w-auto"
                  >
                    {t("Back")}
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow w-1/2 sm:w-auto"
                  >
                    {subStep === 1 ? t("Next") : t("Next Contact")}
                  </Button>
                </div>
              </div>
            )}
            {/* Step 4: Health Condition & Status */}
            {step === 4 && (
              <div className="space-y-6 sm:space-y-8">
                <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-4 sm:mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />{" "}
                  {t("Health & Status")}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <select
                      value={formData.healthCondition.selected}
                      onChange={handleHealthConditionChange}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all duration-300 shadow-sm bg-white/60"
                      required
                    >
                      <option value="">
                        {t("Select Your Health Condition")}
                      </option>
                      {healthConditionOptions.map((option) => (
                        <option key={option} value={option}>
                          {t(option)}
                        </option>
                      ))}
                      <option value="Other">{t("Other")}</option>
                    </select>
                  </div>
                  <VoiceButton
                    listening={
                      listening && activeVoiceField === "healthCondition"
                    }
                    onClick={() => toggleVoiceInput("healthCondition")}
                    fieldName="health condition"
                  />
                </div>
                {formData.healthCondition.selected === "Other" && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
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
                        required
                        className="bg-white/60"
                      />
                    </div>
                    <VoiceButton
                      listening={
                        listening && activeVoiceField === "specifyCondition"
                      }
                      onClick={() => toggleVoiceInput("specifyCondition")}
                      fieldName="specify condition"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <select
                      name="currentMedicalStatus"
                      value={formData.currentMedicalStatus}
                      onChange={handleChange}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all duration-300 shadow-sm bg-white/60"
                      required
                    >
                      <option value="">{t("Select Status")}</option>
                      {medicalStatusOptions.map((option) => (
                        <option key={option} value={option}>
                          {t(option)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <VoiceButton
                    listening={
                      listening && activeVoiceField === "currentMedicalStatus"
                    }
                    onClick={() => toggleVoiceInput("currentMedicalStatus")}
                    fieldName="medical status"
                  />
                </div>
                <div className="flex justify-between gap-2 mt-4 sm:mt-6">
                  <Button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl shadow w-1/2 sm:w-auto"
                  >
                    {t("Back")}
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow w-1/2 sm:w-auto"
                  >
                    {t("Next")}
                  </Button>
                </div>
              </div>
            )}
            {/* Step 5: Medical Certificate Upload */}
            {step === 5 && (
              <div className="space-y-6 sm:space-y-8">
                <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-4 sm:mb-6 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />{" "}
                  {t("Medical Certificate Upload")}{" "}
                  <span className="text-sm text-gray-500">
                    ({t("Optional")})
                  </span>
                </h2>
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-4 p-6 border-2 border-dashed border-blue-200 rounded-xl hover:border-blue-400 transition-all duration-300 bg-white/60 hover:bg-blue-50/50">
                    <Upload className="text-blue-400 w-6 h-6" />
                    <span className="text-sm text-blue-600 font-medium">
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
                {previewUrls.medicalCertificate && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      {t("Preview")}:
                    </p>
                    <img
                      src={previewUrls.medicalCertificate}
                      alt="Medical Certificate Preview"
                      className="max-w-full h-auto rounded-lg shadow-md border border-gray-200"
                    />
                  </div>
                )}
                <div className="flex justify-between gap-2 mt-4 sm:mt-6">
                  <Button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl shadow w-1/2 sm:w-auto"
                  >
                    {t("Back")}
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow w-1/2 sm:w-auto"
                  >
                    {t("Next")}
                  </Button>
                </div>
              </div>
            )}
            {/* Step 6: Profile Image Upload */}
            {step === 6 && (
              <div className="space-y-6 sm:space-y-8">
                <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-4 sm:mb-6 flex items-center gap-2">
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />{" "}
                  {t("Profile Image Upload")}{" "}
                  <span className="text-sm text-gray-500">
                    ({t("Optional")})
                  </span>
                </h2>
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-4 p-6 border-2 border-dashed border-blue-200 rounded-xl hover:border-blue-400 transition-all duration-300 bg-white/60 hover:bg-blue-50/50">
                    <Upload className="text-blue-400 w-6 h-6" />
                    <span className="text-sm text-blue-600 font-medium">
                      {formData.profileImage
                        ? formData.profileImage.name
                        : t("Click to Upload")}
                    </span>
                  </div>
                  <input
                    type="file"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                    accept=".jpg,.jpeg,.png"
                  />
                </label>
                {previewUrls.profileImage && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      {t("Preview")}:
                    </p>
                    <img
                      src={previewUrls.profileImage}
                      alt="Profile Image Preview"
                      className="w-32 h-32 object-cover rounded-full mx-auto shadow-md border-4 border-white"
                    />
                  </div>
                )}
                <div className="flex justify-between gap-2 mt-4 sm:mt-6">
                  <Button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl shadow w-1/2 sm:w-auto"
                  >
                    {t("Back")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow w-1/2 sm:w-auto"
                  >
                    {isLoading ? t("Saving...") : t("Finish & Save")}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
