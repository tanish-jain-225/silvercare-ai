import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { VoiceButton } from "../components/voice/VoiceButton";
import { useApp } from "../context/AppContext";
import { useVoice } from "../hooks/useVoice";
import googleIcon from "../assets/google-icon.png";

export function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login, loginWithGoogle, isAuthenticated, loading } = useApp();
  const { speak } = useVoice();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Welcome message effect - must be at top level
  useEffect(() => {
    if (!loading) {
      speak("Welcome to SilverCare AI. Please enter your login details.");
    }
  }, [speak, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/home", { replace: true });
      } else {
        setError("Invalid email or password");
        speak("Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      speak("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const success = await loginWithGoogle();
      if (success) {
        navigate("/home", { replace: true });
      }
    } catch (err) {
      setError("Google login failed. Please try again.");
      speak("Google login failed. Please try again.");
    }
  };

  const handleVoiceInput = (field) => (text) => {
    if (field === "email") {
      setEmail(text);
    } else {
      setPassword(text);
    }
  };
  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-2 sm:p-4">
      <div className="container mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl px-2 sm:px-4">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2 break-words">
            SilverCare AI
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 break-words">
            {t("login")}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 md:p-8 w-full">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-5 md:space-y-7"
          >
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
                  />
                }
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-center bg-red-50 p-3 rounded-lg w-full break-words">
                {error}
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2"
              size="xl"
            >
              {isLoading ? "Signing in..." : t("loginButton")}
            </Button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm md:text-base">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Google Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              icon={googleIcon}
              size="lg"
              onClick={handleGoogleLogin}
            >
              {t("continueWithGoogle")}
            </Button>
          </form>

          {/* Signup Link */}
          <div className="text-center mt-6 sm:mt-8">
            <p className="text-gray-600 text-sm sm:text-base break-words">
              {t("noAccount")}{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                {t("signup")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
