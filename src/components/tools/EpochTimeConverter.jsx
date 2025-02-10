"use client";

import { useState } from "react";

const EpochTimeConverter = () => {
  const [epochTime, setEpochTime] = useState("");
  const [humanTime, setHumanTime] = useState("");

  // Convert Epoch to Human Date
  const convertEpochToDate = (epoch) => {
    if (!epoch) return "";
    const timestamp = epoch.length === 10 ? epoch * 1000 : Number(epoch);
    return new Date(timestamp).toLocaleString();
  };

  // Convert Human Date to Epoch
  const convertDateToEpoch = (date) => {
    if (!date) return "";
    return Math.floor(new Date(date).getTime() / 1000);
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      {/* Convert Epoch to Human Readable */}
      <div className="mb-4">
        <label className="block font-medium">Epoch Time:</label>
        <input
          type="number"
          value={epochTime}
          onChange={(e) => {
            setEpochTime(e.target.value);
            setHumanTime(convertEpochToDate(e.target.value));
          }}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter Epoch Time (e.g., 1694567890)"
        />
      </div>

      {humanTime && (
        <div className="p-3 bg-gray-100 rounded-lg text-lg text-center mb-4">
          <strong>Human Date:</strong> {humanTime}
        </div>
      )}

      {/* Convert Human Readable to Epoch */}
      <div className="mb-4">
        <label className="block font-medium">Human Readable Date:</label>
        <input
          type="datetime-local"
          onChange={(e) => {
            setHumanTime(e.target.value);
            setEpochTime(convertDateToEpoch(e.target.value));
          }}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {epochTime && humanTime && (
        <div className="p-3 bg-gray-100 rounded-lg text-lg text-center">
          <strong>Epoch Timestamp:</strong> {epochTime}
        </div>
      )}
    </div>
  );
};

export default EpochTimeConverter;
