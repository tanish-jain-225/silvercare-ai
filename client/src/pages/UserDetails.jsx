import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Calendar,
  Phone,
  MapPin,
  ClipboardList,
  Heart,
  Sparkles,
  Shield,
  Activity,
  Upload,
  Camera,
  FileText,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { VoiceButton } from "../components/voice/VoiceButton";
import { useApp } from "../context/AppContext";
import { useVoice } from "../hooks/useVoice";
import { storage } from "../utils/storage";


export function UserDetails() {
  const navigate = useNavigate();
  const { user, setUser, updateUser, loading } = useApp();
  const { speak } = useVoice();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // Step state
  const [subStep, setSubStep] = useState(0); // For emergency contacts
  const [isPreFilled, setIsPreFilled] = useState(false); // Track if form is pre-filled with existing data

  // Upload state management for cancelable uploads
  const [uploadStates, setUploadStates] = useState({
    medicalReport: { 
      isUploading: false, 
      progress: 0, 
      controller: null,
      stage: 'idle' // idle, validating, compressing, uploading, complete, error
    },
    profilePicture: { 
      isUploading: false, 
      progress: 0, 
      controller: null,
      stage: 'idle'
    }
  });

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

  // Welcome message effect - must be at top level
  useEffect(() => {
    speak(
      "Please provide your medical information for better healthcare assistance."
    );
  }, [speak]);

  // Cleanup effect to cancel uploads on unmount
  useEffect(() => {
    return () => {
      // Cancel any ongoing uploads when component unmounts
      Object.entries(uploadStates).forEach(([field, state]) => {
        if (state.controller && state.isUploading) {
          state.controller.abort();
        }
      });
    };
  }, []); // Empty dependency array ensures this only runs on unmount

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

  // Handle voice input for different fields
  const handleVoiceInput = (field) => (text) => {
    switch (field) {
      case "age":
        // Extract numbers from voice input
        const ageMatch = text.match(/\d+/);
        if (ageMatch) {
          setFormData(prev => ({ ...prev, age: ageMatch[0] }));
        }
        break;
      case "address":
        setFormData(prev => ({ ...prev, address: text }));
        break;
      case "emergencyContactName":
        handleEmergencyContactChange(subStep, "name", text);
        break;
      case "emergencyContactNumber":
        // Extract phone number patterns
        const cleanedNumber = text.replace(/\D/g, ''); // Remove non-digits
        if (cleanedNumber.length >= 10) {
          handleEmergencyContactChange(subStep, "number", cleanedNumber);
        } else {
          handleEmergencyContactChange(subStep, "number", text);
        }
        break;
      case "healthConditionCustom":
        setFormData(prev => ({
          ...prev,
          healthCondition: {
            ...prev.healthCondition,
            custom: text
          }
        }));
        break;
      default:
        break;
    }
  };

  // Helper function to update upload progress
  const updateUploadProgress = (field, progress, stage) => {
    setUploadStates(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        progress,
        stage
      }
    }));
  };

  // Cancel upload function
  const cancelUpload = (field) => {
    const uploadState = uploadStates[field];
    
    if (uploadState.controller) {
      uploadState.controller.abort();
    }
    
    setUploadStates(prev => ({
      ...prev,
      [field]: {
        isUploading: false,
        progress: 0,
        controller: null,
        stage: 'idle'
      }
    }));
    
    // Clear file data if upload was in progress
    setFormData(prev => ({ ...prev, [field]: null }));
    
    // Clear any existing errors
    setError("");
    
    speak(`${field === 'medicalReport' ? 'Medical report' : 'Profile picture'} upload cancelled.`);
  };

  // Remove uploaded file
  const removeFile = (field) => {
    setFormData(prev => ({ ...prev, [field]: null }));
    setError("");
    speak(`${field === 'medicalReport' ? 'Medical report' : 'Profile picture'} removed.`);
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

  // Handle file uploads with smart compression and cancellation support
  const handleFileUpload = async (field, file) => {
    if (!file) return;
    
    // Create AbortController for this upload
    const controller = new AbortController();
    
    // Update upload state to show upload starting
    setUploadStates(prev => ({
      ...prev,
      [field]: {
        isUploading: true,
        progress: 0,
        controller: controller,
        stage: 'validating'
      }
    }));

    try {
      // Clear any existing errors
      setError("");
      
      // File type validation
      if (field === "medicalReport") {
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
          throw new Error("Please upload a PDF or image file for medical report.");
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          throw new Error("Medical report file size should be less than 10MB.");
        }
      } else if (field === "profilePicture") {
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
          throw new Error("Please upload a JPEG or PNG image for profile picture.");
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error("Profile picture file size should be less than 5MB.");
        }
      }

      // Update progress: Validation complete
      updateUploadProgress(field, 15, 'validating');
      
      // Check if upload was cancelled after validation
      if (controller.signal.aborted) {
        throw new Error('Upload cancelled');
      }

      // Helper function to check if base64 size is acceptable for Firestore
      const checkFileSize = (file) => {
        return new Promise((resolve, reject) => {
          if (controller.signal.aborted) {
            reject(new Error('Upload cancelled'));
            return;
          }
          
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64Data = e.target.result;
            const estimatedSize = base64Data.length;
            const sizeInKB = estimatedSize / 1024;
            
            // Check if file is within Firestore limits (400KB for safe storage)
            const isAcceptableSize = estimatedSize <= 400000; // 400KB limit for direct upload
            resolve({ isAcceptableSize, base64Data, estimatedSize, sizeInKB });
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
      };

      // Update progress: Starting size check
      updateUploadProgress(field, 25, 'checking size');
      
      // First, check if the original file can be uploaded as-is
      const originalFileCheck = await checkFileSize(file);
      
      // Check if upload was cancelled after size check
      if (controller.signal.aborted) {
        throw new Error('Upload cancelled');
      }
      
      let processedFile = file;
      let compressionApplied = false;
      let finalBase64Data = originalFileCheck.base64Data;
      
      // Only compress if the original file is too large for Firestore
      if (!originalFileCheck.isAcceptableSize) {
        updateUploadProgress(field, 40, 'compressing');
        console.log(`File too large (${originalFileCheck.sizeInKB.toFixed(0)}KB), applying compression...`);
        
        if (file.type.startsWith('image/')) {
          if (field === "profilePicture") {
            processedFile = await compressImage(file, 400, 0.6, 250); // Max 250KB for profile pictures
          } else if (field === "medicalReport") {
            processedFile = await compressImage(file, 800, 0.7, 300); // Max 300KB for medical reports
          }
          compressionApplied = true;
          
          // Check if upload was cancelled during compression
          if (controller.signal.aborted) {
            throw new Error('Upload cancelled');
          }
          
          // Update progress: Compression complete
          updateUploadProgress(field, 70, 'validating compressed file');
          
          // Check compressed file size
          const compressedCheck = await checkFileSize(processedFile);
          finalBase64Data = compressedCheck.base64Data;
          
          if (!compressedCheck.isAcceptableSize) {
            throw new Error(`File still too large after compression (${compressedCheck.sizeInKB.toFixed(0)}KB). Please use a smaller file or lower resolution image.`);
          }
        } else if (file.type === 'application/pdf') {
          // For PDFs, check if they're small enough after base64 encoding
          if (originalFileCheck.estimatedSize > 400000) { // 400KB limit for PDFs
            throw new Error("PDF file is too large. Please compress it to under 300KB or convert to image format.");
          }
        }
      } else {
        updateUploadProgress(field, 60, 'preparing upload');
        console.log(`File size acceptable (${originalFileCheck.sizeInKB.toFixed(0)}KB), uploading as-is.`);
      }

      // Final check for cancellation before setting form data
      if (controller.signal.aborted) {
        throw new Error('Upload cancelled');
      }
      
      // Update progress: Finalizing
      updateUploadProgress(field, 85, 'finalizing');

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
      
      // Update form data - this is the critical step that sometimes fails
      setFormData((prev) => {
        console.log(`Setting form data for ${field}:`, fileData.name);
        return { ...prev, [field]: fileData };
      });
      
      // Update progress: Complete
      updateUploadProgress(field, 100, 'complete');
      
      // Mark upload as complete with a shorter delay and better error handling
      setTimeout(() => {
        setUploadStates(prev => ({
          ...prev,
          [field]: {
            ...prev[field],
            isUploading: false,
            controller: null,
            stage: 'complete'
          }
        }));
      }, 500); // Reduced from 1000ms to 500ms
      
      // Show success message with compression info
      if (compressionApplied) {
        const savedKB = ((file.size - (processedFile.size || file.size)) / 1024).toFixed(0);
        console.log(`File compressed: Saved ${savedKB}KB (${fileData.compressionRatio}% reduction)`);
        speak(`${field === 'medicalReport' ? 'Medical report' : 'Profile picture'} uploaded successfully with ${fileData.compressionRatio}% compression.`);
      } else {
        console.log(`File uploaded without compression: ${(file.size / 1024).toFixed(0)}KB`);
        speak(`${field === 'medicalReport' ? 'Medical report' : 'Profile picture'} uploaded successfully.`);
      }
      
    } catch (error) {
      console.error("Error processing file:", error);
      
      // Always reset upload state on error
      setUploadStates(prev => ({
        ...prev,
        [field]: {
          isUploading: false,
          progress: 0,
          controller: null,
          stage: error.message === 'Upload cancelled' ? 'idle' : 'error'
        }
      }));
      
      // Clear form data on error (except for cancellation)
      if (error.message !== 'Upload cancelled') {
        setFormData(prev => ({ ...prev, [field]: null }));
        setError(error.message || "Failed to process file. Please try again with a smaller file.");
        speak(`Failed to upload ${field === 'medicalReport' ? 'medical report' : 'profile picture'}. ${error.message}`);
      }
      
      // Reset file input to allow re-upload of the same file
      const fileInput = document.getElementById(field);
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  // Upload Progress Component
  const UploadProgress = ({ field, uploadState, onCancel }) => {
    const { isUploading, progress, stage } = uploadState;
    
    if (!isUploading) return null;
    
    const stageMessages = {
      idle: 'Ready to upload',
      validating: 'Validating file...',
      'checking size': 'Checking file size...',
      compressing: 'Compressing for optimal storage...',
      'validating compressed file': 'Validating compressed file...',
      'preparing upload': 'Preparing upload...',
      finalizing: 'Finalizing...',
      complete: 'Upload complete!',
      error: 'Upload failed'
    };
    
    return (
      <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200 w-full overflow-hidden">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {stage === 'complete' ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
            ) : stage === 'error' ? (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
            ) : (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-medium text-blue-700 truncate">
              {stageMessages[stage] || stage}
            </span>
          </div>
          {stage !== 'complete' && stage !== 'error' && (
            <button
              onClick={() => onCancel(field)}
              className="flex items-center gap-1 px-2 sm:px-3 py-1 text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium bg-red-50 hover:bg-red-100 rounded-full transition-colors duration-200 flex-shrink-0"
              aria-label="Cancel upload"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Cancel</span>
            </button>
          )}
        </div>
        
        <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-blue-600 gap-2">
          <span className="truncate">{progress}% complete</span>
          <span className="capitalize truncate">{stage}</span>
        </div>
      </div>
    );
  };

  // File Preview Component
  const FilePreview = ({ field, fileData, onRemove }) => {
    const isImage = fileData.type.startsWith('image/');
    const sizeInMB = (fileData.compressedSize / (1024 * 1024)).toFixed(2);
    
    return (
      <div className="mt-3 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200 w-full overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {isImage && fileData.data ? (
              <img
                src={fileData.data}
                alt="Preview"
                className={`object-cover border-2 border-green-200 flex-shrink-0 ${
                  field === 'profilePicture' 
                    ? 'w-10 h-10 sm:w-12 sm:h-12 rounded-full' 
                    : 'w-10 h-10 sm:w-12 sm:h-12 rounded'
                }`}
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-green-700 font-medium text-xs sm:text-sm truncate">
                {fileData.name}
              </p>
              <p className="text-green-600 text-xs">
                <span className="truncate">Size: {sizeInMB} MB</span>
                {fileData.compressed && (
                  <span className="block sm:inline sm:ml-2 text-green-700 font-medium">
                    (Compressed {fileData.compressionRatio}%)
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="p-1 sm:p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200 flex-shrink-0"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Enhanced File Upload Card Component
  const FileUploadCard = ({ 
    field, 
    title, 
    description, 
    accept, 
    icon: Icon,
    formData, 
    uploadState, 
    onFileSelect, 
    onCancel, 
    onRemove 
  }) => {
    const hasFile = formData[field] && formData[field].data;
    const { isUploading } = uploadState;
    
    return (
      <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center bg-white/60 hover:border-blue-400 transition-colors duration-300 overflow-hidden">
        {!hasFile && !isUploading && (
          <>
            <input
              type="file"
              id={field}
              accept={accept}
              onChange={(e) => onFileSelect(field, e.target.files[0])}
              className="hidden"
            />
            <label htmlFor={field} className="cursor-pointer flex flex-col items-center gap-2 sm:gap-3 w-full">
              <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500" />
              <div className="w-full">
                <p className="text-base sm:text-lg font-semibold text-gray-700 mb-1">{title}</p>
                <p className="text-xs sm:text-sm text-gray-500 px-2 leading-relaxed">{description}</p>
              </div>
            </label>
          </>
        )}
        
        {isUploading && (
          <UploadProgress field={field} uploadState={uploadState} onCancel={onCancel} />
        )}
        
        {hasFile && !isUploading && (
          <FilePreview 
            field={field} 
            fileData={formData[field]} 
            onRemove={() => onRemove(field)} 
          />
        )}
      </div>
    );
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
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/20 p-4 sm:p-8 animate-fade-in-up my-10">
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
                <div className="relative flex items-center min-w-0">
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
                    className="pr-14 sm:pr-16 md:pr-20 min-w-0 bg-white/60"
                  />
                  <div className="absolute inset-y-0 right-4 top-4 flex items-center pointer-events-auto">
                    <VoiceButton
                      onResult={handleVoiceInput("age")}
                      size="sm"
                      className="!w-9 sm:!w-10"
                      type="button"
                      tabIndex={-1}
                    />
                  </div>
                </div>
                <div>
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
                <div className="relative flex items-center min-w-0">
                  <Input
                    type="text"
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    icon={MapPin}
                    required
                    className="pr-14 sm:pr-16 md:pr-20 min-w-0 bg-white/60"
                  />
                  <div className="absolute inset-y-0 right-4 top-4 flex items-center pointer-events-auto">
                    <VoiceButton
                      onResult={handleVoiceInput("address")}
                      size="sm"
                      className="!w-9 sm:!w-10"
                      type="button"
                      tabIndex={-1}
                    />
                  </div>
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
                <div className="relative flex items-center min-w-0">
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
                    className="pr-14 sm:pr-16 md:pr-20 min-w-0 bg-white/60"
                  />
                  <div className="absolute inset-y-0 right-4 top-4 flex items-center pointer-events-auto">
                    <VoiceButton
                      onResult={handleVoiceInput("emergencyContactName")}
                      size="sm"
                      className="!w-9 sm:!w-10"
                      type="button"
                      tabIndex={-1}
                    />
                  </div>
                </div>
                <div className="relative flex items-center min-w-0">
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
                    className="pr-14 sm:pr-16 md:pr-20 min-w-0 bg-white/60"
                  />
                  <div className="absolute inset-y-0 right-4 top-4 flex items-center pointer-events-auto">
                    <VoiceButton
                      onResult={handleVoiceInput("emergencyContactNumber")}
                      size="sm"
                      className="!w-9 sm:!w-10"
                      type="button"
                      tabIndex={-1}
                    />
                  </div>
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
                <div>
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
                {formData.healthCondition.selected === "Other" && (
                  <div className="relative flex items-center min-w-0">
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
                      className="pr-14 sm:pr-16 md:pr-20 min-w-0 bg-white/60"
                    />
                    <div className="absolute inset-y-0 right-4 top-4 flex items-center pointer-events-auto">
                      <VoiceButton
                        onResult={handleVoiceInput("healthConditionCustom")}
                        size="sm"
                        className="!w-9 sm:!w-10"
                        type="button"
                        tabIndex={-1}
                      />
                    </div>
                  </div>
                )}
                <div>
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
                
                <FileUploadCard
                  field="medicalReport"
                  title="Upload Medical Report"
                  description="PDF, JPEG, PNG files (Max 10MB) - Auto-compressed if needed"
                  accept=".pdf,.jpg,.jpeg,.png"
                  icon={Upload}
                  formData={formData}
                  uploadState={uploadStates.medicalReport}
                  onFileSelect={handleFileUpload}
                  onCancel={cancelUpload}
                  onRemove={removeFile}
                />
                
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
                
                <FileUploadCard
                  field="profilePicture"
                  title="Upload Profile Picture"
                  description="JPEG, PNG files (Max 5MB) - Auto-compressed if needed"
                  accept=".jpg,.jpeg,.png"
                  icon={Camera}
                  formData={formData}
                  uploadState={uploadStates.profilePicture}
                  onFileSelect={handleFileUpload}
                  onCancel={cancelUpload}
                  onRemove={removeFile}
                />
                
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
                    disabled={isLoading || uploadStates.medicalReport.isUploading || uploadStates.profilePicture.isUploading}
                    className="bg-green-600 text-white px-6 py-2 rounded-xl shadow w-1/2 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
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
