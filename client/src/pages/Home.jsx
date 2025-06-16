import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  AlertTriangle,
  MessageSquare,
  Bell,
  Heart,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "../components/ui/Card";
import { useApp } from "../context/AppContext";
import { useVoice } from "../hooks/useVoice";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
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
      color: "feature-card-blue",
      gradient:
        "from-purple-100/60 to-purple-200/60 dark:from-primary-100/10 dark:to-primary-200/10",
      hoverGradient:
        "group-hover:from-purple-200/80 group-hover:to-purple-300/80 dark:group-hover:from-primary-100/20 dark:group-hover:to-primary-200/20",
      iconBg: "bg-purple-100/60 dark:bg-primary-100/10",
      iconColor: "text-primary-300 dark:text-primary-100",
      textHover: "dark:group-hover:text-primary-200",
      descHover: "dark:group-hover:text-primary-100",
      borderColor:
        "group-hover:border-purple-200/40 dark:group-hover:border-primary-100/20",
    },
    {
      icon: Clock,
      title: t("reminders"),
      description: "Set and manage your reminders",
      path: "/reminders",
      color: "feature-card-green",
      gradient:
        "from-blue-100/60 to-blue-200/60 dark:from-primary-200/20 dark:to-primary-300/20",
      hoverGradient:
        "group-hover:from-blue-200/80 group-hover:to-blue-300/80 dark:group-hover:from-primary-200/30 dark:group-hover:to-primary-300/30",
      iconBg: "bg-blue-100/60 dark:bg-primary-200/20",
      iconColor: "text-primary-300 dark:text-primary-200",
      textHover: " dark:group-hover:text-primary-200",
      descHover: "dark:group-hover:text-primary-100",
      borderColor:
        "group-hover:border-blue-200/40 dark:group-hover:border-primary-200/30",
    },
    {
      icon: AlertTriangle,
      title: t("emergency"),
      description: "Quick access to emergency help",
      path: "/emergency",
      color: "feature-card-orange",
      gradient:
        "from-accent-orange/30 to-accent-orange/40 dark:from-accent-orange/10 dark:to-accent-orange/20",
      hoverGradient:
        "group-hover:from-accent-orange/50 group-hover:to-accent-orange/60 dark:group-hover:from-accent-orange/20 dark:group-hover:to-accent-orange/30",
      iconBg: "bg-accent-orange/30 dark:bg-accent-orange/10",
      iconColor: "text-accent-orange dark:text-accent-orange",
      textHover: "dark:group-hover:text-accent-orange",
      descHover: "dark:group-hover:text-accent-orange/80",
      borderColor:
        "group-hover:border-accent-orange/40 dark:group-hover:border-accent-orange/20",
    },
    {
      icon: MessageSquare,
      title: t("askQueries"),
      description: "Ask health and life questions",
      path: "/ask-queries",
      color: "feature-card-yellow",
      gradient:
        "from-accent-yellow/30 to-accent-yellow/40 dark:from-accent-yellow/10 dark:to-accent-yellow/20",
      hoverGradient:
        "group-hover:from-accent-yellow/50 group-hover:to-accent-yellow/60 dark:group-hover:from-accent-yellow/20 dark:group-hover:to-accent-yellow/30",
      iconBg: "bg-accent-yellow/30 dark:bg-accent-yellow/10",
      iconColor: "text-accent-yellow dark:text-accent-yellow",
      textHover: "dark:group-hover:text-accent-yellow",
      descHover: "dark:group-hover:text-accent-yellow/80",
      borderColor:
        "group-hover:border-accent-yellow/40 dark:group-hover:border-accent-yellow/20",
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
      <section className="w-[90%] theme-gradient-secondary theme-border border rounded-2xl shadow-lg mx-10 my-6 overflow-hidden relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-100/30 dark:bg-primary-100/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary-200/30 dark:bg-primary-200/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 py-12 md:py-16 max-w-9xl relative">
          <div className="flex flex-col items-start space-y-6 md:space-y-8">
            {/* Animated greeting */}
            <div className="relative pl-6">
              <div className="absolute -left-4 top-0 h-full w-1.5 bg-gradient-to-b from-primary-200 to-primary-300 dark:from-primary-100 dark:to-primary-200 rounded-full"></div>
              <SplitText
                text={`Welcome back,`}
                className="text-3xl md:text-6xl font-extrabold theme-text-primary text-left"
                delay={100}
                duration={2}
                ease="power3.out"
                splitType="words"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
              />
              <SplitText
                text={<span className="whitespace-nowrap">{user.name}!</span>}
                className="text-3xl md:text-6xl font-extrabold theme-text-primary text-left"
                delay={400}
                duration={2}
                ease="power3.out"
                splitType="words"
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
              <p className="text-xl md:text-2xl theme-text-secondary font-medium leading-relaxed">
                {t("howCanIHelp", "How can I assist you today?")}
              </p>

              {/* Decorative elements */}
              <div className="flex items-center mt-6 space-x-4">
                <div className="h-2.5 w-12 bg-primary-200 dark:bg-primary-100 rounded-full"></div>
                <div className="h-2.5 w-24 bg-primary-100 dark:bg-primary-200 rounded-full"></div>
                <div className="h-2.5 w-12 bg-primary-50 dark:bg-primary-300 rounded-full"></div>
              </div>
            </motion.div>

            {/* CTA Button */}
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
              <button
                className="px-8 py-3 theme-button-primary font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform flex items-center space-x-2 group"
                onClick={() => navigate("/ask-queries")}
              >
                <span>Get Started</span>
                <ChevronRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="w-[90%] px-3 mb-20 sm:px-6 lg:px-8 py-8 mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <motion.div
              key={feature.path}
              onClick={() => handleFeatureClick(feature.path, feature.title)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className={`theme-card group cursor-pointer p-8 rounded-2xl bg-gradient-to-br ${feature.gradient} ${feature.hoverGradient} backdrop-blur-sm border border-primary-100/20 dark:border-primary-100/10 focus-visible:ring-2 focus-visible:ring-opacity-60 focus-visible:ring-primary-200 dark:focus-visible:ring-primary-100 relative overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${feature.borderColor}`}
              tabIndex={0}
              aria-label={feature.title}
            >
              {/* Decorative background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 dark:bg-white/10 rounded-full blur-3xl transform group-hover:scale-150 transition-transform duration-500"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-white/5 dark:bg-white/10 rounded-full blur-3xl transform group-hover:scale-150 transition-transform duration-500"></div>
              </div>

              <div className="text-center flex flex-col justify-center items-center h-full space-y-6 relative z-10">
                {/* Icon Container */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl ${feature.iconBg} transition-all duration-300 group-hover:shadow-lg shadow-md group-hover:scale-110`}
                >
                  <feature.icon
                    size={36}
                    className={`${feature.iconColor} opacity-90 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110`}
                    aria-hidden="true"
                  />
                </motion.div>

                {/* Title and Description */}
                <div className="space-y-3">
                  <h3
                    className={`text-2xl font-bold theme-text-primary transition-colors duration-300 ${feature.textHover}`}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={`theme-text-tertiary text-base leading-relaxed transition-colors duration-300 ${feature.descHover}`}
                  >
                    {feature.description}
                  </p>
                </div>

                {/* Interactive Arrow */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4"
                >
                  <div
                    className={`inline-flex items-center space-x-2 ${feature.textHover} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  >
                    <span className="text-sm font-medium">Explore</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              </div>

              {/* Hover Border Effect */}
              <div
                className={`absolute inset-0 rounded-2xl border-2 border-transparent ${
                  feature.borderColor ||
                  "group-hover:border-primary-200/20 dark:group-hover:border-primary-100/20"
                } transition-colors duration-300 pointer-events-none`}
              ></div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
