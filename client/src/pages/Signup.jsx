import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { VoiceButton } from "../components/voice/VoiceButton";
import { useApp } from "../context/AppContext";
import { useVoice } from "../hooks/useVoice";
import { motion } from "framer-motion";

export function Signup() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signup } = useApp();
  const { speak } = useVoice();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await signup(name, email, password);
      if (success) {
        navigate("/user-details");
      } else {
        setError("Signup failed. Please try again.");
        speak("Signup failed. Please try again.");
      }
    } catch (err) {
      setError("Signup failed. Please try again.");
      speak("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = (field) => (text) => {
    if (field === "name") {
      setName(text);
    } else if (field === "email") {
      setEmail(text);
    } else {
      setPassword(text);
    }
  };

  React.useEffect(() => {
    speak("Welcome! Let's create your SilverCare AI account.");
  }, [speak]);

  React.useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  }, []);

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-blue-200 via-gray-200 to-yellow-100
 flex items-center justify-center p-2 sm:p-4 font-sans"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl px-2 sm:px-4"
      >
        <div className="text-center mb-4">
          <div className="flex items-center gap-2 md:flex-row justify-center flex-col">
            <div className="logo">
              <img
                src="/voice-search.png"
                alt="SilverCare AI Logo"
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto"
              />
            </div>
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-extrabold text-gray-700 bg-clip-text md:mb-2 leading-tight"
            >
              SilverCare AI
            </motion.h1>
          </div>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="text-lg sm:text-xl md:text-2xl font-bold text-gray-600 tracking-wide leading-relaxed"
          >
            {t("Sign Up")}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 w-full"
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-5 sm:space-y-6 md:space-y-8"
            autoComplete="off"
          >
            {/* Name Field */}
            <div className="relative flex items-center min-w-0">
              <Input
                type="text"
                label={t("name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={User}
                required
                className="pr-14 sm:pr-16 md:pr-20 min-w-0 text-base sm:text-lg md:text-xl"
              />
              <div className="absolute inset-y-0 right-4 top-4 flex items-center pointer-events-auto">
                <VoiceButton
                  onResult={handleVoiceInput("name")}
                  size="sm"
                  className="!w-9 sm:!w-10"
                  type="button"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="relative flex items-center min-w-0">
              <Input
                type="email"
                label={t("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                required
                className="pr-14 sm:pr-16 md:pr-20 min-w-0 text-base sm:text-lg md:text-xl"
              />
              <div className="absolute inset-y-0 right-4 top-4 flex items-center pointer-events-auto">
                <VoiceButton
                  onResult={handleVoiceInput("email")}
                  size="sm"
                  className="!w-9 sm:!w-10"
                  type="button"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative flex items-center min-w-0">
              <Input
                type="password"
                label={t("password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                required
                className="text-base sm:text-lg md:text-xl"
                voiceButton={
                  <VoiceButton
                    onResult={handleVoiceInput("password")}
                    size="sm"
                    className="!w-9 sm:!w-10"
                    type="button"
                  />
                }
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-red-600 text-center bg-red-50 p-3 rounded-lg w-full text-sm sm:text-base md:text-lg leading-relaxed"
              >
                {error}
              </motion.div>
            )}

            {/* Signup Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 text-lg sm:text-xl md:text-2xl font-semibold"
              size="xl"
            >
              {isLoading ? "Creating Account..." : t("signupButton")}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-4">
            <p className="text-gray-700 font-semibold text-sm sm:text-base md:text-lg leading-relaxed">
              {t("haveAccount")}{" "}
              <Link
                to="/login"
                className="text-blue-500 hover:text-blue-800 font-semibold"
              >
                {t("login")}
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
