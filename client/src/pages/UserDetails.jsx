import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Calendar,
  Phone,
  MapPin,
  ClipboardList,
  Heart,
  Mic,
  Sparkles,
  Shield,
  Activity,
  Upload,
  Camera,
  FileText,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useApp } from "../context/AppContext";
import { useVoice } from "../hooks/useVoice";
import { storage } from "../utils/storage";
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
  const { user, setUser, updateUser, loading } = useApp();
  const { speak } = useVoice();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeVoiceField, setActiveVoiceField] = useState(null);
  const [step, setStep] = useState(1); // Step state
  const [subStep, setSubStep] = useState(0); // For emergency contacts
  const [isPreFilled, setIsPreFilled] = useState(false); // Track if form is pre-filled with existing data

  // Show loading state if user data is not yet available
  if (loading || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

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
    name: user?.name || "",
    age: "",
    gender: "",
    address: "",
    emergencyContacts: [
      { name: "", number: "" },
      { name: "", number: "" },
    ],
    healthCondition: { selected: "", custom: "" },
    currentMedicalStatus: "",
    medicalReport: null,
    profilePicture: null,
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
    "Age & Gender",
    "Address",
    "Emergency Contact",
    "Health & Status",
    "Medical Report",
    "Profile Picture",
  ];

  useEffect(() => {
    if (user) {
      console.log('Initializing form with user data:', user);
      
      // Check if user has existing profile data
      const hasExistingData = user.age || user.gender || user.address || user.healthCondition || user.currentMedicalStatus;
      setIsPreFilled(hasExistingData);
      
      setFormData({
        name: user.name || "",
        age: user.age || "",
        gender: user.gender || "",
        address: user.address || "",
        emergencyContacts: user.emergencyContacts && user.emergencyContacts.length > 0 
          ? user.emergencyContacts 
          : [{ name: "", number: "" }, { name: "", number: "" }],
        healthCondition: {
          selected: user.healthCondition || "",
          custom: "",
        },
        currentMedicalStatus: user.currentMedicalStatus || "",
        medicalReport: user.medicalReport || null,
        profilePicture: user.profilePicture || null,
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
        title = "Enter Your Age & Gender";
        break;
      case 2:
        title = "Enter Your Address";
        break;
      case 3:
        title = "Enter Emergency Contact";
        break;
      case 4:
        title = "Enter Health & Status";
        break;
      case 5:
        title = "Upload Medical Report";
        break;
      case 6:
        title = "Upload Profile Picture";
        break;
      default:
        break;
    }
    if (title) speak(title);
    // eslint-disable-next-line
  }, [step]);

  const toggleVoiceInput = (fieldName) => {
    if (!browserSupportsSpeechRecognition) {
      setError("Speech recognition not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    if (!isMicrophoneAvailable) {
      setError("Microphone access is required for voice input. Please enable microphone permissions.");
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
      setError("Failed to start voice recognition. Please try again.");
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

  // Smart compression function - only used when files are too large
  const compressImage = (file, maxWidth = 800, quality = 0.7, maxSizeKB = 300) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Draw image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Try different quality levels until we get under maxSizeKB
        const tryCompress = (currentQuality) => {
          canvas.toBlob((blob) => {
            if (blob.size <= maxSizeKB * 1024 || currentQuality <= 0.1) {
              resolve(blob);
            } else {
              // Reduce quality and try again
              tryCompress(currentQuality - 0.1);
            }
          }, 'image/jpeg', currentQuality);
        };
        
        tryCompress(quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Handle file uploads with smart compression (only compress when needed)
  const handleFileUpload = async (field, file) => {
    if (!file) return;
    
    // Validate file types
    if (field === "medicalReport") {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a PDF or image file for medical report.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError("Medical report file size should be less than 10MB.");
        return;
      }
    } else if (field === "profilePicture") {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a JPEG or PNG image for profile picture.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Profile picture file size should be less than 5MB.");
        return;
      }
    }

    // Helper function to check if base64 size is acceptable for Firestore
    const checkFileSize = (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Data = e.target.result;
          const estimatedSize = base64Data.length;
          const sizeInKB = estimatedSize / 1024;
          
          // Check if file is within Firestore limits (400KB for safe storage)
          const isAcceptableSize = estimatedSize <= 400000; // 400KB limit for direct upload
          resolve({ isAcceptableSize, base64Data, estimatedSize, sizeInKB });
        };
        reader.readAsDataURL(file);
      });
    };

    try {
      // First, check if the original file can be uploaded as-is
      const originalFileCheck = await checkFileSize(file);
      
      let processedFile = file;
      let compressionApplied = false;
      let finalBase64Data = originalFileCheck.base64Data;
      
      // Only compress if the original file is too large for Firestore
      if (!originalFileCheck.isAcceptableSize) {
        console.log(`File too large (${originalFileCheck.sizeInKB.toFixed(0)}KB), applying compression...`);
        
        if (file.type.startsWith('image/')) {
          if (field === "profilePicture") {
            processedFile = await compressImage(file, 400, 0.6, 250); // Max 250KB for profile pictures
          } else if (field === "medicalReport") {
            processedFile = await compressImage(file, 800, 0.7, 300); // Max 300KB for medical reports
          }
          compressionApplied = true;
          
          // Check compressed file size
          const compressedCheck = await checkFileSize(processedFile);
          finalBase64Data = compressedCheck.base64Data;
          
          if (!compressedCheck.isAcceptableSize) {
            setError(`File still too large after compression (${compressedCheck.sizeInKB.toFixed(0)}KB). Please use a smaller file or lower resolution image.`);
            return;
          }
        } else if (file.type === 'application/pdf') {
          // For PDFs, check if they're small enough after base64 encoding
          if (originalFileCheck.estimatedSize > 400000) { // 400KB limit for PDFs
            setError("PDF file is too large. Please compress it to under 300KB or convert to image format.");
            return;
          }
        }
      } else {
        console.log(`File size acceptable (${originalFileCheck.sizeInKB.toFixed(0)}KB), uploading as-is.`);
      }

      const fileData = {
        name: file.name,
        originalSize: file.size,
        compressedSize: processedFile.size || file.size,
        type: file.type,
        data: finalBase64Data,
        lastModified: file.lastModified,
        uploadedAt: new Date().toISOString(),
        compressed: compressionApplied,
        compressionRatio: compressionApplied ? ((file.size - (processedFile.size || file.size)) / file.size * 100).toFixed(1) : 0
      };
      
      setFormData((prev) => ({ ...prev, [field]: fileData }));
      setError(""); // Clear any existing errors
      
      // Show success message with compression info
      if (compressionApplied) {
        const savedKB = ((file.size - (processedFile.size || file.size)) / 1024).toFixed(0);
        console.log(`File compressed: Saved ${savedKB}KB (${fileData.compressionRatio}% reduction)`);
      } else {
        console.log(`File uploaded without compression: ${(file.size / 1024).toFixed(0)}KB`);
      }
      
    } catch (error) {
      console.error("Error processing file:", error);
      setError("Failed to process file. Please try again with a smaller file.");
    }
  };

  // Step navigation with validation
  const validateStep = () => {
    if (step === 1) {
      const age = parseInt(formData.age, 10);
      return formData.age && age > 0 && age <= 150 && formData.gender;
    }
    if (step === 2) {
      return formData.address.trim();
    }
    if (step === 3) {
      const contact = formData.emergencyContacts[subStep];
      return contact.name.trim() && contact.number.trim();
    }
    if (step === 4) {
      if (formData.healthCondition.selected === "Other") {
        return formData.healthCondition.custom.trim() && formData.currentMedicalStatus.trim();
      }
      return formData.healthCondition.selected && formData.currentMedicalStatus.trim();
    }
    if (step === 5) {
      // Medical report is optional, so always return true
      return true;
    }
    if (step === 6) {
      // Profile picture is optional, so always return true
      return true;
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setError(""); // Clear any existing errors when moving to next step
    if (step === 3 && subStep < 1) {
      setSubStep(subStep + 1);
    } else {
      setStep(step + 1);
      setSubStep(0);
    }
  };
  const prevStep = () => {
    setError(""); // Clear any existing errors when moving to previous step
    if (step === 3 && subStep > 0) {
      setSubStep(subStep - 1);
    } else if (step > 1) {
      setStep(step - 1);
      if (step === 4) setSubStep(1); // Go back to last emergency contact
    }
  };

  // Form submission - store everything directly in Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isLoading) return;
    
    setIsLoading(true);
    setError(""); // Clear any existing errors when submitting
    
    try {
      if (!user || !user.id) {
        throw new Error("User not authenticated");
      }

      console.log('Current user before update:', user);

      // Prepare cleaned data - all files stored directly in Firestore
      const cleanedFormData = {
        name: formData.name.trim(),
        age: formData.age ? parseInt(formData.age, 10) || 0 : 0,
        gender: formData.gender.trim(),
        address: formData.address.trim(),
        emergencyContacts: formData.emergencyContacts
          .filter(contact => contact.name.trim() && contact.number.trim())
          .map(contact => ({
            name: contact.name.trim(),
            number: contact.number.trim(),
          })),
        healthCondition: formData.healthCondition.selected === "Other" 
          ? formData.healthCondition.custom.trim()
          : formData.healthCondition.selected,
        currentMedicalStatus: formData.currentMedicalStatus.trim(),
        medicalReport: formData.medicalReport && typeof formData.medicalReport === 'object' && formData.medicalReport.data 
          ? formData.medicalReport 
          : null,
        profilePicture: formData.profilePicture && typeof formData.profilePicture === 'object' && formData.profilePicture.data 
          ? formData.profilePicture 
          : null,
      };

      // Calculate total document size to ensure it's under Firestore limits
      const estimatedSize = JSON.stringify(cleanedFormData).length;
      console.log('Total document size:', (estimatedSize / 1024).toFixed(0), 'KB');
      
      if (estimatedSize > 800000) { // 800KB safety limit (Firestore max is 1MB)
        setError("Profile data is too large even after compression. Please use smaller files or remove some data.");
        return;
      }

      console.log('Submitting user data to Firestore:', {
        ...cleanedFormData,
        medicalReport: cleanedFormData.medicalReport ? {
          name: cleanedFormData.medicalReport.name,
          size: cleanedFormData.medicalReport.compressedSize,
          compressed: cleanedFormData.medicalReport.compressed
        } : null,
        profilePicture: cleanedFormData.profilePicture ? {
          name: cleanedFormData.profilePicture.name,
          size: cleanedFormData.profilePicture.compressedSize,
          compressed: cleanedFormData.profilePicture.compressed
        } : null
      });

      // Wait for Firebase update to complete before proceeding
      await updateUser(cleanedFormData);
      
      // Verify the data was updated in context
      console.log('Data update completed successfully');
      
      // Success message with smart compression info
      let successMessage = "Your medical information has been saved successfully.";
      const files = [cleanedFormData.medicalReport, cleanedFormData.profilePicture].filter(Boolean);
      const compressedFiles = files.filter(f => f.compressed);
      const uncompressedFiles = files.filter(f => !f.compressed);
      
      if (compressedFiles.length > 0 && uncompressedFiles.length > 0) {
        successMessage += " Some files were compressed for optimal storage while others were uploaded as-is.";
      } else if (compressedFiles.length > 0) {
        successMessage += " Files were automatically compressed for optimal storage.";
      } else if (uncompressedFiles.length > 0) {
        successMessage += " Files were uploaded in their original quality.";
      }
      
      speak(successMessage + " Redirecting to your profile.");
      
      // Small delay to ensure context update propagates
      setTimeout(() => {
        // Navigate to profile page to show updated data
        navigate("/profile");
      }, 500);
      
    } catch (error) {
      console.error("Error saving user data:", error);
      speak("Failed to save your information. Please try again.");
      
      // Show user-friendly error message
      if (error.message.includes("User not authenticated")) {
        setError("You are not logged in. Please login again.");
        setTimeout(() => navigate("/login"), 2000);
      } else if (error.message.includes("permission-denied")) {
        setError("Permission denied. Please check your authentication.");
      } else if (error.message.includes("network") || error.message.includes("unavailable")) {
        setError("Network error. Please check your internet connection and try again.");
      } else if (error.message.includes("deadline-exceeded")) {
        setError("The request took too long to complete. Please check your connection and try again.");
      } else if (error.message.includes("unauthenticated")) {
        setError("Authentication expired. Please log in again.");
        setTimeout(() => navigate("/login"), 2000);
      } else if (error.message.includes("exceeds the maximum allowed size")) {
        setError("Files are too large even after compression. Please upload smaller files with lower resolution.");
      } else {
        setError(`Failed to save information: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check for browser support
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md text-center border border-white/20">
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
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-2 sm:p-4 relative text-gray-900">
      {/* Progress bar (show only current step on mobile) */}
      <div className="fixed top-0 left-0 w-full z-40 bg-white py-2 px-1 sm:py-3 sm:px-4 flex items-center justify-center gap-1 sm:gap-2 shadow-md">
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
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-white text-base sm:text-lg shadow-lg transition-all duration-300 ${
                  step === idx + 1
                    ? "bg-gradient-to-br from-purple-500 to-indigo-500 scale-110"
                    : step > idx + 1
                    ? "bg-green-400 scale-100"
                    : "bg-gray-300 scale-90"
                }`}
              >
                {idx + 1}
              </div>
              <span
                className={`text-[10px] sm:text-xs mt-1 font-medium text-center ${
                  step === idx + 1 ? "text-indigo-700" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/20 p-4 sm:p-8 animate-fade-in-up">
          <form
            onSubmit={handleSubmit}
            onKeyDown={(e) => {
              // Prevent form submission by Enter
              if (e.key === "Enter") {
                // Do not submit form at all 
                e.preventDefault();
                return false;
              }
            }}
            className="space-y-8 sm:space-y-10 text-gray-900"
          >
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            {/* Step 1: Age & Gender */}
            {step === 1 && (
              <div className="space-y-6 sm:space-y-8">
                <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-4 sm:mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" /> Your
                  Age & Gender
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      label="Age"
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
                      className="w-full p-4 border border-gray-200 rounded-xl transition-all duration-300 shadow-sm bg-white/60"
                      required
                    >
                      <option value="">Select Gender</option>
                      {genderOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
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
                    Next
                  </Button>
                </div>
              </div>
            )}
            {/* Step 2: Address */}
            {step === 2 && (
              <div className="space-y-6 sm:space-y-8">
                <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-4 sm:mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />{" "}
                  Your Address
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      label="Address"
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
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow w-1/2 sm:w-auto"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
            {/* Step 3: Emergency Contact (one at a time) */}
            {step === 3 && (
              <div className="space-y-6 sm:space-y-8">
                <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-4 sm:mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />{" "}
                  Emergency Contact
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      label={`Contact Name (${subStep + 1})`}
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
                      label={`Contact Number (${subStep + 1})`}
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
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow w-1/2 sm:w-auto"
                  >
                    {subStep === 1 ? "Next" : "Next Contact"}
                  </Button>
                </div>
              </div>
            )}
            {/* Step 4: Health Condition & Status */}
            {step === 4 && (
              <div className="space-y-6 sm:space-y-8">
                <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-4 sm:mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />{" "}
                  Health & Status
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <select
                      value={formData.healthCondition.selected}
                      onChange={handleHealthConditionChange}
                      className="w-full p-4 border border-gray-200 rounded-xl transition-all duration-300 shadow-sm bg-white/60"
                      required
                    >
                      <option value="">Select Your Health Condition</option>
                      {healthConditionOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                      <option value="Other">Other</option>
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
                        label="Specify Condition"
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
                      className="w-full p-4 border border-gray-200 rounded-xl transition-all duration-300 shadow-sm bg-white/60"
                      required
                    >
                      <option value="">Select Status</option>
                      {medicalStatusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
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
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow w-1/2 sm:w-auto"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Medical Report Upload */}
            {step === 5 && (
              <div className="space-y-6 sm:space-y-8">
                <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-4 sm:mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />{" "}
                  Medical Report (Optional)
                </h2>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-white/60 hover:border-blue-400 transition-colors duration-300">
                  <input
                    type="file"
                    id="medicalReport"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload("medicalReport", e.target.files[0])}
                    className="hidden"
                  />
                  <label
                    htmlFor="medicalReport"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <Upload className="w-12 h-12 text-blue-500" />
                    <div>
                      <p className="text-lg font-semibold text-gray-700 mb-1">
                        Upload Medical Report
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF, JPEG, PNG files (Max 10MB) - Auto-compressed if needed
                      </p>
                    </div>
                    {formData.medicalReport && formData.medicalReport.data && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-green-700 font-medium">
                          ✓ {formData.medicalReport.name}
                        </p>
                        <p className="text-green-600 text-sm">
                          Size: {(formData.medicalReport.compressedSize / 1024 / 1024).toFixed(2)} MB
                          {formData.medicalReport.compressed ? (
                            <span className="ml-2 text-green-700 font-medium">
                              (Auto-compressed {formData.medicalReport.compressionRatio}% - Saved {((formData.medicalReport.originalSize - formData.medicalReport.compressedSize) / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          ) : (
                            <span className="ml-2 text-blue-700 font-medium">
                              (Uploaded without compression)
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                <div className="flex justify-between gap-2 mt-4 sm:mt-6">
                  <Button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl shadow w-1/2 sm:w-auto"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow w-1/2 sm:w-auto"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* Step 6: Profile Picture Upload */}
            {step === 6 && (
              <div className="space-y-6 sm:space-y-8">
                <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-4 sm:mb-6 flex items-center gap-2">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />{" "}
                  Profile Picture (Optional)
                </h2>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-white/60 hover:border-blue-400 transition-colors duration-300">
                  <input
                    type="file"
                    id="profilePicture"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload("profilePicture", e.target.files[0])}
                    className="hidden"
                  />
                  <label
                    htmlFor="profilePicture"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    {formData.profilePicture && formData.profilePicture.data ? (
                      <div className="flex flex-col items-center gap-3">
                        <img
                          src={formData.profilePicture.data}
                          alt="Profile Preview"
                          className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
                        />
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-700 mb-1">
                            Change Profile Picture
                          </p>
                          <p className="text-sm text-gray-500">
                            JPEG, PNG files (Max 5MB)
                          </p>
                          {formData.profilePicture.compressed ? (
                            <p className="text-green-600 text-xs mt-1">
                              Auto-compressed {formData.profilePicture.compressionRatio}% 
                              (Size: {(formData.profilePicture.compressedSize / 1024).toFixed(0)}KB)
                            </p>
                          ) : (
                            <p className="text-blue-600 text-xs mt-1">
                              Uploaded without compression 
                              (Size: {(formData.profilePicture.compressedSize / 1024).toFixed(0)}KB)
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <Camera className="w-12 h-12 text-blue-500" />
                        <div>
                          <p className="text-lg font-semibold text-gray-700 mb-1">
                            Upload Profile Picture
                          </p>
                          <p className="text-sm text-gray-500">
                            JPEG, PNG files (Max 5MB) - Auto-compressed if needed
                          </p>
                        </div>
                      </>
                    )}
                  </label>
                </div>
                <div className="flex justify-between gap-2 mt-4 sm:mt-6">
                  <Button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl shadow w-1/2 sm:w-auto"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-600 text-white px-6 py-2 rounded-xl shadow w-1/2 sm:w-auto"
                  >
                    {isLoading ? "Saving your information..." : "Complete Setup"}
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
