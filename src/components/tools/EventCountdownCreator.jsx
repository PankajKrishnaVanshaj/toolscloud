"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaTrash, FaSave, FaBell, FaSync } from "react-icons/fa";

const EventCountdownCreator = () => {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventColor, setEventColor] = useState("#3b82f6"); // Default blue
  const [countdowns, setCountdowns] = useState([]);
  const [error, setError] = useState("");
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  // Calculate time remaining
  const calculateTimeRemaining = useCallback((targetDate) => {
    const now = new Date();
    const difference = new Date(targetDate) - now;

    if (difference <= 0) {
      return { expired: true };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, expired: false };
  }, []);

  // Update countdowns every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdowns((prev) =>
        prev.map((countdown) => ({
          ...countdown,
          timeRemaining: calculateTimeRemaining(countdown.date),
        }))
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [countdowns, calculateTimeRemaining]);

  // Load saved countdowns from localStorage
  useEffect(() => {
    const savedCountdowns = JSON.parse(localStorage.getItem("countdowns") || "[]");
    setCountdowns(
      savedCountdowns.map((cd) => ({
        ...cd,
        date: new Date(cd.date),
        timeRemaining: calculateTimeRemaining(new Date(cd.date)),
      }))
    );
  }, [calculateTimeRemaining]);

  // Save countdowns to localStorage
  const saveCountdowns = useCallback(() => {
    localStorage.setItem("countdowns", JSON.stringify(countdowns));
  }, [countdowns]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!eventName || !eventDate) {
      setError("Please enter both event name and date.");
      return;
    }

    const date = new Date(eventDate);
    if (isNaN(date.getTime())) {
      setError("Invalid date format.");
      return;
    }

    if (date <= new Date()) {
      setError("Please select a future date.");
      return;
    }

    const newCountdown = {
      id: Date.now(),
      name: eventName,
      date: date,
      color: eventColor,
      timeRemaining: calculateTimeRemaining(date),
    };

    setCountdowns((prev) => [...prev, newCountdown]);
    setEventName("");
    setEventDate("");
    setEventColor("#3b82f6");
    saveCountdowns();
  };

  // Remove countdown
  const removeCountdown = (id) => {
    setCountdowns((prev) => prev.filter((countdown) => countdown.id !== id));
    saveCountdowns();
  };

  // Reset all countdowns
  const resetAll = () => {
    setCountdowns([]);
    setEventName("");
    setEventDate("");
    setEventColor("#3b82f6");
    setError("");
    localStorage.removeItem("countdowns");
  };

  // Request notification permission
  const toggleNotifications = () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }

    if (Notification.permission === "granted") {
      setNotificationEnabled(true);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setNotificationEnabled(true);
        }
      });
    }
  };

  // Check for upcoming events and notify
  useEffect(() => {
    if (notificationEnabled) {
      const now = new Date();
      countdowns.forEach((countdown) => {
        const timeLeft = new Date(countdown.date) - now;
        if (timeLeft > 0 && timeLeft <= 60000 && !countdown.notified) { // 1 minute warning
          new Notification(`Event Reminder: ${countdown.name}`, {
            body: `${countdown.name} is starting in less than a minute!`,
          });
          setCountdowns((prev) =>
            prev.map((cd) =>
              cd.id === countdown.id ? { ...cd, notified: true } : cd
            )
          );
        }
      });
    }
  }, [countdowns, notificationEnabled]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Event Countdown Creator
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Name
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g., Birthday Party"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Date & Time
              </label>
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Color
              </label>
              <input
                type="color"
                value={eventColor}
                onChange={(e) => setEventColor(e.target.value)}
                className="w-full h-10 p-1 border rounded-md cursor-pointer"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaSave className="mr-2" /> Create Countdown
              </button>
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 text-center mb-6 bg-red-50 p-2 rounded-md">
            {error}
          </p>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={toggleNotifications}
            className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
              notificationEnabled
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <FaBell className="mr-2" />
            {notificationEnabled ? "Notifications On" : "Enable Notifications"}
          </button>
          <button
            onClick={resetAll}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset All
          </button>
        </div>

        {/* Countdown List */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto">
          {countdowns.length > 0 ? (
            countdowns.map((countdown) => (
              <div
                key={countdown.id}
                className="bg-gray-50 p-4 rounded-md flex flex-col sm:flex-row justify-between items-center shadow-sm"
                style={{ borderLeft: `4px solid ${countdown.color}` }}
              >
                <div className="mb-2 sm:mb-0">
                  <h2 className="text-lg font-semibold" style={{ color: countdown.color }}>
                    {countdown.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {new Date(countdown.date).toLocaleString()}
                  </p>
                  {countdown.timeRemaining.expired ? (
                    <p className="text-sm text-red-600 font-medium">Event has passed!</p>
                  ) : (
                    <p className="text-sm text-gray-700 font-mono">
                      {countdown.timeRemaining.days}d {countdown.timeRemaining.hours}h{" "}
                      {countdown.timeRemaining.minutes}m {countdown.timeRemaining.seconds}s
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeCountdown(countdown.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                >
                  <FaTrash className="mr-1" /> Remove
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 p-4 bg-gray-50 rounded-md">
              No countdowns created yet. Add one above!
            </p>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Create multiple countdowns with custom names and dates</li>
            <li>Customizable event colors</li>
            <li>Real-time countdown updates</li>
            <li>Persistent storage using localStorage</li>
            <li>Desktop notifications (1-minute warning)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EventCountdownCreator;