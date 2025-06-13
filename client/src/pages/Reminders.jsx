import React, { useState } from 'react';
import { ArrowLeft, Plus, Clock, Volume2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useVoice } from '../hooks/useVoice';

export function Reminders() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { speak } = useVoice();
  const [reminders, setReminders] = useState([
    {
      id: '1',
      title: 'Take morning medication',
      time: '08:00',
      date: '2024-01-15',
      isActive: true
    },
    {
      id: '2',
      title: 'Doctor appointment',
      time: '14:30',
      date: '2024-01-16',
      isActive: true
    }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    time: '',
    date: ''
  });

  const handleAddReminder = () => {
    if (!newReminder.title || !newReminder.time || !newReminder.date) return;

    const reminder = {
      id: Date.now().toString(),
      title: newReminder.title,
      time: newReminder.time,
      date: newReminder.date,
      isActive: true
    };

    setReminders(prev => [...prev, reminder]);
    setNewReminder({ title: '', time: '', date: '' });
    setShowAddForm(false);
    speak('Reminder added successfully');
  };

  const handleDeleteReminder = (id) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    speak('Reminder deleted');
  };

  const handleReadReminder = (reminder) => {
    speak(`Reminder: ${reminder.title} at ${reminder.time} on ${reminder.date}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  React.useEffect(() => {
    speak('Here are your reminders. You can add new ones or listen to existing reminders.');
  }, [speak]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 w-full">
        <div className="container mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-2 sm:mr-3"
            >
              <ArrowLeft size={22} className="text-gray-600" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">{t('reminders')}</h1>
            <Button
              onClick={() => setShowAddForm(true)}
              variant="primary"
              size="sm"
              icon={Plus}
              className="ml-2"
            >
              <span className="hidden sm:inline">{t('add')}</span>
            </Button>
          </div>
        </div>
      </div>
      {/* Reminders List */}
      <div className="container mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl px-2 sm:px-4 py-4 sm:py-6">
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <Card key={reminder.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-5 w-full">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <Clock className="text-blue-500" size={20} />
                <div className="min-w-0">
                  <div className="font-semibold text-base sm:text-lg text-gray-800 break-words">{reminder.title}</div>
                  <div className="text-xs sm:text-sm text-gray-500">{formatDate(reminder.date)} | {reminder.time}</div>
                </div>
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <Button onClick={() => handleReadReminder(reminder)} variant="outline" size="sm" icon={Volume2} aria-label="Read reminder" />
                <Button onClick={() => handleDeleteReminder(reminder.id)} variant="danger" size="sm" icon={Trash2} aria-label="Delete reminder" />
              </div>
            </Card>
          ))}
        </div>
        {/* Add Reminder Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 w-full max-w-xs sm:max-w-sm mx-2">
              <h2 className="text-lg sm:text-xl font-bold mb-4">{t('addReminder')}</h2>
              <Input
                label={t('title')}
                value={newReminder.title}
                onChange={e => setNewReminder({ ...newReminder, title: e.target.value })}
                required
                className="mb-2"
              />
              <Input
                label={t('date')}
                type="date"
                value={newReminder.date}
                onChange={e => setNewReminder({ ...newReminder, date: e.target.value })}
                required
                className="mb-2"
              />
              <Input
                label={t('time')}
                type="time"
                value={newReminder.time}
                onChange={e => setNewReminder({ ...newReminder, time: e.target.value })}
                required
                className="mb-4"
              />
              <div className="flex justify-end gap-2">
                <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm">{t('cancel')}</Button>
                <Button onClick={handleAddReminder} variant="primary" size="sm">{t('add')}</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}