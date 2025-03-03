'use client';

import React, { useState, useEffect } from 'react';

const WorldClock = () => {
  const [clocks, setClocks] = useState([
    { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, label: 'Local Time' },
  ]);
  const [search, setSearch] = useState('');
  const [time, setTime] = useState(new Date());
  const [showAnalog, setShowAnalog] = useState(false);

  // Available time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timeZone) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    }).format(time);
  };

  const getTimeDifference = (timeZone) => {
    const localTime = new Date().toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
    const targetTime = new Date().toLocaleString('en-US', { timeZone });
    const diffMs = new Date(targetTime) - new Date(localTime);
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    return diffHours >= 0 ? `+${diffHours}` : `${diffHours}`;
  };

  const addClock = (timeZone) => {
    if (!clocks.some(clock => clock.timeZone === timeZone)) {
      setClocks([...clocks, { timeZone, label: timeZone }]);
      setSearch('');
    }
  };

  const removeClock = (timeZone) => {
    setClocks(clocks.filter(clock => clock.timeZone !== timeZone));
  };

  const filteredTimeZones = timeZones.filter(tz =>
    tz.toLowerCase().includes(search.toLowerCase()) && !clocks.some(clock => clock.timeZone === tz)
  );

  const AnalogClock = ({ timeZone }) => {
    const date = new Date(time.toLocaleString('en-US', { timeZone }));
    const hours = date.getHours() % 12;
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const hourDeg = (hours * 30) + (minutes / 2);
    const minuteDeg = minutes * 6;
    const secondDeg = seconds * 6;

    return (
      <div className="relative w-32 h-32 rounded-full bg-gray-100 border border-gray-300">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Hour hand */}
          <div
            className="w-1 h-12 bg-black origin-bottom absolute bottom-1/2"
            style={{ transform: `rotate(${hourDeg}deg)` }}
          />
          {/* Minute hand */}
          <div
            className="w-0.5 h-16 bg-gray-700 origin-bottom absolute bottom-1/2"
            style={{ transform: `rotate(${minuteDeg}deg)` }}
          />
          {/* Second hand */}
          <div
            className="w-px h-20 bg-red-500 origin-bottom absolute bottom-1/2"
            style={{ transform: `rotate(${secondDeg}deg)` }}
          />
          {/* Center dot */}
          <div className="w-2 h-2 bg-black rounded-full absolute" />
        </div>
        {/* Clock numbers */}
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => {
          const angle = (num * 30 - 90) * (Math.PI / 180);
          const x = 50 + 45 * Math.cos(angle);
          const y = 50 + 45 * Math.sin(angle);
          return (
            <span
              key={num}
              className="absolute text-sm"
              style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
            >
              {num}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          World Clock
        </h1>

        <div className="grid gap-6">
          {/* Controls */}
          <div className="grid gap-4">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search time zones (e.g., America/New_York)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => addClock(filteredTimeZones[0])}
                disabled={!filteredTimeZones.length}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
              >
                Add
              </button>
            </div>
            {search && filteredTimeZones.length > 0 && (
              <div className="absolute z-10 mt-12 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-auto">
                {filteredTimeZones.slice(0, 5).map(tz => (
                  <div
                    key={tz}
                    onClick={() => addClock(tz)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {tz}
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showAnalog}
                onChange={(e) => setShowAnalog(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Show Analog Clocks
              </label>
            </div>
          </div>

          {/* Clock Display */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clocks.map((clock, index) => (
              <div key={clock.timeZone} className="p-4 bg-gray-50 rounded-md relative">
                <button
                  onClick={() => removeClock(clock.timeZone)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  disabled={index === 0} // Prevent removing local time
                >
                  ×
                </button>
                <h3 className="text-lg font-semibold mb-2">{clock.label}</h3>
                <p className="text-sm text-gray-600">Time Zone: {clock.timeZone}</p>
                <p className="text-sm text-gray-600">Difference: {getTimeDifference(clock.timeZone)} hours</p>
                <p className="text-xl font-medium mt-2">{formatTime(clock.timeZone)}</p>
                {showAnalog && (
                  <div className="mt-4 flex justify-center">
                    <AnalogClock timeZone={clock.timeZone} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Displays multiple time zones simultaneously</li>
              <li>Real-time updates every second</li>
              <li>Search and add cities/time zones</li>
              <li>Toggle analog clock display</li>
              <li>Shows time difference from local time</li>
              <li>First clock (Local Time) cannot be removed</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default WorldClock;