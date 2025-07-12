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
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { useVoice } from "../hooks/useVoice";
import { route_endpoint, convertTo24Hour, formatTimeForDisplay, formatTimeForSpeech, formatDate } from "../utils/helper";
import { useApp } from "../context/AppContext";

export function Reminders() {
  const navigate = useNavigate();
  const { speak, stop, isSpeaking } = useVoice();
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
      console.error("No user ID available for fetching reminders");
      return;
    }

    try {
      if (showLoadingState) {
        setIsLoading(true);
        setSyncStatus("syncing");
      }

      const response = await fetch(
        `${route_endpoint}/reminders?userId=${user.id}&timestamp=${Date.now()}`,
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
        throw new Error(`Failed to fetch reminders: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.reminders)) {
        // Sort reminders by created_at in descending order (newest first)
        // and normalize time format to 12-hour display format
        const sortedReminders = data.reminders
          .map(reminder => ({
            ...reminder,
            time: formatTimeForDisplay(reminder.time) // Ensure 12-hour format
          }))
          .sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at);
          });
        setReminders(sortedReminders);
        setSyncStatus("success");
      } else {
        throw new Error("Invalid reminders data format");
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
      setSyncStatus("error");
      speak("Sorry, there was an issue syncing your reminders");
    } finally {
      if (showLoadingState) {
        setIsLoading(false);
        setTimeout(() => setSyncStatus("idle"), 2000);
      }
    }
  };
  const handleAddReminder = async () => {
    if (!newReminder.title || !newReminder.time || !newReminder.date) {
      console.error("Missing required fields:", { newReminder });
      return;
    }
    if (!user?.id) {
      console.error("No user ID available");
      speak("Please log in to add reminders");
      return;
    }

    setIsLoading(true);
    const reminder = {
      title: newReminder.title,
      time: newReminder.time,
      date: newReminder.date,
      userId: user.id,
    };

    try {
      setSyncStatus("syncing");
      const response = await fetch(`${route_endpoint}/reminder-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(reminder),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save reminder to server");
      }

      const data = await response.json();

      if (data.success) {
        // Fetch updated reminders after successful addition
        await fetchReminders(false);
        setShowAddForm(false);
        setNewReminder({ title: "", time: "", date: "" });
        speak("Reminder added successfully");
        setSyncStatus("success");
      } else {
        throw new Error(data.error || "Failed to save reminder");
      }
    } catch (error) {
      console.error("Error saving reminder:", error);
      speak("Failed to save reminder. Please try again.");
      setSyncStatus("error");
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteReminder = async (reminderId) => {
    if (!user?.id) {
      speak("Please log in to delete reminders");
      return;
    }

    setIsLoading(true);
    try {
      setSyncStatus("syncing");
      const response = await fetch(`${route_endpoint}/delete-reminder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          id: reminderId,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete reminder from server");
      }

      const data = await response.json();

      if (data.success) {
        // Fetch updated reminders after successful deletion
        await fetchReminders(false);
        speak("Reminder deleted successfully");
        setSyncStatus("success");
      } else {
        throw new Error(data.error || "Failed to delete reminder");
      }
    } catch (error) {
      console.error("Error deleting reminder:", error);
      speak("Failed to delete reminder. Please try again.");
      setSyncStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadReminder = (reminder) => {
    const timeForSpeech = formatTimeForSpeech(reminder.time);
    speak(
      `Reminder: ${reminder.title} at ${timeForSpeech} on ${reminder.date}`
    );
  };

  // Use formatDate from helper.js for consistency - no local function needed

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
    // Only schedule alarms for future reminders and limit to 1 audio at a time
    const now = new Date();
    const futureReminders = uniqueReminders.filter((reminder) => {
      if (!reminder.date || !reminder.time) return false;
      const time24h = convertTo24Hour(reminder.time);
      const reminderTime = new Date(`${reminder.date}T${time24h}`);
      return reminderTime > now;
    });
    futureReminders.forEach((reminder) => {
      const time24h = convertTo24Hour(reminder.time);
      const reminderTime = new Date(`${reminder.date}T${time24h}`);
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
              body: `${reminder.title} at ${formatTimeForDisplay(reminder.time)} on ${reminder.date}`,
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

      if (data.success && data.reminders) {
        speak(data.message || "Voice reminder created successfully");

        // Sync with backend to get the latest reminders including the new one
        await fetchReminders(false); // Don't show loading state
        setSyncStatus("success");
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
      fetchReminders();
    } else {
      console.error("No user ID available for fetching reminders");
    }
  }, [user?.id]);

  // Sync when window regains focus (user comes back to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (user?.id) {
        fetchReminders(false);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user?.id]);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-primary-50 via-primary-100/50 to-accent-yellow/20 dark:from-dark-50 dark:via-dark-100/50 dark:to-accent-yellow/10 flex flex-col mb-10">
      {/* Show Stop Alarm button if alarm is playing */}
      {isAlarmPlaying && alarmAudio && (
        <div className="fixed top-0 left-0 w-full flex justify-center z-50 px-4">
          <button
            onClick={handleStopAlarm}
            className="bg-accent-orange text-white font-semibold px-4 py-2 sm:px-6 sm:py-3 rounded-b-xl sm:rounded-b-2xl shadow-lg animate-bounce mt-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white text-sm sm:text-lg touch-manipulation dark:bg-accent-orange/90"
            aria-label="Stop Alarm"
          >
            Stop Alarm
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="w-full bg-gradient-to-br from-primary-50 via-primary-100/50 to-accent-yellow/20 dark:from-dark-50 dark:via-dark-100/50 dark:to-accent-yellow/10 backdrop-blur-sm border-b border-primary-100/20 dark:border-dark-600/20">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col items-center text-center gap-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-300 dark:text-primary-100">
              Reminders
            </h1>
            <p className="text-primary-200/80 dark:text-primary-100/60 text-sm sm:text-base max-w-md">
              Manage your daily reminders and stay on track
            </p>
            <div className="flex items-center gap-2 md:gap-6 mt-4 justify-around">
              <Button
                onClick={() => {
                  stop(); // Stop any ongoing speech
                  fetchReminders(true);
                }}
                variant="outline"
                size="lg"
                disabled={isLoading || syncStatus === "syncing"}
                ariaLabel="Refresh reminders"
                className={`${
                  syncStatus === "syncing" ? "animate-pulse" : ""
                } 
                  px-6 py-3 
                  dark:hover:text-white
                  hover:bg-primary-50 dark:hover:bg-dark-200 
                  border-2 border-primary-200/30 dark:border-dark-600/30
                  rounded-xl
                  transition-all duration-300
                  hover:scale-105
                  hover:shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed
                  text-base font-medium
                  flex items-center justify-center gap-2`}
              >
                <div className="flex items-center gap-1 align-middle">
                  <RefreshCw className="w-5 h-5" />
                  <span>Refresh</span>
                </div>
              </Button>
              <Button
                onClick={() => setShowAddForm(true)}
                variant="primary"
                size="lg"
                ariaLabel="Add reminder"
                className="
                  px-6 py-3
                  bg-gradient-to-r from-primary-300 to-primary-400 
                  dark:from-primary-200 dark:to-primary-300 
                  hover:from-primary-400 hover:to-primary-500 
                  dark:hover:from-primary-300 dark:hover:to-primary-400 
                  text-white 
                  rounded-xl
                  shadow-lg
                  transition-all duration-300
                  hover:scale-105
                  hover:shadow-xl
                  focus:ring-2 focus:ring-primary-200/50 dark:focus:ring-primary-100/50
                  text-base font-medium
                  flex items-center justify-center gap-2"
              >
                <div className="flex items-center gap-1">
                  <Plus className="w-5 h-5" />
                  <span>Add Reminder</span>
                </div>
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
              Loading reminders...
            </p>
          </div>
        ) : uniqueReminders.length === 0 ? (
          <div className="text-center py-12 bg-white/50 dark:bg-dark-50/50 rounded-2xl border border-primary-100/20 dark:border-dark-600/20 backdrop-blur-sm mb-10">
            <div className="text-primary-200 dark:text-primary-100 mb-2 text-base sm:text-lg">
              No reminders found
            </div>
            <p className="text-sm text-primary-200/80 dark:text-primary-100/60">
              Add your first reminder to get started
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 mb-10">
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
                        {formatDate(reminder.date, { weekday: "short", month: "short", day: "numeric" })}
                      </span>
                      <span className="mx-2 text-primary-100 dark:text-primary-100/40">
                        •
                      </span>
                      <span className="inline-block">{formatTimeForDisplay(reminder.time)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    onClick={() => handleReadReminder(reminder)}
                    variant="outline"
                    size="sm"
                    icon={Volume2}
                    ariaLabel="Read reminder"
                    className="flex-1 sm:flex-none hover:bg-primary-100 dark:hover:bg-primary-100"
                  />
                  <Button
                    onClick={() => handleDeleteReminder(reminder.id)}
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    ariaLabel="Delete reminder"
                    className="flex-1 sm:flex-none dark:bg-red-600"
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
                  Add Reminder
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  <Input
                    label="Title"
                    value={newReminder.title}
                    onChange={(e) =>
                      setNewReminder({ ...newReminder, title: e.target.value })
                    }
                    required
                    placeholder="Enter reminder title"
                    className="w-full dark:bg-dark-200"
                  />

                  <Input
                    label="Date"
                    type="date"
                    value={newReminder.date}
                    onChange={(e) =>
                      setNewReminder({ ...newReminder, date: e.target.value })
                    }
                    required
                    className="w-full dark:bg-dark-200"
                  />

                  <Input
                    label="Time"
                    type="time"
                    value={convertTo24Hour(newReminder.time)}
                    onChange={(e) => {
                      const time24h = e.target.value;
                      const time12h = formatTimeForDisplay(time24h);
                      setNewReminder({ ...newReminder, time: time12h });
                    }}
                    required
                    className="w-full dark:bg-dark-200"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 sm:mt-8">
                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="outline"
                    size="md"
                    ariaLabel="Cancel"
                    className="w-full sm:w-auto order-2 sm:order-1 dark:hover:bg-dark-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddReminder}
                    variant="primary"
                    size="md"
                    ariaLabel="Add reminder"
                    className="w-full sm:w-auto order-1 sm:order-2 dark:bg-dark-300"
                    disabled={
                      !newReminder.title ||
                      !newReminder.time ||
                      !newReminder.date
                    }
                  >
                    Add
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
