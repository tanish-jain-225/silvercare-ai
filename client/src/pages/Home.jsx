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
      title: t("blog"),
      description: "Entertain your day",
      path: "/blog",
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
    <main className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-white to-blue-100 flex flex-col items-center justify-center">
      {/* Welcome Banner */}
      <section className="bg-white shadow-sm border-b border-gray-200 m-4 rounded-md w-full">
        <div className="container mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 break-words">
                {user ? t("welcome", { name: user.name }) : "Welcome"}
              </h1>
              <p className="text-gray-600 text-base md:text-lg break-words">
                {t('howCanIHelp', 'How can I help you today?')}
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Content */}
      <section className="w-full container mx-auto max-w-md md:max-w-lg lg:max-w-xl px-4 py-8">
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature) => (
            <Card
              key={feature.path}
              onClick={() => handleFeatureClick(feature.path, feature.title)}
              className="cursor-pointer p-2 focus-visible:ring-2 focus-visible:ring-blue-400"
              tabIndex={0}
              aria-label={feature.title}
            >
              <div className="text-center flex flex-col justify-center m-2">
                <div
                  className={`inline-flex items-center justify-center w-12 md:w-14 rounded-full mb-3 mx-auto ${feature.color}`}
                >
                  <feature.icon size={28} className="" aria-hidden="true" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-1 break-words">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-tight break-words">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
        {/* Quick Health Check */}
        <div className="my-16">
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2 break-words">
                {t('dailyHealthCheck', 'Daily Health Check')}
              </h3>
              <p className="text-green-100 mb-4 break-words">
                {t('howAreYouFeeling', 'How are you feeling today?')}
              </p>
              <div className="flex justify-center space-x-4">
                <button className="flex flex-col items-center p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Great">
                  <span className="text-2xl mb-1">{t('great', 'Great')}</span>
                  <span className="text-sm">{t('great', 'Great')}</span>
                </button>
                <button className="flex flex-col items-center p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Okay">
                  <span className="text-2xl mb-1">{t('okay', 'Okay')}</span>
                  <span className="text-sm">{t('okay', 'Okay')}</span>
                </button>
                <button className="flex flex-col items-center p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Not Good">
                  <span className="text-2xl mb-1">{t('notGood', 'Not Good')}</span>
                  <span className="text-sm">{t('notGood', 'Not Good')}</span>
                </button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
