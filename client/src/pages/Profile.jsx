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
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useApp } from "../context/AppContext";
import { useVoice } from "../hooks/useVoice";

export function Profile() {
  const navigate = useNavigate();
  const { logout, user, loading } = useApp(); // get user and loading from context
  const { speak } = useVoice();

  // Show loading state if user data is not yet available
  if (loading || !user) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </main>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  React.useEffect(() => {
    speak(
      "Welcome to your profile. You can view your information here."
    );
  }, [speak]);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-dark-50 dark:to-dark-100/30 flex flex-col items-center justify-center pb-32">
      <div className="container mx-auto w-full max-w-4xl px-4 py-12 lg:py-20 flex flex-col items-center">
        {/* Profile Card */}
        <div className="w-full max-w-2xl mb-10 p-10 rounded-3xl shadow-2xl bg-gradient-to-br from-blue-400/20 via-sky-300/20 to-yellow-300/20 dark:from-blue-600/20 dark:via-sky-500/20 dark:to-yellow-400/20 backdrop-blur-lg border border-slate-200 dark:border-dark-600/40 relative animate-fade-in transition-shadow hover:shadow-3xl">
          <button
            type="button"
            onClick={() => navigate("/user-details")}
            className="absolute top-6 right-6 bg-slate-100 dark:bg-primary-100/30 border border-slate-200 dark:border-primary-100/30 shadow-lg rounded-full w-12 h-12 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-primary-100/50 transition-colors group"
            aria-label="Edit Profile"
          >
            <Edit
              size={26}
              className="text-slate-600 dark:text-primary-100 group-hover:text-slate-800"
            />
            <span className="absolute left-1/2 -bottom-7 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-xs rounded px-2 py-1 pointer-events-none transition-opacity">
              Edit
            </span>
          </button>
          <div className="flex flex-col items-center gap-4 mt-4">
            <div className="relative">
              <div className="w-30 h-30 rounded-full bg-primary-200 text-white flex items-center justify-center p-5">
                <User size={50} />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-primary-100 mt-2 tracking-tight">
              {user?.name || 'User'}
            </h2>
            <p className="text-slate-600 dark:text-primary-200 text-lg font-medium">
              {user?.email || 'No email provided'}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-3">
              {user?.age && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-dark-50/90 text-slate-700 dark:text-primary-100 rounded-full text-sm font-medium border border-slate-200 dark:border-primary-200/30">
                  <span className="font-semibold">{user.age}</span>{" "}
                  years
                </span>
              )}
              {user?.gender && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent-yellow/40 dark:bg-accent-yellow/20 text-slate-700 dark:text-primary-100 rounded-full text-sm font-medium border border-accent-yellow/50 dark:border-accent-yellow/30">
                  {user.gender}
                </span>
              )}
            </div>
            {user?.address && (
              <div className="mt-2 px-4 py-2 bg-slate-100 dark:bg-dark-50/90 rounded-xl border border-slate-200 dark:border-primary-200/30 text-slate-700 dark:text-primary-100 text-center text-sm max-w-xs shadow-sm">
                <span className="font-medium text-slate-800 dark:text-primary-200">
                  Address: {user.address}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Health Information */}
        <Card className="w-full max-w-2xl mb-8 animate-fade-in-up bg-white dark:bg-dark-50/95 border border-slate-200 dark:border-dark-600/30 backdrop-blur-md shadow-xl rounded-2xl transition-shadow hover:shadow-2xl">
          <div className="flex items-center mb-5">
            <div className="p-2 rounded-full bg-slate-100 dark:bg-primary-100/20 mr-4">
              <Heart
                className="text-slate-600 dark:text-primary-100"
                size={28}
                aria-hidden="true"
              />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-primary-100 tracking-tight">
              Health Information
            </h3>
          </div>
          {user?.healthCondition ? (
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-slate-100 dark:bg-primary-100/20 text-slate-700 dark:text-primary-100 rounded-full text-sm border border-slate-200 dark:border-primary-100/20">
                {user.healthCondition}
              </span>
            </div>
          ) : (
            <p className="text-slate-600 dark:text-primary-100/70">
              No health conditions recorded
            </p>
          )}
          {user?.currentMedicalStatus && (
            <div className="mt-3">
              <p className="text-sm text-slate-600 dark:text-primary-100/70">
                Current Medical Status
              </p>
              <p className="text-lg font-medium text-slate-800 dark:text-primary-100">
                {user.currentMedicalStatus}
              </p>
            </div>
          )}
        </Card>

        {/* Emergency Contacts */}
        {user?.emergencyContacts && user.emergencyContacts.length > 0 && (
          <Card className="w-full max-w-2xl mb-8 animate-fade-in-up bg-white dark:bg-dark-50/95 border border-slate-200 dark:border-dark-600/30 backdrop-blur-md shadow-xl rounded-2xl transition-shadow hover:shadow-2xl">
            <div className="flex items-center mb-5">
              <div className="p-2 rounded-full bg-slate-100 dark:bg-primary-100/20 mr-4">
                <Settings
                  className="text-slate-600 dark:text-primary-100"
                  size={28}
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-primary-100 tracking-tight">
                Emergency Contacts
              </h3>
            </div>
            <ul className="space-y-2">
              {user.emergencyContacts.map((contact, idx) => (
                <li
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 bg-slate-50 dark:bg-primary-100/10 rounded-lg px-4 py-2 border border-slate-200 dark:border-primary-100/10"
                >
                  <span className="font-medium text-slate-800 dark:text-primary-100">
                    {contact.name}
                  </span>
                  <span className="text-slate-600 dark:text-primary-100/80">
                    {contact.number}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="danger"
          className="w-full max-w-2xl animate-fade-in-up mt-2 shadow-lg text-lg font-semibold py-4"
          size="lg"
          icon={LogOut}
          ariaLabel={"logout"}
        >
          logout
        </Button>
      </div>
    </main>
  );
}
