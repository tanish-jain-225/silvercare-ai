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
      {/* Profile Card */}
      <div className="w-full max-w-lg mx-auto mt-8 mb-6 p-6 rounded-3xl shadow-lg bg-white/90 dark:bg-dark-50/90 border border-primary-100/20 dark:border-dark-600/20 backdrop-blur-sm relative animate-fade-in">
        <button
          type="button"
          onClick={() => navigate("/user-details")}
          className="absolute top-4 right-4 bg-primary-100 dark:bg-primary-100/20 border border-primary-200/30 dark:border-primary-100/20 shadow-sm rounded-full w-10 h-10 flex items-center justify-center hover:bg-primary-200 dark:hover:bg-primary-100/30 transition-colors"
          aria-label="Edit Profile"
        >
          <Edit size={22} className="text-primary-300 dark:text-primary-100" />
        </button>
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-primary-200 dark:border-primary-100 shadow-md bg-white dark:bg-dark-50"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-primary-100 dark:bg-primary-100/20 flex items-center justify-center text-primary-300 dark:text-primary-100 text-5xl font-bold border-4 border-primary-200/30 dark:border-primary-100/20 shadow-md">
                <User size={56} />
              </div>
            )}
            <span className="absolute bottom-2 right-2 bg-accent-yellow border-2 border-white dark:border-dark-50 w-5 h-5 rounded-full shadow-sm"></span>
          </div>
          <h2 className="text-2xl font-bold text-primary-300 dark:text-primary-100 mt-2">
            {user.name}
          </h2>
          <p className="text-primary-200 dark:text-primary-100/80 text-lg">
            {user.email}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {user.age && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-100/20 text-primary-300 dark:text-primary-100 rounded-full text-sm font-medium border border-primary-200/30 dark:border-primary-100/20">
                <span className="font-semibold">{user.age}</span>{" "}
                {t("years", "years")}
              </span>
            )}
            {user.gender && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent-yellow/20 dark:bg-accent-yellow/10 text-primary-300 dark:text-primary-100 rounded-full text-sm font-medium border border-accent-yellow/30 dark:border-accent-yellow/20">
                {user.gender}
              </span>
            )}
          </div>
          {user.address && (
            <div className="mt-2 px-4 py-2 bg-primary-50 dark:bg-primary-100/10 rounded-xl border border-primary-200/20 dark:border-primary-100/10 text-primary-200 dark:text-primary-100/80 text-center text-sm max-w-xs shadow-sm">
              <span className="font-medium text-primary-200 dark:text-primary-100/60">
                {t("address", "Address")}:{" "}
              </span>
              {user.address}
            </div>
          )}
        </div>
      </div>
      {/* Details Section */}
      <section className="container mx-auto w-full max-w-lg px-4 py-4">
        {/* Health Information */}
        <Card className="mb-6 animate-fade-in-up bg-white/90 dark:bg-dark-50/90 border border-primary-100/20 dark:border-dark-600/20 backdrop-blur-sm">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-100/20 mr-3">
              <Heart
                className="text-primary-300 dark:text-primary-100"
                size={24}
                aria-hidden="true"
              />
            </div>
            <h3 className="text-lg font-semibold text-primary-300 dark:text-primary-100">
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
          <Card className="mb-6 animate-fade-in-up bg-white/90 dark:bg-dark-50/90 border border-primary-100/20 dark:border-dark-600/20 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-100/20 mr-3">
                <Settings
                  className="text-primary-300 dark:text-primary-100"
                  size={24}
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-lg font-semibold text-primary-300 dark:text-primary-100">
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
        <Card className="mb-6 animate-fade-in-up bg-white/90 dark:bg-dark-50/90 border border-primary-100/20 dark:border-dark-600/20 backdrop-blur-sm">
          <div className="space-y-4">
            <div>
              <div className="flex items-center mb-2">
                <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-100/20 mr-2">
                  <Globe
                    className="text-primary-300 dark:text-primary-100"
                    size={20}
                    aria-hidden="true"
                  />
                </div>
                <p className="font-medium text-primary-300 dark:text-primary-100">
                  {t("changeLanguage")}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
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
          className="w-full animate-fade-in-up"
          size="lg"
          icon={LogOut}
          ariaLabel={t("logout")}
        >
          {t("logout")}
        </Button>
      </section>
    </main>
  );
}
