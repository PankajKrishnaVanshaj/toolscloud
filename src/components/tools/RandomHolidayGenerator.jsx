"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the holiday card

const RandomHolidayGenerator = () => {
  const [holiday, setHoliday] = useState(null);
  const [history, setHistory] = useState([]);
  const [themeColor, setThemeColor] = useState("green");
  const cardRef = React.useRef(null);

  const prefixes = [
    "National",
    "Global",
    "Annual",
    "Cosmic",
    "Lunar",
    "Solar",
    "Mystic",
    "Festive",
    "Grand",
    "Silly",
    "Whimsical",
    "Tiny",
    "Epic",
  ];

  const themes = [
    "Pancake",
    "Starlight",
    "Robot",
    "Penguin",
    "Cloud",
    "Rainbow",
    "Music",
    "Chocolate",
    "Dream",
    "Adventure",
    "Moonbeam",
    "Firefly",
    "Bubble",
    "Llama",
    "Unicorn",
    "Pixel",
    "Velvet",
  ];

  const suffixes = [
    "Day",
    "Festival",
    "Celebration",
    "Eve",
    "Week",
    "Extravaganza",
    "Jubilee",
    "Gala",
    "Fête",
    "Carnival",
    "Spectacular",
    "Bash",
  ];

  const activities = [
    "dancing in the streets",
    "eating themed foods",
    "wearing colorful costumes",
    "launching fireworks",
    "singing traditional songs",
    "exchanging gifts",
    "parading with floats",
    "lighting lanterns",
    "baking special treats",
    "telling ancient stories",
    "painting faces",
    "building elaborate displays",
    "crafting decorations",
    "hosting costume contests",
  ];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const colors = {
    green: { bg: "bg-green-50", text: "text-green-600", button: "bg-green-600" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", button: "bg-blue-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", button: "bg-purple-600" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", button: "bg-orange-600" },
  };

  const generateHoliday = useCallback(() => {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const theme = themes[Math.floor(Math.random() * themes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const month = months[Math.floor(Math.random() * months.length)];
    const day = Math.floor(Math.random() * 28) + 1;

    const name = `${prefix} ${theme} ${suffix}`;
    const date = `${month} ${day}`;
    const description = `Celebrated by ${activity} to honor the spirit of ${theme.toLowerCase()}.`;

    const newHoliday = { name, date, description };
    setHoliday(newHoliday);
    setHistory((prev) => [newHoliday, ...prev].slice(0, 5)); // Keep last 5 holidays
  }, []);

  const downloadHoliday = () => {
    if (cardRef.current) {
      html2canvas(cardRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `${holiday.name}-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  const reset = () => {
    setHoliday(null);
    setHistory([]);
    setThemeColor("green");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Holiday Generator
        </h1>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center items-center">
          <button
            onClick={generateHoliday}
            className={`${colors[themeColor].button} hover:bg-opacity-90 text-white px-6 py-2 rounded-md transition-colors duration-200 flex items-center`}
          >
            Generate New Holiday
          </button>
          <button
            onClick={downloadHoliday}
            disabled={!holiday}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <FaDownload className="mr-2" /> Download
          </button>
          <button
            onClick={reset}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          <select
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
            className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="green">Green</option>
            <option value="blue">Blue</option>
            <option value="purple">Purple</option>
            <option value="orange">Orange</option>
          </select>
        </div>

        {/* Holiday Display */}
        {holiday && (
          <div
            ref={cardRef}
            className={`${colors[themeColor].bg} p-6 rounded-lg text-center shadow-md`}
          >
            <h2 className={`text-xl sm:text-2xl font-semibold mb-2 ${colors[themeColor].text}`}>
              {holiday.name}
            </h2>
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Date:</span> {holiday.date}
            </p>
            <p className="text-gray-700">{holiday.description}</p>
          </div>
        )}

        {!holiday && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 italic">
              Click "Generate New Holiday" to create a fun, fictional celebration!
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Recent Holidays</h3>
            <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
              {history.map((pastHoliday, index) => (
                <li key={index}>
                  <span className="font-medium">{pastHoliday.name}</span> - {pastHoliday.date} (
                  {pastHoliday.description})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Generate unique, whimsical holidays</li>
            <li>Customizable theme colors</li>
            <li>Download your holiday as an image</li>
            <li>View recent holiday history (up to 5)</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: These are fictional holidays created for fun and imagination!
        </p>
      </div>
    </div>
  );
};

export default RandomHolidayGenerator;