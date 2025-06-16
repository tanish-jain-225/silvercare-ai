import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { VoiceButton } from "../components/voice/VoiceButton";
import { useApp } from "../context/AppContext";
import { useVoice } from "../hooks/useVoice";

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
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-blue-500 via-silver to-yellow-500 flex items-center justify-center p-2 sm:p-4">
      <div className="container mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl px-2 sm:px-4">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2 break-words">
            SilverCare AI
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-white/80 break-words">
            {t("signup")}
          </p>
        </div>

        <div className="bg-white/20 dark:bg-black/30 backdrop-blur-lg rounded-2xl shadow-2xl p-3 sm:p-4 md:p-8 w-full">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-5 md:space-y-7"
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
                className="pr-14 sm:pr-16 md:pr-20 min-w-0"
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
                className="pr-14 sm:pr-16 md:pr-20 min-w-0"
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
              <div className="text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg w-full break-words">
                {error}
              </div>
            )}

            {/* Signup Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2"
              size="xl"
            >
              {isLoading ? "Creating Account..." : t("signupButton")}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6 sm:mt-8">
            <p className="text-white/80 text-sm sm:text-base break-words">
              {t("haveAccount")}{" "}
              <Link
                to="/login"
                className="text-blue-300 hover:text-blue-400 font-semibold"
              >
                {t("login")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
