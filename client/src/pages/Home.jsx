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
      title: t("blog"),
      description: "Entertain your day",
      path: "/blog",
      color: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
    },
    {
      icon: Clock,
      title: t("reminders"),
      description: "Set and manage your reminders",
      path: "/reminders",
      color: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
    },
    {
      icon: AlertTriangle,
      title: t("emergency"),
      description: "Quick access to emergency help",
      path: "/emergency",
      color: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
    },
    {
      icon: MessageSquare,
      title: t("askQueries"),
      description: "Ask health and life questions",
      path: "/ask-queries",
      color: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
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
    <main className="min-h-screen w-full overflow-x-hidden theme-gradient-primary flex flex-col items-center justify-center">
      {/* Welcome Banner */}
      <section className="w-[80%] theme-gradient-secondary theme-border border rounded-xl shadow-sm mx-10 my-6 overflow-hidden">
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-9xl">
          <div className="flex flex-col items-start space-y-4 md:space-y-6">
            {/* Animated greeting */}
            <div className="relative">
              <div className="absolute -left-4 top-0 h-full w-1 bg-indigo-500 dark:bg-indigo-400 rounded-full"></div>
              <SplitText
                text={`Welcome back, ${user.name}!`}
                className="text-3xl md:text-5xl font-extrabold theme-text-primary text-left pl-6"
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
              <p className="text-lg md:text-xl theme-text-secondary font-medium leading-relaxed">
                {t('howCanIHelp', 'How can I assist you today?')}
              </p>

              {/* Decorative elements */}
              <div className="flex items-center mt-4 space-x-3">
                <div className="h-2 w-8 bg-indigo-400 dark:bg-indigo-500 rounded-full"></div>
                <div className="h-2 w-16 bg-indigo-300 dark:bg-indigo-600 rounded-full"></div>
                <div className="h-2 w-8 bg-indigo-200 dark:bg-indigo-700 rounded-full"></div>
              </div>
            </motion.div>

            {/* CTA Button (optional) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.3 },
              }}
              whileTap={{ scale: 0.95 }}
              className="pl-6 pt-2"
            >
              <button className="px-6 py-2.5 theme-button-primary font-medium rounded-lg shadow-sm transition-all duration-300 transform" onClick={() => navigate("/ask-queries")}>
                Get Started
              </button>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Content */}
      <div className="w-[90%] px-3 mb-20 sm:px-6 lg:px-8 py-8 mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <motion.div
              key={feature.path}
              onClick={() => handleFeatureClick(feature.path, feature.title)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className="theme-card group cursor-pointer p-8 rounded-xl bg-white dark:bg-gray-900 focus-visible:ring-2 focus-visible:ring-opacity-60 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
              tabIndex={0}
              aria-label={feature.title}
            >
              <div className="text-center flex flex-col justify-center items-center h-full space-y-5">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.color} bg-opacity-10 dark:bg-opacity-20 transition-colors duration-300 group-hover:bg-opacity-20 dark:group-hover:bg-opacity-30`}
                >
                  <feature.icon
                    size={32}
                    className={`${feature.color
                      .split(" ")
                      .slice(-2)
                      .join(" ")} opacity-90 transition-opacity duration-300 group-hover:opacity-100`}
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-xl font-semibold theme-text-primary transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {feature.title}
                </h3>
                <p className="theme-text-tertiary text-[0.95rem] leading-relaxed transition-colors duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>


    </main>
  );
}
