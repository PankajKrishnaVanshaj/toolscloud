'use client';

import React, { useState, useEffect } from 'react';

const TimeZoneHistoryViewer = () => {
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('tzFavorites')) || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // All available time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  // Filter time zones based on search query
  const filteredTimeZones = timeZones.filter(tz =>
    tz.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchTimeZoneHistory = async (tz) => {
    setLoading(true);
    setError('');
    try {
      // Note: This is a simplified simulation. In a real app, you'd use an API like IANA TZDB or a library
      const now = new Date();
      const pastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

      const transitions = [];
      const formatOptions = { timeZone: tz, timeZoneName: 'long', hour: 'numeric', hour12: false };

      // Simulate transitions (this is approximate; real data would come from a TZDB)
      for (let date = new Date(pastYear); date <= nextYear; date.setDate(date.getDate() + 1)) {
        const prevDay = new Date(date);
        prevDay.setDate(prevDay.getDate() - 1);
        
        const currentOffset = new Intl.DateTimeFormat('en-US', formatOptions)
          .formatToParts(date)
          .find(part => part.type === 'timeZoneName')?.value;
        const prevOffset = new Intl.DateTimeFormat('en-US', formatOptions)
          .formatToParts(prevDay)
          .find(part => part.type === 'timeZoneName')?.value;

        if (currentOffset !== prevOffset) {
          transitions.push({
            date: new Date(date),
            from: prevOffset,
            to: currentOffset,
            offsetChange: date.getTimezoneOffset() - prevDay.getTimezoneOffset(),
          });
        }
      }

      setHistory(transitions);
    } catch (err) {
      setError(`Failed to fetch time zone history: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeZoneHistory(timeZone);
  }, [timeZone]);

  const toggleFavorite = (tz) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(tz)
        ? prev.filter(f => f !== tz)
        : [...prev, tz];
      localStorage.setItem('tzFavorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZone,
      timeZoneName: 'short',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Time Zone History Viewer
        </h1>

        <div className="grid gap-6">
          {/* Search and Selection */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Time Zone
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., America/New_York"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Time Zone
                </label>
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-40"
                >
                  {filteredTimeZones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => toggleFavorite(timeZone)}
                className={`px-4 py-2 rounded-md ${favorites.includes(timeZone) ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-yellow-600 transition-colors`}
              >
                {favorites.includes(timeZone) ? 'Unfavorite' : 'Favorite'}
              </button>
            </div>
          </div>

          {/* Favorites */}
          {favorites.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Favorites</h2>
              <div className="flex flex-wrap gap-2">
                {favorites.map((tz) => (
                  <button
                    key={tz}
                    onClick={() => setTimeZone(tz)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                  >
                    {tz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Time Zone Transitions</h2>
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : error ? (
              <p className="text-red-700">{error}</p>
            ) : history.length === 0 ? (
              <p className="text-gray-600">No transitions found in the past/next year.</p>
            ) : (
              <div className="space-y-4 max-h-60 overflow-auto">
                {history.map((transition, index) => (
                  <div key={index} className="p-3 bg-white rounded-md shadow-sm">
                    <p><span className="font-medium">Date:</span> {formatDate(transition.date)}</p>
                    <p><span className="font-medium">From:</span> {transition.from}</p>
                    <p><span className="font-medium">To:</span> {transition.to}</p>
                    <p><span className="font-medium">Offset Change:</span> {transition.offsetChange / 60} hours</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Notes</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Shows historical and upcoming time zone transitions</li>
              <li>Search and filter time zones</li>
              <li>Save favorite time zones (stored in localStorage)</li>
              <li>Displays offset changes (e.g., DST transitions)</li>
              <li>Note: This is a simulation; real data requires a TZDB API</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TimeZoneHistoryViewer;