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
import PropTypes from "prop-types";
import { motion } from 'framer-motion';
import SplitText from "../components/homepage/SplitText";

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
      color: "bg-indigo-500 text-blue-600",
    },
    {
      icon: Clock,
      title: t("reminders"),
      description: "Set and manage your reminders",
      path: "/reminders",
      color: "bg-indigo-500 text-green-600",
    },
    {
      icon: AlertTriangle,
      title: t("emergency"),
      description: "Quick access to emergency help",
      path: "/emergency",
      color: "bg-indigo-500 text-red-600",
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
      <section className="w-[80%] bg-gradient-to-r from-blue-50 to-indigo-50 border border-gray-100 rounded-xl shadow-sm mx-10 my-6 overflow-hidden">
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-9xl">
          <div className="flex flex-col items-start space-y-4 md:space-y-6">
            {/* Animated greeting */}
            <div className="relative">
              <div className="absolute -left-4 top-0 h-full w-1 bg-indigo-500 rounded-full"></div>
              <SplitText
                text={`Welcome back, ${user.name}!`}
                className="text-3xl md:text-5xl font-extrabold text-gray-800 text-left pl-6"
                delay={100}
                duration={2}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
              />
            </div>

            {/* Subtitle with subtle animation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="pl-6"
            >
              <p className="text-lg md:text-xl text-gray-600 font-medium leading-relaxed">
                {t('howCanIHelp', 'How can I assist you today?')}
              </p>

              {/* Decorative elements */}
              <div className="flex items-center mt-4 space-x-3">
                <div className="h-2 w-8 bg-indigo-400 rounded-full"></div>
                <div className="h-2 w-16 bg-indigo-300 rounded-full"></div>
                <div className="h-2 w-8 bg-indigo-200 rounded-full"></div>
              </div>
            </motion.div>

            {/* CTA Button (optional) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="pl-6 pt-2"
            >
              <button className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg shadow-sm transition-all duration-300 transform hover:-translate-y-0.5">
                Get Started
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="w-[90%] px-2 mb-20 sm:px-6 lg:px-8 py-8 mx-auto"> {/* Added mx-auto for center alignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ">
          {features.map((feature) => (
            <div
              key={feature.path}
              onClick={() => handleFeatureClick(feature.path, feature.title)}
              className="bg-white group cursor-pointer p-8 border border-gray-100 rounded-xl shadow-xs hover:shadow-md transition-all duration-500 hover:-translate-y-2 focus-visible:ring-2 focus-visible:ring-opacity-60 focus-visible:ring-primary-500"
              tabIndex={0}
              aria-label={feature.title}
            >
              <div className="text-center flex flex-col justify-center items-center h-full space-y-5">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.color} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-500`}
                >
                  <feature.icon
                    size={32}
                    className={`${feature.color.replace('bg-', 'text-')} opacity-90 group-hover:opacity-100 transition-all duration-500`}
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-xl font-medium text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-[0.95rem] group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
