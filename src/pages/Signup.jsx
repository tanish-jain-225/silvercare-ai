import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { VoiceButton } from '../components/voice/VoiceButton';
import { useApp } from '../context/AppContext';
import { useVoice } from '../hooks/useVoice';

export function Signup() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signup } = useApp();
  const { speak } = useVoice();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await signup(name, email, password);
      if (success) {
        navigate('/user-details');
      } else {
        setError('Signup failed. Please try again.');
        speak('Signup failed. Please try again.');
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
      speak('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = (field) => (text) => {
    if (field === 'name') {
      setName(text);
    } else if (field === 'email') {
      setEmail(text);
    } else {
      setPassword(text);
    }
  };

  React.useEffect(() => {
    speak('Welcome! Let\'s create your SilverCare AI account.');
  }, [speak]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">SilverCare AI</h1>
          <p className="text-xl text-gray-600">{t('signup')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                type="text"
                label={t('name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={User}
                required
                className="pr-16"
              />
              <div className="absolute right-3 top-12">
                <VoiceButton onResult={handleVoiceInput('name')} />
              </div>
            </div>

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
              variant="secondary"
              className="w-full"
              size="xl"
            >
              {isLoading ? 'Creating Account...' : t('signupButton')}
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              {t('haveAccount')}{' '}
              <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
                {t('login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}