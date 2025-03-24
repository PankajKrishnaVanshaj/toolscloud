"use client";
import React, { useState, useCallback } from "react";
import { FaDice, FaSave, FaHistory } from "react-icons/fa";

const RandomHistoricalEventGenerator = () => {
  const [event, setEvent] = useState(null);
  const [history, setHistory] = useState([]);
  const [era, setEra] = useState("any");
  const [tone, setTone] = useState("neutral");

  // Expanded data arrays
  const eventTypes = [
    "Battle",
    "Discovery",
    "Invention",
    "Revolution",
    "Treaty",
    "Coronation",
    "Disaster",
    "Expedition",
    "Founding",
    "Celebration",
    "Assassination",
    "Plague",
    "Reform",
    "Migration",
    "Conquest",
  ];

  const locations = [
    "Rome",
    "London",
    "Paris",
    "Beijing",
    "Cairo",
    "Athens",
    "Moscow",
    "Tokyo",
    "New York",
    "Constantinople",
    "Vienna",
    "Babylon",
    "Jerusalem",
    "Tenochtitlan",
    "Kyoto",
    "Delhi",
    "Baghdad",
    "Lisbon",
    "Timbuktu",
  ];

  const descriptors = [
    "Great",
    "Bloody",
    "Famous",
    "Unexpected",
    "Legendary",
    "Tragic",
    "Glorious",
    "Mysterious",
    "Epic",
    "Historic",
    "Fateful",
    "Monumental",
    "Daring",
    "Devastating",
    "Triumphant",
    "Secret",
  ];

  const actors = [
    "King",
    "Queen",
    "General",
    "Explorer",
    "Inventor",
    "Philosopher",
    "Rebel",
    "Priest",
    "Merchant",
    "Scientist",
    "Emperor",
    "Prophet",
    "Scholar",
    "Warrior",
    "Diplomat",
    "Poet",
    "Artisan",
  ];

  const actions = [
    "defeated",
    "discovered",
    "invented",
    "overthrew",
    "signed",
    "crowned",
    "survived",
    "explored",
    "founded",
    "celebrated",
    "assassinated",
    "unleashed",
    "reformed",
    "led",
    "conquered",
    "composed",
  ];

  const subjects = [
    "an army",
    "a new land",
    "a machine",
    "the monarchy",
    "a peace accord",
    "a new ruler",
    "a catastrophe",
    "uncharted territory",
    "a city",
    "a grand festival",
    "a rival",
    "a plague",
    "the laws",
    "a migration",
    "an empire",
    "a masterpiece",
  ];

  const eras = {
    "ancient": [-3000, 476], // Before 476 CE (Fall of Rome)
    "medieval": [476, 1500], // 476 CE - 1500 CE
    "early-modern": [1500, 1800], // 1500 CE - 1800 CE
    "modern": [1800, 2000], // 1800 CE - 2000 CE
    "any": [-3000, 2000], // Full range
  };

  // Generate random event
  const generateEvent = useCallback(() => {
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const descriptor = descriptors[Math.floor(Math.random() * descriptors.length)];
    const actor = actors[Math.floor(Math.random() * actors.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];

    // Select year based on era
    const [minYear, maxYear] = eras[era];
    const year = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
    const yearString = year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;

    // Apply tone to description
    let description;
    switch (tone) {
      case "dramatic":
        description = `In ${yearString}, amid chaos and glory, a ${actor.toLowerCase()} boldly ${action} ${subject}, forever altering the course of the ${type.toLowerCase()} in ${location}.`;
        break;
      case "mystical":
        description = `In ${yearString}, shrouded in mystery, a ${actor.toLowerCase()} ${action} ${subject}, whispering secrets of the ${type.toLowerCase()} across ${location}.`;
        break;
      case "humorous":
        description = `In ${yearString}, a rather clumsy ${actor.toLowerCase()} accidentally ${action} ${subject}, making the ${type.toLowerCase()} in ${location} quite the spectacle.`;
        break;
      default:
        description = `In ${yearString}, a ${actor.toLowerCase()} ${action} ${subject} during the ${type.toLowerCase()} in ${location}.`;
    }

    const newEvent = {
      name: `The ${descriptor} ${type} of ${location}`,
      description,
      year: yearString,
      era,
      tone,
    };

    setEvent(newEvent);
    setHistory((prev) => [newEvent, ...prev.slice(0, 9)]); // Keep last 10 events
  }, [era, tone]);

  // Download event as text file
  const downloadEvent = () => {
    if (!event) return;
    const text = `${event.name}\n${event.year}\n${event.description}`;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${event.name.replace(/\s+/g, "_")}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Historical Event Generator
        </h1>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Era</label>
            <select
              value={era}
              onChange={(e) => setEra(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
            >
              <option value="any">Any Era</option>
              <option value="ancient">Ancient (-3000 to 476 CE)</option>
              <option value="medieval">Medieval (476-1500 CE)</option>
              <option value="early-modern">Early Modern (1500-1800 CE)</option>
              <option value="modern">Modern (1800-2000 CE)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
            >
              <option value="neutral">Neutral</option>
              <option value="dramatic">Dramatic</option>
              <option value="mystical">Mystical</option>
              <option value="humorous">Humorous</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
          <button
            onClick={generateEvent}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <FaDice className="mr-2" /> Generate Event
          </button>
          <button
            onClick={downloadEvent}
            disabled={!event}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSave className="mr-2" /> Download Event
          </button>
        </div>

        {/* Current Event */}
        {event ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-2 text-green-600">{event.name}</h2>
            <p className="text-gray-600 mb-2">{event.year}</p>
            <p className="text-gray-700">{event.description}</p>
          </div>
        ) : (
          <p className="text-center text-gray-500">
            Click "Generate Event" to create a random historical event!
          </p>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
              <FaHistory className="mr-2" /> Recent Events
            </h3>
            <ul className="text-sm text-gray-600 space-y-2 max-h-48 overflow-y-auto">
              {history.map((pastEvent, index) => (
                <li
                  key={index}
                  className="p-2 bg-white rounded-md shadow-sm hover:bg-gray-100 transition-colors"
                >
                  <strong>{pastEvent.name}</strong> ({pastEvent.year}) -{" "}
                  {pastEvent.description}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable era and tone</li>
            <li>Expanded event components for variety</li>
            <li>Event history tracking (last 10 events)</li>
            <li>Download event as text file</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: These are fictional events generated for entertainment and inspiration.
        </p>
      </div>
    </div>
  );
};

export default RandomHistoricalEventGenerator;