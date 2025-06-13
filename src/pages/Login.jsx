import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Chrome } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { VoiceButton } from '../components/voice/VoiceButton';
import { useApp } from '../context/AppContext';
import { useVoice } from '../hooks/useVoice';

export function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useApp();
  const { speak } = useVoice();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/home');
      } else {
        setError('Invalid email or password');
        speak('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      speak('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = (field) => (text) => {
    if (field === 'email') {
      setEmail(text);
    } else {
      setPassword(text);
    }
  };

  React.useEffect(() => {
    speak('Welcome to SilverCare AI. Please enter your login details.');
  }, [speak]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">SilverCare AI</h1>
          <p className="text-xl text-gray-600">{t('login')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                type="email"
                label={t('email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                required
                className="pr-16"
              />
              <div className="absolute right-3 top-12">
                <VoiceButton onResult={handleVoiceInput('email')} />
              </div>
            </div>

            <div className="relative">
              <Input
                type="password"
                label={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                required
                className="pr-16"
              />
              <div className="absolute right-3 top-12">
                <VoiceButton onResult={handleVoiceInput('password')} />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-center bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="xl"
            >
              {isLoading ? 'Signing in...' : t('loginButton')}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              icon={Chrome}
              size="lg"
            >
              {t('continueWithGoogle')}
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              {t('noAccount')}{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                {t('signup')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}