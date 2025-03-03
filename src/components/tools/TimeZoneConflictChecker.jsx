'use client';

import React, { useState } from 'react';

const TimeZoneConflictChecker = () => {
  const [events, setEvents] = useState([
    { id: 1, start: '', end: '', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, description: '' },
  ]);
  const [conflicts, setConflicts] = useState([]);
  const timeZones = Intl.supportedValuesOf('timeZone');

  const addEvent = () => {
    setEvents(prev => [
      ...prev,
      { id: Date.now(), start: '', end: '', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, description: '' },
    ]);
  };

  const removeEvent = (id) => {
    setEvents(prev => prev.filter(event => event.id !== id));
    checkConflicts(events.filter(event => event.id !== id));
  };

  const updateEvent = (id, field, value) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === id ? { ...event, [field]: value } : event
      )
    );
  };

  const checkConflicts = (eventList = events) => {
    const conflictsFound = [];
    const eventsWithUTC = eventList.map(event => {
      if (!event.start || !event.end) return null;
      const startUTC = new Date(event.start).toLocaleString('en-US', { timeZone: event.timeZone });
      const endUTC = new Date(event.end).toLocaleString('en-US', { timeZone: event.timeZone });
      return {
        ...event,
        startUTC: new Date(startUTC).getTime(),
        endUTC: new Date(endUTC).getTime(),
      };
    }).filter(Boolean);

    for (let i = 0; i < eventsWithUTC.length; i++) {
      for (let j = i + 1; j < eventsWithUTC.length; j++) {
        const eventA = eventsWithUTC[i];
        const eventB = eventsWithUTC[j];
        if (
          (eventA.startUTC < eventB.endUTC && eventA.endUTC > eventB.startUTC) ||
          (eventB.startUTC < eventA.endUTC && eventB.endUTC > eventA.startUTC)
        ) {
          conflictsFound.push({ eventA: eventA.id, eventB: eventB.id });
        }
      }
    }
    setConflicts(conflictsFound);
  };

  const handleCheck = () => {
    checkConflicts();
  };

  const exportEvents = () => {
    const json = JSON.stringify(events.map(event => ({
      description: event.description,
      start: event.start,
      end: event.end,
      timeZone: event.timeZone,
    })), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'events.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDateTime = (dateTime, timeZone) => {
    if (!dateTime) return '';
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(dateTime));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Time Zone Conflict Checker
        </h1>

        <div className="grid gap-6">
          {/* Events Input */}
          <div className="space-y-4">
            {events.map(event => (
              <div key={event.id} className="p-4 bg-gray-50 rounded-md border border-gray-200">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="datetime-local"
                      value={event.start}
                      onChange={(e) => updateEvent(event.id, 'start', e.target.value)}
                      onBlur={handleCheck}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="datetime-local"
                      value={event.end}
                      onChange={(e) => updateEvent(event.id, 'end', e.target.value)}
                      onBlur={handleCheck}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                    <select
                      value={event.timeZone}
                      onChange={(e) => updateEvent(event.id, 'timeZone', e.target.value)}
                      onBlur={handleCheck}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {timeZones.map((tz) => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={event.description}
                      onChange={(e) => updateEvent(event.id, 'description', e.target.value)}
                      placeholder="e.g., Team Meeting"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeEvent(event.id)}
                  className="mt-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={addEvent}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Add Event
            </button>
          </div>

          {/* Conflicts Section */}
          {conflicts.length > 0 && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <h2 className="text-lg font-semibold mb-2">Conflicts Detected:</h2>
              <ul className="list-disc list-inside space-y-2 text-sm">
                {conflicts.map((conflict, index) => {
                  const eventA = events.find(e => e.id === conflict.eventA);
                  const eventB = events.find(e => e.id === conflict.eventB);
                  return (
                    <li key={index}>
                      Conflict between "{eventA.description || 'Event ' + eventA.id}" 
                      ({formatDateTime(eventA.start, eventA.timeZone)} - {formatDateTime(eventA.end, eventA.timeZone)}) 
                      and "{eventB.description || 'Event ' + eventB.id}" 
                      ({formatDateTime(eventB.start, eventB.timeZone)} - {formatDateTime(eventB.end, eventB.timeZone)})
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {conflicts.length === 0 && events.every(e => e.start && e.end) && (
            <div className="p-4 bg-green-50 rounded-md text-green-700">
              <p>No conflicts detected.</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-between">
            <button
              onClick={handleCheck}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Check Conflicts
            </button>
            <button
              onClick={exportEvents}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
            >
              Export Events
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Add multiple events with start/end times and time zones</li>
              <li>Checks for overlapping schedules across time zones</li>
              <li>Real-time conflict detection on input change</li>
              <li>Export events as JSON</li>
              <li>Supports all standard time zones</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TimeZoneConflictChecker;