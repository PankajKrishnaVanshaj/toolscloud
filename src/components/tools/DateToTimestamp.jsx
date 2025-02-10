"use client";

import { useState } from "react";

const DateToTimestamp = () => {
  const [date, setDate] = useState("");
  const [timestampSeconds, setTimestampSeconds] = useState("");
  const [timestampMilliseconds, setTimestampMilliseconds] = useState("");

  // Convert Date to Timestamp
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);

    if (selectedDate) {
      const time = new Date(selectedDate).getTime();
      setTimestampSeconds(Math.floor(time / 1000)); // Convert to seconds
      setTimestampMilliseconds(time); // Keep in milliseconds
    } else {
      setTimestampSeconds("");
      setTimestampMilliseconds("");
    }
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      {/* Input: Select Date & Time */}
      <div className="mb-4">
        <label className="block font-medium">Select Date & Time:</label>
        <input
          type="datetime-local"
          value={date}
          onChange={handleDateChange}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Output: Unix Timestamp (Seconds) */}
      {timestampSeconds && (
        <div className="p-3 bg-gray-100 rounded-lg text-lg text-center mb-2">
          <strong>Timestamp (Seconds):</strong> {timestampSeconds}
        </div>
      )}

      {/* Output: Unix Timestamp (Milliseconds) */}
      {timestampMilliseconds && (
        <div className="p-3 bg-gray-100 rounded-lg text-lg text-center">
          <strong>Timestamp (Milliseconds):</strong> {timestampMilliseconds}
        </div>
      )}
    </div>
  );
};

export default DateToTimestamp;
