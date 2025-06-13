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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/home')}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-800">{t('myReminders')}</h1>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              icon={Plus}
              variant="secondary"
              size="sm"
            >
              {t('add')}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Add Reminder Form */}
        {showAddForm && (
          <Card className="mb-6">
            <h3 className="text-lg font-semibold mb-4">{t('addReminder')}</h3>
            <div className="space-y-4">
              <Input
                label={t('reminderTitle')}
                value={newReminder.title}
                onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Take medication"
              />
              <Input
                type="time"
                label={t('reminderTime')}
                value={newReminder.time}
                onChange={(e) => setNewReminder(prev => ({ ...prev, time: e.target.value }))}
              />
              <Input
                type="date"
                label={t('reminderDate')}
                value={newReminder.date}
                onChange={(e) => setNewReminder(prev => ({ ...prev, date: e.target.value }))}
              />
              <div className="flex space-x-3">
                <Button onClick={handleAddReminder} variant="secondary" className="flex-1">
                  {t('save')}
                </Button>
                <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                  {t('cancel')}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Reminders List */}
        <div className="space-y-4">
          {reminders.length === 0 ? (
            <Card className="text-center py-8">
              <Clock size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No reminders yet</p>
              <p className="text-gray-500">Tap the + button to add your first reminder</p>
            </Card>
          ) : (
            reminders.map((reminder) => (
              <Card key={reminder.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {reminder.title}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Clock size={16} className="mr-2" />
                      <span>{reminder.time} • {formatDate(reminder.date)}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReadReminder(reminder)}
                      className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    >
                      <Volume2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}