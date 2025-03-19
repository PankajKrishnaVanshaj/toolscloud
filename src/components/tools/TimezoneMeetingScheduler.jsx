"use client";
import React, { useState, useCallback } from "react";
import { FaPlus, FaTrash, FaCalendarCheck, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading schedule

const TimezoneMeetingScheduler = () => {
  const [participants, setParticipants] = useState([
    { id: 1, name: "Participant 1", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  ]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [startHour, setStartHour] = useState(9); // Default 9 AM
  const [startMinute, setStartMinute] = useState(0); // Default 0 minutes
  const [duration, setDuration] = useState(1); // Default 1 hour
  const [showLocalTime, setShowLocalTime] = useState(true);
  const scheduleRef = React.useRef(null);

  // Filtered list of common timezones
  const timezones = Intl.supportedValuesOf("timeZone").filter((tz) =>
    ["America", "Europe", "Asia", "Australia", "Africa"].some((region) => tz.startsWith(region))
  );

  // Add a new participant
  const addParticipant = () => {
    setParticipants((prev) => [
      ...prev,
      { id: Date.now(), name: `Participant ${prev.length + 1}`, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    ]);
  };

  // Remove a participant
  const removeParticipant = (id) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  // Update participant details
  const updateParticipant = (id, field, value) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // Reset all fields
  const reset = () => {
    setParticipants([{ id: 1, name: "Participant 1", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }]);
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setStartHour(9);
    setStartMinute(0);
    setDuration(1);
    setShowLocalTime(true);
  };

  // Generate time slots
  const generateTimeSlots = useCallback(() => {
    const slots = [];
    const baseDate = new Date(
      `${selectedDate}T${startHour.toString().padStart(2, "0")}:${startMinute
        .toString()
        .padStart(2, "0")}:00`
    );

    participants.forEach((participant) => {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: participant.timezone,
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const startTime = formatter.format(baseDate);
      const endTime = formatter.format(
        new Date(baseDate.getTime() + duration * 60 * 60 * 1000)
      );

      slots.push({
        participantId: participant.id,
        name: participant.name,
        timezone: participant.timezone,
        time: `${startTime} - ${endTime}`,
      });
    });

    return slots;
  }, [participants, selectedDate, startHour, startMinute, duration]);

  // Download schedule as image
  const downloadSchedule = () => {
    if (scheduleRef.current) {
      html2canvas(scheduleRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `meeting-schedule-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Timezone Meeting Scheduler
        </h1>

        {/* Date and Time Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Hour</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Minute</label>
            <input
              type="number"
              value={startMinute}
              onChange={(e) => setStartMinute(Math.max(0, Math.min(59, Number(e.target.value))))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              max="59"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hrs)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Math.max(0.5, Number(e.target.value)))}
              step="0.5"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0.5"
            />
          </div>
        </div>

        {/* Participants */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Participants</h2>
            <div className="flex gap-2">
              <button
                onClick={addParticipant}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <FaPlus className="mr-2" /> Add
              </button>
              <button
                onClick={reset}
                className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {participants.map((participant, index) => (
              <div key={participant.id} className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-3 rounded-md">
                <input
                  type="text"
                  value={participant.name}
                  onChange={(e) => updateParticipant(participant.id, "name", e.target.value)}
                  placeholder={`Participant ${index + 1}`}
                  className="w-full sm:w-1/3 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={participant.timezone}
                  onChange={(e) => updateParticipant(participant.id, "timezone", e.target.value)}
                  className="w-full sm:flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
                {participants.length > 1 && (
                  <button
                    onClick={() => removeParticipant(participant.id)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div ref={scheduleRef} className="bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Meeting Schedule</h2>
            <div className="flex items-center gap-2">
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={showLocalTime}
                  onChange={(e) => setShowLocalTime(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                Show Local Time
              </label>
              <button
                onClick={downloadSchedule}
                disabled={!timeSlots.length}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>
          </div>
          {timeSlots.length > 0 ? (
            <ul className="space-y-2">
              {timeSlots.map((slot, index) => (
                <li key={index} className="text-sm bg-white p-2 rounded-md shadow-sm">
                  <span className="font-medium">{slot.name} ({slot.timezone}):</span> {slot.time}
                  {showLocalTime && (
                    <span className="text-gray-500 ml-2">
                      (Local: {new Intl.DateTimeFormat("en-US", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      }).format(new Date(`${selectedDate}T${startHour.toString().padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}:00`))})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Add participants to see time slots</p>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Custom participant names</li>
            <li>Flexible start time with minutes</li>
            <li>Duration in half-hour increments</li>
            <li>Show local time toggle</li>
            <li>Download schedule as PNG</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Note: Times are calculated based on the selected date and time in each participant's timezone.
        </p>
      </div>
    </div>
  );
};

export default TimezoneMeetingScheduler;