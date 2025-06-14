import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  AlertTriangle,
  MessageSquare,
  Bell,
  Heart,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "../components/ui/Card";
import { useApp } from "../context/AppContext";
import { useVoice } from "../hooks/useVoice";

export function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useApp();
  const { speak } = useVoice();

  const features = [
    {
      icon: Calendar,
      title: t("dailyPlanner"),
      description: "Plan your day with voice assistance",
      path: "/daily-planner",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Clock,
      title: t("reminders"),
      description: "Set and manage your reminders",
      path: "/reminders",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: AlertTriangle,
      title: t("emergency"),
      description: "Quick access to emergency help",
      path: "/emergency",
      color: "bg-red-100 text-red-600",
    },
    {
      icon: MessageSquare,
      title: t("askQueries"),
      description: "Ask health and life questions",
      path: "/ask-queries",
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const handleFeatureClick = (path, title) => {
    speak(`Opening ${title}`);
    navigate(path);
  };

  React.useEffect(() => {
    if (user) {
      speak(t("welcome", { name: user.name }));
    }
  }, [user, speak, t]);
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-white to-blue-100 flex flex-col items-center justify-center">
      {/* Welcome Banner */}
      <div className="bg-white shadow-sm border-b border-gray-200 m-4 rounded-md w-full">
        <div className="container mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl px-2 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 break-words">
                {user ? t("welcome", { name: user.name }) : "Welcome"}
              </h1>
              <p className="text-gray-600 text-sm sm:text-lg break-words">
                How can I help you today?
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="w-full container mx-auto max-w-md md:max-w-lg lg:max-w-xl px-2 sm:px-4 py-6 sm:py-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {features.map((feature) => (
            <Card
              key={feature.path}
              onClick={() => handleFeatureClick(feature.path, feature.title)}
              className="cursor-pointer hover:shadow-lg active:scale-95 transition-all duration-200 p-2"
            >
              <div className="text-center flex flex-col justify-center m-2">
                <div
                  className={`inline-flex items-center justify-center w-10 sm:w-12 md:w-14 rounded-full mb-2 sm:mb-3 mx-auto ${feature.color}`}
                >
                  <feature.icon size={22} className="sm:size-24" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-1 break-words">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-tight break-words">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
        {/* Quick Health Check */}
        <div className="mb-14">
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white my-4">
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 break-words">
                Daily Health Check
              </h3>
              <p className="text-green-100 mb-2 sm:mb-4 break-words">
                How are you feeling today?
              </p>
              <div className="flex justify-center space-x-2 sm:space-x-4">
                <button className="flex flex-col items-center p-2 sm:p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all">
                  <span className="text-xl sm:text-2xl mb-1">Great</span>
                  <span className="text-xs sm:text-sm">Great</span>
                </button>
                <button className="flex flex-col items-center p-2 sm:p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all">
                  <span className="text-xl sm:text-2xl mb-1">Okay</span>
                  <span className="text-xs sm:text-sm">Okay</span>
                </button>
                <button className="flex flex-col items-center p-2 sm:p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all">
                  <span className="text-xl sm:text-2xl mb-1">Not Good</span>
                  <span className="text-xs sm:text-sm">Not Good</span>
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
