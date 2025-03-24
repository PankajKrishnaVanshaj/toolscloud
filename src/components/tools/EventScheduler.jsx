"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaPlus, FaTrash, FaDownload, FaSync, FaCalendarAlt, FaList } from "react-icons/fa";

const EventScheduler = () => {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [recurrence, setRecurrence] = useState("none");
  const [recurrenceCount, setRecurrenceCount] = useState(1);
  const [color, setColor] = useState("#3b82f6"); // Default blue
  const [view, setView] = useState("list");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  const timeZones = Intl.supportedValuesOf("timeZone");
  const recurrenceOptions = {
    none: "None",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
  };

  // Load events from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem("events");
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents, (key, value) => 
        key === "start" || key === "end" ? new Date(value) : value
      ));
    }
  }, []);

  // Save events to localStorage
  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  const addEvent = useCallback(() => {
    if (!title || !startTime || !endTime) {
      alert("Please fill in all required fields");
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      alert("End time must be after start time");
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
        color,
      });

      switch (recurrence) {
        case "daily": eventDate.setDate(eventDate.getDate() + 1); break;
        case "weekly": eventDate.setDate(eventDate.getDate() + 7); break;
        case "monthly": eventDate.setMonth(eventDate.getMonth() + 1); break;
        case "yearly": eventDate.setFullYear(eventDate.getFullYear() + 1); break;
        default: break;
      }
    }

    setEvents((prev) => [...prev, ...newEvents]);
    resetForm();
  }, [title, startTime, endTime, timeZone, recurrence, recurrenceCount, color]);

  const deleteEvent = (id) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  const resetForm = () => {
    setTitle("");
    setStartTime("");
    setEndTime("");
    setRecurrence("none");
    setRecurrenceCount(1);
    setColor("#3b82f6");
  };

  const formatDateTime = (date) => {
    const options = {
      timeZone,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    const startDay = firstDay.getDay();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, 0 - i), isCurrentMonth: false });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  };

  const exportEvents = () => {
    const json = JSON.stringify(events, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `events-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Event Scheduler
        </h1>

        <div className="space-y-6">
          {/* Event Form */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter event title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence</label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(recurrenceOptions).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
            {recurrence !== "none" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Repeat Count</label>
                <input
                  type="number"
                  value={recurrenceCount}
                  onChange={(e) => setRecurrenceCount(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
            <div className="col-span-full">
              <button
                onClick={addEvent}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaPlus className="mr-2" /> Add Event
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setView("list")}
                className={`flex items-center px-4 py-2 rounded-md ${
                  view === "list" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                } hover:bg-blue-700 hover:text-white transition-colors`}
              >
                <FaList className="mr-2" /> List View
              </button>
              <button
                onClick={() => setView("calendar")}
                className={`flex items-center px-4 py-2 rounded-md ${
                  view === "calendar" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                } hover:bg-blue-700 hover:text-white transition-colors`}
              >
                <FaCalendarAlt className="mr-2" /> Calendar View
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {events.length > 0 && (
                <>
                  <button
                    onClick={exportEvents}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    <FaDownload className="mr-2" /> Export
                  </button>
                  <button
                    onClick={() => setEvents([])}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <FaTrash className="mr-2" /> Clear All
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Events Display */}
          {view === "list" && filteredEvents.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg max-h-80 overflow-y-auto">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">Scheduled Events</h2>
              <ul className="space-y-2 text-sm">
                {filteredEvents.map((event) => (
                  <li
                    key={event.id}
                    className="flex justify-between items-center p-3 bg-gray-100 rounded-lg shadow-sm"
                    style={{ borderLeft: `4px solid ${event.color}` }}
                  >
                    <span>
                      <strong>{event.title}</strong> - {formatDateTime(event.start)} to{" "}
                      {formatDateTime(event.end)}
                    </span>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <FaTrash size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {view === "calendar" && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() =>
                    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))
                  }
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Previous
                </button>
                <h2 className="text-lg font-semibold text-gray-800">
                  {currentDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
                </h2>
                <button
                  onClick={() =>
                    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))
                  }
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Next
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-sm">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center font-medium text-gray-700 p-2">
                    {day}
                  </div>
                ))}
                {getCalendarDays().map((day, index) => {
                  const dayEvents = filteredEvents.filter(
                    (e) => e.start.toDateString() === day.date.toDateString()
                  );
                  return (
                    <div
                      key={index}
                      className={`p-2 border rounded-md ${
                        day.isCurrentMonth ? "bg-white" : "bg-gray-100"
                      } ${dayEvents.length > 0 ? "border-blue-500" : "border-gray-200"} min-h-[100px]`}
                    >
                      <span
                        className={`block text-center ${
                          day.isCurrentMonth ? "text-gray-800" : "text-gray-500"
                        }`}
                      >
                        {day.date.getDate()}
                      </span>
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="text-xs truncate p-1 mt-1 rounded"
                          style={{ backgroundColor: `${event.color}20`, color: event.color }}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Create events with custom colors</li>
              <li>Recurrence: Daily, Weekly, Monthly, Yearly</li>
              <li>Time zone support</li>
              <li>List and Calendar views</li>
              <li>Search events</li>
              <li>Export events as JSON</li>
              <li>Persistent storage in browser</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventScheduler;