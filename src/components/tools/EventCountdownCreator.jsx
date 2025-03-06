// components/EventCountdownCreator.js
'use client';

import React, { useState, useEffect } from 'react';

const EventCountdownCreator = () => {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [countdowns, setCountdowns] = useState([]);
  const [error, setError] = useState('');

  // Calculate time remaining
  const calculateTimeRemaining = (targetDate) => {
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
  };

  // Update countdowns every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdowns(prev =>
        prev.map(countdown => ({
          ...countdown,
          timeRemaining: calculateTimeRemaining(countdown.date),
        }))
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [countdowns]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!eventName || !eventDate) {
      setError('Please enter both event name and date.');
      return;
    }

    const date = new Date(eventDate);
    if (isNaN(date.getTime())) {
      setError('Invalid date format.');
      return;
    }

    if (date <= new Date()) {
      setError('Please select a future date.');
      return;
    }

    const newCountdown = {
      id: Date.now(),
      name: eventName,
      date: date,
      timeRemaining: calculateTimeRemaining(date),
    };

    setCountdowns(prev => [...prev, newCountdown]);
    setEventName('');
    setEventDate('');
  };

  // Remove countdown
  const removeCountdown = (id) => {
    setCountdowns(prev => prev.filter(countdown => countdown.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Event Countdown Creator</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
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

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create Countdown
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 text-center mb-4">{error}</p>
      )}

      {/* Countdown List */}
      <div className="space-y-4">
        {countdowns.length > 0 ? (
          countdowns.map(countdown => (
            <div
              key={countdown.id}
              className="bg-gray-50 p-4 rounded-md flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold text-blue-600">
                  {countdown.name}
                </h2>
                <p className="text-sm text-gray-600">
                  {new Date(countdown.date).toLocaleString()}
                </p>
                {countdown.timeRemaining.expired ? (
                  <p className="text-sm text-red-600">Event has passed!</p>
                ) : (
                  <p className="text-sm text-gray-700">
                    {countdown.timeRemaining.days}d {countdown.timeRemaining.hours}h{' '}
                    {countdown.timeRemaining.minutes}m {countdown.timeRemaining.seconds}s
                  </p>
                )}
              </div>
              <button
                onClick={() => removeCountdown(countdown.id)}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">
            No countdowns created yet. Add one above!
          </p>
        )}
      </div>
    </div>
  );
};

export default EventCountdownCreator;