import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Clock, Volume2, Trash2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useVoice } from '../hooks/useVoice';
import axios from 'axios';

export function Reminders() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { speak } = useVoice();
  const [reminders, setReminders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    time: '',
    date: ''
  });  const [alarmAudio, setAlarmAudio] = useState(null);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Function to fetch reminders from the server
  const fetchReminders = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching reminders...');
      const response = await fetch('http://localhost:8000/reminders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'omit' // Don't send credentials to avoid CORS preflight
      });
      
      if (!response.ok) {
        console.error(`Server responded with status: ${response.status}`);
        throw new Error(`Failed to fetch reminders: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Reminders data received:', data);
      
      if (data.success && data.reminders) {
        setReminders(data.reminders);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
      speak('Sorry, there was an issue fetching your reminders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReminder = async () => {
    if (!newReminder.title || !newReminder.time || !newReminder.date) return;
    const reminder = {
      id: Date.now().toString(),
      title: newReminder.title,
      time: newReminder.time,
      date: newReminder.date,
      isActive: true
    };
    setShowAddForm(false);
    setNewReminder({ title: '', time: '', date: '' });
    speak('Reminder added successfully');
    try {
      const response = await fetch('http://localhost:8000/reminder-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          id: reminder.id,
          title: reminder.title,
          date: reminder.date,
          time: reminder.time
        })
      });
      if (!response.ok) {
        throw new Error('Failed to save reminder to server');
      }
      // Refresh reminders from backend
      fetchReminders();
    } catch (error) {
      console.error('Error saving reminder:', error);
    }
  };

  const handleDeleteReminder = async (createdAt) => {
    try {
      // Send DELETE request to backend
      const response = await fetch(`http://localhost:8000/reminders/${encodeURIComponent(createdAt)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Failed to delete reminder from server');
      }
      speak('Reminder deleted');
      // Refresh reminders from backend
      fetchReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      speak('Failed to delete reminder');
    }
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

  // Local notification scheduling
  React.useEffect(() => {
    // Request notification permission on mount
    if (window.Notification && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Filter out duplicate reminders by created_at
  const uniqueReminders = Array.from(
    new Map(reminders.map(r => [r.created_at, r])).values()
  );

  React.useEffect(() => {
    // Clear previous timers
    let timers = [];
    let alarmActive = false;
    uniqueReminders.forEach(reminder => {
      const reminderTime = new Date(`${reminder.date}T${reminder.time}`);
      const now = new Date();
      const delay = reminderTime - now;
      if (delay > 0) {
        const timer = setTimeout(() => {
          if (alarmActive) return; // Prevent overlapping alarms
          alarmActive = true;
          // Play alarm sound
          const audio = new Audio('/alarm.mp3');
          setAlarmAudio(audio);
          setIsAlarmPlaying(true);
          audio.play();
          // Show notification if allowed
          if (window.Notification && Notification.permission === 'granted') {
            new Notification('Alarm', {
              body: `${reminder.title} at ${reminder.time} on ${reminder.date}`,
              icon: '/voice-search.png'
            });
          } else if (window.Notification && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new Notification('Alarm', {
                  body: `${reminder.title} at ${reminder.time} on ${reminder.date}`,
                  icon: '/voice-search.png'
                });
              }
            });
          }
          // When alarm ends naturally, reset state (ensure only if this audio is still current)
          audio.onended = () => {
            setIsAlarmPlaying(false);
            setAlarmAudio(current => (current === audio ? null : current));
            alarmActive = false;
          };
        }, delay);
        timers.push(timer);
      }
    });
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [uniqueReminders]);

  const handleStopAlarm = () => {
    if (alarmAudio) {
      alarmAudio.pause();
      alarmAudio.currentTime = 0;
    }
    setIsAlarmPlaying(false);
    setAlarmAudio(null);
  };

  React.useEffect(() => {
    speak('Here are your reminders. You can add new ones or listen to existing reminders.');
  }, [speak]);

  // Fetch reminders when the component mounts
  useEffect(() => {
    fetchReminders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col">
      {/* Show Stop Alarm button if alarm is playing */}
      {isAlarmPlaying && alarmAudio && (
        <div className="fixed top-0 left-0 w-full flex justify-center z-50">
          <button
            onClick={handleStopAlarm}
            className="bg-red-600 text-white font-bold px-6 py-3 rounded-b-2xl shadow-lg animate-bounce mt-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            style={{ fontSize: '1.2rem' }}
            aria-label="Stop Alarm"
          >
            Stop Alarm
          </button>
        </div>
      )}
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 w-full">
        <div className="container mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              aria-label={t('back', 'Back')}
            >
              <ArrowLeft size={22} className="text-gray-600" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">{t('reminders')}</h1>
            <div className="flex items-center">
              <Button
                onClick={fetchReminders}
                variant="outline"
                size="sm"
                icon={RefreshCw}
                className="m-2"
                disabled={isLoading}
                ariaLabel={t('refreshReminders', 'Refresh reminders')}
              />
              <Button
                onClick={() => setShowAddForm(true)}
                variant="primary"
                size="sm"
                icon={Plus}
                className="ml-2"
                ariaLabel={t('add')}
              >
                <span className="hidden sm:inline">{t('add')}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      {/* Reminders List */}
      <section className="container mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-gray-600">{t('loadingReminders', 'Loading reminders...')}</p>
          </div>
        ) : uniqueReminders.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">{t('noReminders', 'No reminders found')}</div>
          </div>
        ) : (
          <div className="space-y-3">
            {uniqueReminders.map((reminder) => (
              <Card key={reminder.created_at} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-5 w-full">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <Clock className="text-blue-500" size={20} aria-hidden="true" />
                  <div className="min-w-0">
                    <div className="font-semibold text-base sm:text-lg text-gray-800 break-words">{reminder.title}</div>
                    <div className="text-xs sm:text-sm text-gray-500">{formatDate(reminder.date)} | {reminder.time}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <Button onClick={() => handleReadReminder(reminder)} variant="outline" size="sm" icon={Volume2} ariaLabel={t('readReminder', 'Read reminder')} />
                  <Button onClick={() => handleDeleteReminder(reminder.created_at)} variant="danger" size="sm" icon={Trash2} ariaLabel={t('deleteReminder', 'Delete reminder')} />
                </div>
              </Card>
            ))}
          </div>
        )}
        {/* Add Reminder Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 w-full max-w-xs sm:max-w-sm mx-2">
              <h2 className="text-xl font-bold mb-4">{t('addReminder')}</h2>
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
                <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm" ariaLabel={t('cancel')}>{t('cancel')}</Button>
                <Button onClick={handleAddReminder} variant="primary" size="sm" ariaLabel={t('add')}>{t('add')}</Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
