import React, { useState } from "react";
import {
  ArrowLeft,
  User,
  Heart,
  Settings,
  Globe,
  LogOut,
  Edit,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useApp } from "../context/AppContext";
import { useVoice } from "../hooks/useVoice";

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "mr", name: "Marathi" },
  { code: "gu", name: "Gujarati" },
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
      speak("Profile updated successfully");
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
    const langName =
      languages.find((l) => l.code === newLanguage)?.name || newLanguage;
    speak(`Language changed to ${langName}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  React.useEffect(() => {
    speak(
      "Welcome to your profile. You can view and edit your information here."
    );
  }, [speak]);

  if (!user) return null;

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-primary-50 to-primary-100/30 dark:from-dark-50 dark:to-dark-100/30 flex flex-col items-center justify-center pb-32">
      <div className="container mx-auto w-full max-w-4xl px-4 py-12 lg:py-20 flex flex-col items-center">
        {/* Profile Card */}
        <div className="w-full max-w-2xl mb-10 p-10 rounded-3xl shadow-2xl bg-gradient-to-br from-primary-100/90 via-primary-200/90 to-accent-yellow/40 dark:from-dark-100/90 dark:via-dark-200/90 dark:to-accent-yellow/30 backdrop-blur-lg border-b-2 border-primary-200/40 dark:border-dark-600/40 relative animate-fade-in transition-shadow hover:shadow-3xl">
          <button
            type="button"
            onClick={() => navigate("/user-details")}
            className="absolute top-6 right-6 bg-primary-200 dark:bg-primary-100/30 border border-primary-300/40 dark:border-primary-100/30 shadow-lg rounded-full w-12 h-12 flex items-center justify-center hover:bg-primary-300/80 dark:hover:bg-primary-100/50 transition-colors group"
            aria-label="Edit Profile"
          >
            <Edit
              size={26}
              className="text-primary-400 dark:text-primary-100 group-hover:text-primary-900"
            />
            <span className="absolute left-1/2 -bottom-7 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-primary-900 text-white text-xs rounded px-2 py-1 pointer-events-none transition-opacity">
              Edit
            </span>
          </button>
          <div className="flex flex-col items-center gap-4 mt-4">
            <div className="relative">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border-4 border-primary-300 dark:border-primary-200 shadow-md bg-white dark:bg-dark-50"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-white/90 dark:bg-dark-50/90 flex items-center justify-center text-primary-500 dark:text-primary-300 text-5xl font-bold border-4 border-primary-300/50 dark:border-primary-200/50 shadow-md">
                  <User size={56} />
                </div>
              )}
              <span className="absolute bottom-2 right-2 bg-accent-yellow border-2 border-white dark:border-dark-50 w-5 h-5 rounded-full shadow-sm"></span>
            </div>
            <h2 className="text-3xl font-extrabold text-primary-400 dark:text-primary-100 mt-2 tracking-tight">
              {user.name}
            </h2>
            <p className="text-primary-300 dark:text-primary-200 text-lg font-medium">
              {user.email}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-3">
              {user.age && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/90 dark:bg-dark-50/90 text-primary-300 dark:text-primary-100 rounded-full text-sm font-medium border border-primary-300/30 dark:border-primary-200/30">
                  <span className="font-semibold">{user.age}</span>{" "}
                  {t("years", "years")}
                </span>
              )}
              {user.gender && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent-yellow/40 dark:bg-accent-yellow/20 text-primary-300 dark:text-primary-100 rounded-full text-sm font-medium border border-accent-yellow/50 dark:border-accent-yellow/30">
                  {user.gender}
                </span>
              )}
            </div>
            {user.address && (
              <div className="mt-2 px-4 py-2 bg-white/90 dark:bg-dark-50/90 rounded-xl border border-primary-300/30 dark:border-primary-200/30 text-primary-200 dark:text-primary-100 text-center text-sm max-w-xs shadow-sm">
                <span className="font-medium text-primary-300 dark:text-primary-200">
                  {t("address", "Address")}:{" "}
                </span>
                {user.address}
              </div>
            )}
          </div>
        </div>

        {/* Health Information */}
        <Card className="w-full max-w-2xl mb-8 animate-fade-in-up bg-white/95 dark:bg-dark-50/95 border border-primary-100/30 dark:border-dark-600/30 backdrop-blur-md shadow-xl rounded-2xl transition-shadow hover:shadow-2xl">
          <div className="flex items-center mb-5">
            <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-100/20 mr-4">
              <Heart
                className="text-primary-400 dark:text-primary-100"
                size={28}
                aria-hidden="true"
              />
            </div>
            <h3 className="text-xl font-bold text-primary-400 dark:text-primary-100 tracking-tight">
              {t("healthInfo")}
            </h3>
          </div>
          {user.healthCondition ? (
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-primary-100 dark:bg-primary-100/20 text-primary-300 dark:text-primary-100 rounded-full text-sm border border-primary-200/30 dark:border-primary-100/20">
                {t(user.healthCondition)}
              </span>
            </div>
          ) : (
            <p className="text-primary-200 dark:text-primary-100/70">
              {t("noHealthConditions", "No health conditions recorded")}
            </p>
          )}
          {user.currentMedicalStatus && (
            <div className="mt-3">
              <p className="text-sm text-primary-200 dark:text-primary-100/70">
                {t("currentMedicalStatus", "Current Medical Status")}
              </p>
              <p className="text-lg font-medium text-primary-300 dark:text-primary-100">
                {user.currentMedicalStatus}
              </p>
            </div>
          )}
          {user.medicalCertificates && (
            <div className="mt-3">
              <p className="text-sm text-primary-200 dark:text-primary-100/70">
                {t("medicalCertificates", "Medical Certificates")}
              </p>
              <a
                href={user.medicalCertificates}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-300 dark:text-primary-100 underline break-all hover:text-primary-200 dark:hover:text-primary-100/80 transition-colors"
              >
                {t("viewCertificate", "View Certificate")}
              </a>
            </div>
          )}
        </Card>

        {/* Emergency Contacts */}
        {user.emergencyContacts && user.emergencyContacts.length > 0 && (
          <Card className="w-full max-w-2xl mb-8 animate-fade-in-up bg-white/95 dark:bg-dark-50/95 border border-primary-100/30 dark:border-dark-600/30 backdrop-blur-md shadow-xl rounded-2xl transition-shadow hover:shadow-2xl">
            <div className="flex items-center mb-5">
              <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-100/20 mr-4">
                <Settings
                  className="text-primary-400 dark:text-primary-100"
                  size={28}
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-xl font-bold text-primary-400 dark:text-primary-100 tracking-tight">
                {t("emergencyContacts", "Emergency Contacts")}
              </h3>
            </div>
            <ul className="space-y-2">
              {user.emergencyContacts.map((contact, idx) => (
                <li
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 bg-primary-50 dark:bg-primary-100/10 rounded-lg px-4 py-2 border border-primary-200/20 dark:border-primary-100/10"
                >
                  <span className="font-medium text-primary-300 dark:text-primary-100">
                    {contact.name}
                  </span>
                  <span className="text-primary-200 dark:text-primary-100/80">
                    {contact.number}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Language Selection */}
        <Card className="w-full max-w-2xl mb-8 animate-fade-in-up bg-white/95 dark:bg-dark-50/95 border border-primary-100/30 dark:border-dark-600/30 backdrop-blur-md shadow-xl rounded-2xl transition-shadow hover:shadow-2xl">
          <div className="space-y-4">
            <div>
              <div className="flex items-center mb-3">
                <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-100/20 mr-3">
                  <Globe
                    className="text-primary-400 dark:text-primary-100"
                    size={24}
                    aria-hidden="true"
                  />
                </div>
                <p className="font-bold text-primary-400 dark:text-primary-100 text-lg">
                  {t("changeLanguage")}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`p-3 rounded-lg border-2 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 dark:focus-visible:ring-primary-100 ${
                      language === lang.code
                        ? "bg-primary-100 dark:bg-primary-100/20 border-primary-200 dark:border-primary-100 text-primary-300 dark:text-primary-100"
                        : "border-primary-100/20 dark:border-primary-100/10 hover:border-primary-200/30 dark:hover:border-primary-100/20 text-primary-200 dark:text-primary-100/80 hover:bg-primary-50/50 dark:hover:bg-primary-100/10"
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
          className="w-full max-w-2xl animate-fade-in-up mt-2 shadow-lg text-lg font-semibold py-4"
          size="lg"
          icon={LogOut}
          ariaLabel={t("logout")}
        >
          {t("logout")}
        </Button>
      </div>
    </main>
  );
}
