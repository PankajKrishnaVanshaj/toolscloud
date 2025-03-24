"use client";
import React, { useState, useCallback } from "react";
import { FaPlus, FaTrash, FaDownload, FaSync } from "react-icons/fa";

const TimeZoneConflictChecker = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      start: "",
      end: "",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      description: "",
    },
  ]);
  const [conflicts, setConflicts] = useState([]);
  const [autoCheck, setAutoCheck] = useState(true);
  const timeZones = Intl.supportedValuesOf("timeZone");

  // Add a new event
  const addEvent = () => {
    setEvents((prev) => [
      ...prev,
      {
        id: Date.now(),
        start: "",
        end: "",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        description: "",
      },
    ]);
  };

  // Remove an event
  const removeEvent = (id) => {
    setEvents((prev) => {
      const updatedEvents = prev.filter((event) => event.id !== id);
      if (autoCheck) checkConflicts(updatedEvents);
      return updatedEvents;
    });
  };

  // Update event details
  const updateEvent = useCallback(
    (id, field, value) => {
      setEvents((prev) => {
        const updatedEvents = prev.map((event) =>
          event.id === id ? { ...event, [field]: value } : event
        );
        if (autoCheck) checkConflicts(updatedEvents);
        return updatedEvents;
      });
    },
    [autoCheck]
  );

  // Check for conflicts
  const checkConflicts = useCallback((eventList = events) => {
    const conflictsFound = [];
    const eventsWithUTC = eventList
      .map((event) => {
        if (!event.start || !event.end) return null;
        const startUTC = new Date(event.start).toLocaleString("en-US", {
          timeZone: event.timeZone,
        });
        const endUTC = new Date(event.end).toLocaleString("en-US", {
          timeZone: event.timeZone,
        });
        return {
          ...event,
          startUTC: new Date(startUTC).getTime(),
          endUTC: new Date(endUTC).getTime(),
        };
      })
      .filter(Boolean);

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
  }, [events]);

  // Export events as JSON
  const exportEvents = () => {
    const json = JSON.stringify(
      events.map((event) => ({
        description: event.description,
        start: event.start,
        end: event.end,
        timeZone: event.timeZone,
      })),
      null,
      2
    );
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `events-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import events from JSON
  const importEvents = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedEvents = JSON.parse(event.target.result);
          setEvents(
            importedEvents.map((ev, index) => ({
              id: Date.now() + index,
              start: ev.start || "",
              end: ev.end || "",
              timeZone: ev.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
              description: ev.description || "",
            }))
          );
          if (autoCheck) checkConflicts(importedEvents);
        } catch (error) {
          alert("Invalid JSON file format");
        }
      };
      reader.readAsText(file);
    }
  };

  // Reset all events
  const resetEvents = () => {
    setEvents([
      {
        id: 1,
        start: "",
        end: "",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        description: "",
      },
    ]);
    setConflicts([]);
  };

  // Format datetime with timezone
  const formatDateTime = (dateTime, timeZone) => {
    if (!dateTime) return "Not set";
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(dateTime));
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Time Zone Conflict Checker
        </h1>

        {/* Controls */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={addEvent}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <FaPlus className="mr-2" /> Add Event
            </button>
            <div>
              <input
                type="file"
                accept=".json"
                onChange={importEvents}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
            </div>
            <button
              onClick={exportEvents}
              disabled={!events.length}
              className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <FaDownload className="mr-2" /> Export Events
            </button>
            <button
              onClick={resetEvents}
              className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              checked={autoCheck}
              onChange={(e) => setAutoCheck(e.target.checked)}
              className="mr-2 accent-blue-500"
            />
            <label className="text-sm text-gray-700">Auto-check conflicts</label>
          </div>
        </div>

        {/* Events Input */}
        <div className="space-y-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={event.start}
                    onChange={(e) => updateEvent(event.id, "start", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={event.end}
                    onChange={(e) => updateEvent(event.id, "end", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Zone
                  </label>
                  <select
                    value={event.timeZone}
                    onChange={(e) => updateEvent(event.id, "timeZone", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeZones.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={event.description}
                    onChange={(e) => updateEvent(event.id, "description", e.target.value)}
                    placeholder="e.g., Team Meeting"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={() => removeEvent(event.id)}
                className="mt-4 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center text-sm"
              >
                <FaTrash className="mr-2" /> Remove
              </button>
            </div>
          ))}
        </div>

        {/* Conflicts Section */}
        {conflicts.length > 0 && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <h2 className="text-lg font-semibold text-red-700 mb-2">Conflicts Detected:</h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-red-600">
              {conflicts.map((conflict, index) => {
                const eventA = events.find((e) => e.id === conflict.eventA);
                const eventB = events.find((e) => e.id === conflict.eventB);
                return (
                  <li key={index}>
                    Conflict between "{eventA.description || "Event " + eventA.id}" (
                    {formatDateTime(eventA.start, eventA.timeZone)} -{" "}
                    {formatDateTime(eventA.end, eventA.timeZone)}) and "
                    {eventB.description || "Event " + eventB.id}" (
                    {formatDateTime(eventB.start, eventB.timeZone)} -{" "}
                    {formatDateTime(eventB.end, eventB.timeZone)})
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {conflicts.length === 0 && events.every((e) => e.start && e.end) && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-700">No conflicts detected.</p>
          </div>
        )}

        {/* Manual Check Button */}
        {!autoCheck && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={checkConflicts}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Check Conflicts
            </button>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Add multiple events with start/end times and time zones</li>
            <li>Auto or manual conflict detection across time zones</li>
            <li>Import/export events as JSON</li>
            <li>Supports all standard time zones</li>
            <li>Reset functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimeZoneConflictChecker;