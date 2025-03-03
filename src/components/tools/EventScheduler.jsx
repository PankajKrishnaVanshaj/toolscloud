'use client';

import React, { useState, useEffect } from 'react';

const EventScheduler = () => {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [recurrence, setRecurrence] = useState('none');
  const [recurrenceCount, setRecurrenceCount] = useState(1);
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [currentDate, setCurrentDate] = useState(new Date());

  // Time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  const recurrenceOptions = {
    none: 'None',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
  };

  const addEvent = () => {
    if (!title || !startTime || !endTime) {
      alert('Please fill in all required fields');
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      alert('End time must be after start time');
      return;
    }

    const newEvents = [];
    let eventDate = new Date(start);

    for (let i = 0; i < recurrenceCount; i++) {
      newEvents.push({
        id: Date.now() + i,
        title,
        start: new Date(eventDate),
        end: new Date(eventDate.getTime() + (end - start)),
        timeZone,
      });

      switch (recurrence) {
        case 'daily':
          eventDate.setDate(eventDate.getDate() + 1);
          break;
        case 'weekly':
          eventDate.setDate(eventDate.getDate() + 7);
          break;
        case 'monthly':
          eventDate.setMonth(eventDate.getMonth() + 1);
          break;
        default:
          break;
      }
    }

    setEvents([...events, ...newEvents]);
    setTitle('');
    setStartTime('');
    setEndTime('');
    setRecurrence('none');
    setRecurrenceCount(1);
  };

  const deleteEvent = (id) => {
    setEvents(events.filter(event => event.id !== id));
  };

  const formatDateTime = (date) => {
    const options = {
      timeZone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add padding days from previous month
    const startDay = firstDay.getDay();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month, 0 - i);
      days.push({ date, isCurrentMonth: false });
    }

    // Add current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Add padding days from next month
    const remainingDays = 42 - days.length; // 6 weeks
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  };

  const exportEvents = () => {
    const json = JSON.stringify(events, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'events.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Event Scheduler
        </h1>

        <div className="grid gap-6">
          {/* Event Form */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">Event Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter event title"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Time Zone</label>
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeZones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Recurrence</label>
                <div className="flex gap-2">
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(recurrenceOptions).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                  {recurrence !== 'none' && (
                    <input
                      type="number"
                      value={recurrenceCount}
                      onChange={(e) => setRecurrenceCount(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={addEvent}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Add Event
            </button>
          </div>

          {/* View Toggle & Export */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-md ${view === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-600 hover:text-white`}
              >
                List View
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded-md ${view === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-600 hover:text-white`}
              >
                Calendar View
              </button>
            </div>
            {events.length > 0 && (
              <button
                onClick={exportEvents}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
              >
                Export Events
              </button>
            )}
          </div>

          {/* Events Display */}
          {view === 'list' && events.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-md max-h-60 overflow-auto">
              <h2 className="text-lg font-semibold mb-2">Scheduled Events</h2>
              <ul className="space-y-2 text-sm">
                {events.map(event => (
                  <li key={event.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                    <span>
                      {event.title} - {formatDateTime(event.start)} to {formatDateTime(event.end)}
                    </span>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {view === 'calendar' && (
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between mb-2">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Previous
                </button>
                <h2 className="text-lg font-semibold">
                  {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Next
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-sm">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-medium">{day}</div>
                ))}
                {getCalendarDays().map((day, index) => {
                  const dayEvents = events.filter(e => 
                    e.start.toDateString() === day.date.toDateString()
                  );
                  return (
                    <div
                      key={index}
                      className={`p-2 border ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-100'} ${dayEvents.length > 0 ? 'border-blue-500' : ''}`}
                    >
                      <span className={day.isCurrentMonth ? '' : 'text-gray-500'}>
                        {day.date.getDate()}
                      </span>
                      {dayEvents.map(event => (
                        <div key={event.id} className="text-xs text-blue-600 truncate">
                          {event.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Create events with start and end times</li>
              <li>Support for daily, weekly, monthly recurrence</li>
              <li>Time zone adjustments</li>
              <li>List and calendar views</li>
              <li>Export events as JSON</li>
              <li>Delete individual events</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default EventScheduler;