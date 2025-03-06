// components/TimezoneMeetingScheduler.js
'use client';

import React, { useState } from 'react';

const TimezoneMeetingScheduler = () => {
  const [participants, setParticipants] = useState([
    { id: 1, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  ]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startHour, setStartHour] = useState(9); // Default 9 AM
  const [duration, setDuration] = useState(1); // Default 1 hour

  // List of common timezones (you can expand this)
  const timezones = Intl.supportedValuesOf('timeZone').filter(tz => 
    ['America', 'Europe', 'Asia', 'Australia', 'Africa'].some(region => tz.startsWith(region))
  );

  const addParticipant = () => {
    setParticipants(prev => [
      ...prev,
      { id: Date.now(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    ]);
  };

  const removeParticipant = (id) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const updateTimezone = (id, timezone) => {
    setParticipants(prev =>
      prev.map(p => (p.id === id ? { ...p, timezone } : p))
    );
  };

  const generateTimeSlots = () => {
    const slots = [];
    const baseDate = new Date(`${selectedDate}T${startHour.toString().padStart(2, '0')}:00:00`);
    
    participants.forEach(participant => {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: participant.timezone,
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });

      const startTime = formatter.format(baseDate);
      const endTime = formatter.format(
        new Date(baseDate.getTime() + duration * 60 * 60 * 1000)
      );

      slots.push({
        participantId: participant.id,
        timezone: participant.timezone,
        time: `${startTime} - ${endTime}`,
      });
    });

    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Timezone Meeting Scheduler</h1>

      {/* Date and Duration Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Hour (24h)</label>
          <input
            type="number"
            value={startHour}
            onChange={(e) => setStartHour(Math.max(0, Math.min(23, Number(e.target.value))))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            max="23"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>
      </div>

      {/* Participants */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Participants</h2>
          <button
            onClick={addParticipant}
            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Add Participant
          </button>
        </div>
        {participants.map((participant, index) => (
          <div key={participant.id} className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">#{index + 1}</span>
            <select
              value={participant.timezone}
              onChange={(e) => updateTimezone(participant.id, e.target.value)}
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
            {participants.length > 1 && (
              <button
                onClick={() => removeParticipant(participant.id)}
                className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Time Slots */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Meeting Times</h2>
        {timeSlots.length > 0 ? (
          <ul className="space-y-2">
            {timeSlots.map((slot, index) => (
              <li key={index} className="text-sm">
                <span className="font-medium">{slot.timezone}:</span> {slot.time}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Add participants to see time slots</p>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Note: Times are based on the selected date and start hour in each participant's timezone.
      </p>
    </div>
  );
};

export default TimezoneMeetingScheduler;