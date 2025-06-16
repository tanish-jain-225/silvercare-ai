import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Clock,
  Volume2,
  Trash2,
  RefreshCw,
  Mic,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { useVoice } from "../hooks/useVoice";
import { VoiceButton } from "../components/voice/VoiceButton";
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
  const [isVoiceLoading, setIsVoiceLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle"); // 'idle', 'syncing', 'success', 'error'

  // Filter out duplicate reminders by created_at
  const uniqueReminders = React.useMemo(
    () => Array.from(new Map(reminders.map((r) => [r.created_at, r])).values()),
    [reminders]
  );

  // Enhanced fetch with better error handling and sync status
  const fetchReminders = async (showLoadingState = true) => {
    if (!user?.id) {
      console.log("No user ID available for fetching reminders");
      return;
    }

    try {
      if (showLoadingState) setIsLoading(true);
      setSyncStatus("syncing");

      console.log(`Fetching reminders for user: ${user.id}`);
      const response = await fetch(
        `${route_endpoint}/reminders?userId=${user.id}&timestamp=${Date.now()}`, // Cache busting
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "omit",
        }
      );

      if (!response.ok) {
        console.error(`Server responded with status: ${response.status}`);
        throw new Error(`Failed to fetch reminders: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Reminders data received:", data);

      if (data.success && Array.isArray(data.reminders)) {
        setReminders(data.reminders);
        setSyncStatus("success");
        console.log(`Successfully loaded ${data.reminders.length} reminders`);
      } else {
        setReminders([]);
        setSyncStatus("success");
        console.log("No reminders found or invalid response format");
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
      setSyncStatus("error");
      speak("Sorry, there was an issue syncing your reminders"); // Don't clear existing reminders on fetch error to maintain offline capability
    } finally {
      if (showLoadingState) setIsLoading(false);
      // Auto-reset sync status after a delay
      setTimeout(() => setSyncStatus("idle"), 2000);
    }
  };
  const handleAddReminder = async () => {
    if (!newReminder.title || !newReminder.time || !newReminder.date) return;
    if (!user?.id) {
      speak("Please log in to add reminders");
      return;
    }

    const reminder = {
      id: Date.now().toString(),
      title: newReminder.title,
      time: newReminder.time,
      date: newReminder.date,
      isActive: true,
      userId: user.id,
    };

    // Optimistic update - add reminder to UI immediately
    const optimisticReminder = {
      ...reminder,
      created_at: new Date().toISOString(),
    };
    setReminders((prev) => [...prev, optimisticReminder]);

    setShowAddForm(false);
    setNewReminder({ title: "", time: "", date: "" });
    speak("Reminder added successfully");

    try {
      setSyncStatus("syncing");
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
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save reminder to server");
      }

      // Sync with backend to get the actual saved reminder
      await fetchReminders(false); // Don't show loading state
      setSyncStatus("success");
    } catch (error) {
      console.error("Error saving reminder:", error);
      // Revert optimistic update on error
      setReminders((prev) => prev.filter((r) => r.id !== reminder.id));
      speak("Failed to save reminder. Please try again.");
      setSyncStatus("error");
    }
  };
  const handleDeleteReminder = async (createdAt) => {
    // Find the reminder to delete for optimistic update
    const reminderToDelete = reminders.find((r) => r.created_at === createdAt);
    if (!reminderToDelete) return;

    // Optimistic update - remove from UI immediately
    setReminders((prev) => prev.filter((r) => r.created_at !== createdAt));
    speak("Reminder deleted");

    try {
      setSyncStatus("syncing");
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

      // Successful deletion
      setSyncStatus("success");
      console.log("Reminder successfully deleted from server");
    } catch (error) {
      console.error("Error deleting reminder:", error);
      // Revert optimistic update on error
      setReminders((prev) => [...prev, reminderToDelete]);
      speak("Failed to delete reminder. Please try again.");
      setSyncStatus("error");
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

  const handleVoiceReminder = async (voiceInput) => {
    if (!user?.id) {
      speak("Please log in to create voice reminders");
      return;
    }

    setIsVoiceLoading(true);
    setSyncStatus("syncing");

    try {
      console.log("Sending voice input for reminder creation:", voiceInput);

      const response = await fetch(`${route_endpoint}/format-reminder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          input: voiceInput,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to create voice reminder: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Voice reminder response:", data);

      if (data.success && data.reminders) {
        speak(data.message || "Voice reminder created successfully");

        // Sync with backend to get the latest reminders including the new one
        await fetchReminders(false); // Don't show loading state
        setSyncStatus("success");

        console.log(
          `Voice reminder created: ${data.reminders.length} reminders processed`
        );
      } else {
        throw new Error(data.error || "Failed to create voice reminder");
      }
    } catch (error) {
      console.error("Error creating voice reminder:", error);
      speak("Sorry, there was an issue creating your voice reminder");
      setSyncStatus("error");
    } finally {
      setIsVoiceLoading(false);
    }
  };

  // Auto-sync when user changes
  useEffect(() => {
    if (user?.id) {
      console.log("User changed, fetching reminders for:", user.id);
      fetchReminders();
    }
  }, [user?.id]);

  // Auto-sync every 30 seconds to keep data fresh
  useEffect(() => {
    if (!user?.id) return;

    const syncInterval = setInterval(() => {
      console.log("Auto-syncing reminders...");
      fetchReminders(false); // Silent sync without loading indicator
    }, 30000); // 30 seconds

    return () => clearInterval(syncInterval);
  }, [user?.id]);

  // Sync when window regains focus (user comes back to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (user?.id) {
        console.log("Window focused, syncing reminders...");
        fetchReminders(false);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user?.id]);

  // Initial load on component mount
  useEffect(() => {
    if (user?.id) {
      fetchReminders();
    }
  }, []);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-primary-50 via-primary-100/50 to-accent-yellow/20 dark:from-dark-50 dark:via-dark-100/50 dark:to-accent-yellow/10 flex flex-col">
      {/* Show Stop Alarm button if alarm is playing */}
      {isAlarmPlaying && alarmAudio && (
        <div className="fixed top-0 left-0 w-full flex justify-center z-50 px-4">
          <button
            onClick={handleStopAlarm}
            className="bg-accent-orange text-white font-semibold px-4 py-2 sm:px-6 sm:py-3 rounded-b-xl sm:rounded-b-2xl shadow-lg animate-bounce mt-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white text-sm sm:text-lg touch-manipulation"
            aria-label="Stop Alarm"
          >
            Stop Alarm
          </button>
        </div>
      )}
      {/* Page Header */}
      <div className="w-full bg-gradient-to-r from-primary-100/80 via-primary-200/80 to-accent-yellow/30 dark:from-dark-100/80 dark:via-dark-200/80 dark:to-accent-yellow/20 backdrop-blur-sm border-b border-primary-200/30 dark:border-dark-600/30">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col items-center text-center gap-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-300 dark:text-primary-100">
              {t("reminders")}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Button
                onClick={() => fetchReminders(true)}
                variant="outline"
                size="sm"
                icon={RefreshCw}
                disabled={isLoading || syncStatus === "syncing"}
                ariaLabel={t("refreshReminders", "Refresh reminders")}
                className={`${syncStatus === "syncing" ? "animate-pulse" : ""}`}
              >
                <span className="hidden sm:inline ml-1">{t("refresh")}</span>
              </Button>
              <Button
                onClick={() => setShowAddForm(true)}
                variant="primary"
                size="sm"
                icon={Plus}
                ariaLabel={t("add")}
              >
                <span className="ml-1">{t("addReminder")}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary-200 dark:border-primary-100"></div>
            <p className="ml-3 sm:ml-4 text-sm sm:text-base text-primary-300 dark:text-primary-100">
              {t("loadingReminders", "Loading reminders...")}
            </p>
          </div>
        ) : uniqueReminders.length === 0 ? (
          <div className="text-center py-12 bg-white/50 dark:bg-dark-50/50 rounded-2xl border border-primary-100/20 dark:border-dark-600/20 backdrop-blur-sm">
            <div className="text-primary-200 dark:text-primary-100 mb-2 text-base sm:text-lg">
              {t("noReminders", "No reminders found")}
            </div>
            <p className="text-sm text-primary-200/80 dark:text-primary-100/60">
              {t("addFirstReminder", "Add your first reminder to get started")}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {uniqueReminders.map((reminder) => (
              <Card
                key={reminder.created_at}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 w-full gap-4 hover:shadow-md transition-all duration-200 bg-white/90 dark:bg-dark-50/90 border border-primary-100/20 dark:border-dark-600/20 backdrop-blur-sm hover:scale-[1.01] hover:border-primary-200/30 dark:hover:border-primary-100/30"
              >
                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                  <div className="bg-gradient-to-br from-primary-100/20 to-accent-yellow/20 dark:from-primary-100/10 dark:to-accent-yellow/10 rounded-full p-2.5 flex-shrink-0 mt-0.5 sm:mt-0">
                    <Clock
                      className="text-primary-200 dark:text-primary-100 w-5 h-5 sm:w-6 sm:h-6"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base sm:text-lg md:text-xl text-primary-300 dark:text-primary-100 break-words leading-tight">
                      {reminder.title}
                    </h3>
                    <p className="text-sm text-primary-200 dark:text-primary-100/80 mt-1">
                      <span className="inline-block">
                        {formatDate(reminder.date)}
                      </span>
                      <span className="mx-2 text-primary-100 dark:text-primary-100/40">
                        •
                      </span>
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
                    className="flex-1 sm:flex-none hover:bg-primary-100/10 dark:hover:bg-primary-100/5"
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
        )}
        {/* Add Reminder Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 dark:bg-dark-50/95 rounded-xl sm:rounded-2xl shadow-xl w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto transform animate-in fade-in zoom-in-95 duration-200 border border-primary-100/20 dark:border-dark-600/20 backdrop-blur-sm">
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-primary-300 dark:text-primary-100">
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
