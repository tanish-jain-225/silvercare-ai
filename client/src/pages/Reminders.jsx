import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Clock,
  Volume2,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { useVoice } from "../hooks/useVoice";
import axios from "axios";
import { route_endpoint } from "../utils/helper";
import { useApp } from "../context/AppContext";

export function Reminders() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { speak } = useVoice();
  const { user } = useApp();
  const [reminders, setReminders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: "",
    time: "",
    date: "",
  });
  const [alarmAudio, setAlarmAudio] = useState(null);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Filter out duplicate reminders by created_at
  const uniqueReminders = React.useMemo(
    () => Array.from(new Map(reminders.map((r) => [r.created_at, r])).values()),
    [reminders]
  );
  // Function to fetch reminders from the server
  const fetchReminders = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      console.log("Fetching reminders...");
      const response = await fetch(
        `${route_endpoint}/reminders?userId=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "omit", // Don't send credentials to avoid CORS preflight
        }
      );

      if (!response.ok) {
        console.error(`Server responded with status: ${response.status}`);
        throw new Error(`Failed to fetch reminders: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Reminders data received:", data);

      if (data.success && data.reminders) {
        setReminders(data.reminders);
      } else {
        setReminders([]);
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
      speak("Sorry, there was an issue fetching your reminders");
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
      isActive: true,
    };
    setShowAddForm(false);
    setNewReminder({ title: "", time: "", date: "" });
    speak("Reminder added successfully");
    try {
      const response = await fetch(`${route_endpoint}/reminder-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          id: reminder.id,
          title: reminder.title,
          date: reminder.date,
          time: reminder.time,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to save reminder to server");
      }
      // Refresh reminders from backend
      fetchReminders();
    } catch (error) {
      console.error("Error saving reminder:", error);
    }
  };

  const handleDeleteReminder = async (createdAt) => {
    try {
      // Send DELETE request to backend
      const response = await fetch(
        `${route_endpoint}/reminders/${encodeURIComponent(createdAt)}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete reminder from server");
      }
      speak("Reminder deleted");
      // Refresh reminders from backend
      fetchReminders();
    } catch (error) {
      console.error("Error deleting reminder:", error);
      speak("Failed to delete reminder");
    }
  };

  const handleReadReminder = (reminder) => {
    speak(
      `Reminder: ${reminder.title} at ${reminder.time} on ${reminder.date}`
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Local notification scheduling
  React.useEffect(() => {
    // Request notification permission on mount
    if (window.Notification && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Alarm scheduling with cleanup and limit
  React.useEffect(() => {
    let timers = [];
    let alarmActive = false;
    // Only schedule alarms for future reminders, and limit to 1 audio at a time
    const now = new Date();
    const futureReminders = uniqueReminders.filter((reminder) => {
      if (!reminder.date || !reminder.time) return false;
      const reminderTime = new Date(`${reminder.date}T${reminder.time}`);
      return reminderTime > now;
    });
    futureReminders.forEach((reminder) => {
      const reminderTime = new Date(`${reminder.date}T${reminder.time}`);
      const delay = reminderTime - now;
      if (delay > 0) {
        const timer = setTimeout(() => {
          if (alarmActive) return; // Prevent overlapping alarms
          alarmActive = true;
          // Only create one Audio object at a time
          if (alarmAudio) return;
          const audio = new Audio("/alarm.mp3");
          setAlarmAudio(audio);
          setIsAlarmPlaying(true);
          audio.play().catch(() => {});
          // Show notification if allowed
          if (window.Notification && Notification.permission === "granted") {
            new Notification("Alarm", {
              body: `${reminder.title} at ${reminder.time} on ${reminder.date}`,
              icon: "/voice-search.png",
            });
          }
          audio.onended = () => {
            setIsAlarmPlaying(false);
            setAlarmAudio((current) => (current === audio ? null : current));
            alarmActive = false;
          };
        }, delay);
        timers.push(timer);
      }
    });
    // Cleanup timers and audio on unmount or reminders change
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      if (alarmAudio) {
        alarmAudio.pause();
        alarmAudio.currentTime = 0;
        setAlarmAudio(null);
      }
    };
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
    speak(
      "Here are your reminders. You can add new ones or listen to existing reminders."
    );
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
        <div className="fixed top-0 left-0 w-full flex justify-center z-50 px-4">
          <button
            onClick={handleStopAlarm}
            className="bg-red-600 text-white font-semibold px-4 py-2 sm:px-6 sm:py-3 rounded-b-xl sm:rounded-b-2xl shadow-lg animate-bounce mt-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white text-sm sm:text-lg touch-manipulation"
            aria-label="Stop Alarm"
          >
            Stop Alarm
          </button>
        </div>
      )}
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 w-full shrink-0">
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => navigate("/")}
              className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 touch-manipulation"
              aria-label={t("back", "Back")}
            >
              <ArrowLeft size={20} className="text-gray-600 sm:w-6 sm:h-6" />
            </button>

            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate flex-1 text-center px-2">
              {t("reminders")}
            </h1>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button
                onClick={fetchReminders}
                variant="outline"
                size="sm"
                icon={RefreshCw}
                disabled={isLoading}
                ariaLabel={t("refreshReminders", "Refresh reminders")}
                className="p-1.5 sm:p-2"
              />
              <Button
                onClick={() => setShowAddForm(true)}
                variant="primary"
                size="sm"
                icon={Plus}
                ariaLabel={t("add")}
                className="p-1.5 sm:p-2"
              >
                <span className="hidden sm:inline ml-1">{t("add")}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>{" "}
      {/* Reminders List */}
      <section className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
            <p className="ml-3 sm:ml-4 text-sm sm:text-base text-gray-600">
              {t("loadingReminders", "Loading reminders...")}
            </p>
          </div>
        ) : uniqueReminders.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-500 mb-4 text-sm sm:text-base">
              {t("noReminders", "No reminders found")}
            </div>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {uniqueReminders.map((reminder) => (
              <Card
                key={reminder.created_at}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 w-full gap-3 sm:gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <div className="bg-blue-50 rounded-full p-2 flex-shrink-0 mt-0.5 sm:mt-0">
                    <Clock
                      className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-800 break-words leading-tight">
                      {reminder.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      <span className="inline-block">
                        {formatDate(reminder.date)}
                      </span>
                      <span className="mx-1 text-gray-400">•</span>
                      <span className="inline-block">{reminder.time}</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    onClick={() => handleReadReminder(reminder)}
                    variant="outline"
                    size="sm"
                    icon={Volume2}
                    ariaLabel={t("readReminder", "Read reminder")}
                    className="flex-1 sm:flex-none"
                  />
                  <Button
                    onClick={() => handleDeleteReminder(reminder.created_at)}
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    ariaLabel={t("deleteReminder", "Delete reminder")}
                    className="flex-1 sm:flex-none"
                  />
                </div>
              </Card>
            ))}
          </div>
        )}{" "}
        {/* Add Reminder Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto transform animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-800">
                  {t("addReminder")}
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  <Input
                    label={t("title")}
                    value={newReminder.title}
                    onChange={(e) =>
                      setNewReminder({ ...newReminder, title: e.target.value })
                    }
                    required
                    placeholder={t("reminderTitle", "Enter reminder title")}
                    className="w-full"
                  />

                  <Input
                    label={t("date")}
                    type="date"
                    value={newReminder.date}
                    onChange={(e) =>
                      setNewReminder({ ...newReminder, date: e.target.value })
                    }
                    required
                    className="w-full"
                  />

                  <Input
                    label={t("time")}
                    type="time"
                    value={newReminder.time}
                    onChange={(e) =>
                      setNewReminder({ ...newReminder, time: e.target.value })
                    }
                    required
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 sm:mt-8">
                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="outline"
                    size="md"
                    ariaLabel={t("cancel")}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    onClick={handleAddReminder}
                    variant="primary"
                    size="md"
                    ariaLabel={t("add")}
                    className="w-full sm:w-auto order-1 sm:order-2"
                    disabled={
                      !newReminder.title ||
                      !newReminder.time ||
                      !newReminder.date
                    }
                  >
                    {t("add")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
