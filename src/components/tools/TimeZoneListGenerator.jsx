'use client';

import React, { useState, useEffect } from 'react';

const TimeZoneListGenerator = () => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, offset
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [timeZones, setTimeZones] = useState([]);
  const [displayFormat, setDisplayFormat] = useState('short'); // short, long, offset
  const [updateInterval, setUpdateInterval] = useState(true);

  // Get all supported time zones
  const allTimeZones = Intl.supportedValuesOf('timeZone');

  const getTimeZoneInfo = (tz) => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    const time = formatter.format(now);
    const date = dateFormatter.format(now);
    const offset = now.toLocaleString('en-US', { timeZone: tz, timeZoneName: 'longOffset' })
      .split(' ').pop()
      .replace('GMT', '');
    const offsetHours = parseInt(offset.split(':')[0], 10) || 0;

    return { name: tz, time, date, offset, offsetHours };
  };

  const updateTimeZones = () => {
    const filteredZones = allTimeZones
      .filter(tz => tz.toLowerCase().includes(search.toLowerCase()))
      .map(getTimeZoneInfo);

    const sortedZones = filteredZones.sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else {
        return sortOrder === 'asc'
          ? a.offsetHours - b.offsetHours || a.name.localeCompare(b.name)
          : b.offsetHours - a.offsetHours || b.name.localeCompare(a.name);
      }
    });

    setTimeZones(sortedZones);
  };

  useEffect(() => {
    updateTimeZones();
    if (updateInterval) {
      const interval = setInterval(updateTimeZones, 1000);
      return () => clearInterval(interval);
    }
  }, [search, sortBy, sortOrder, updateInterval]);

  const exportToCSV = () => {
    const headers = ['Time Zone', 'Current Time', 'Date', 'Offset'];
    const rows = timeZones.map(tz => [
      tz.name,
      tz.time,
      tz.date,
      tz.offset,
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'time_zones.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Time Zone List Generator
        </h1>

        <div className="grid gap-6">
          {/* Controls Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Time Zones
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g., America, UTC"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Name</option>
                  <option value="offset">Offset</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Format
                </label>
                <select
                  value={displayFormat}
                  onChange={(e) => setDisplayFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="short">Short (Time only)</option>
                  <option value="long">Long (Date + Time)</option>
                  <option value="offset">Offset Only</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={updateInterval}
                  onChange={(e) => setUpdateInterval(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Update every second
                </span>
              </label>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
              >
                Export to CSV
              </button>
            </div>
          </div>

          {/* Time Zone List */}
          <div className="p-4 bg-gray-50 rounded-md max-h-96 overflow-auto">
            <h2 className="text-lg font-semibold mb-2">Time Zones ({timeZones.length}):</h2>
            {timeZones.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4">Time Zone</th>
                    <th className="py-2 px-4">
                      {displayFormat === 'offset' ? 'Offset' : 'Current Time'}
                    </th>
                    {displayFormat === 'long' && <th className="py-2 px-4">Date</th>}
                  </tr>
                </thead>
                <tbody>
                  {timeZones.map((tz) => (
                    <tr key={tz.name} className="border-b last:border-b-0 hover:bg-gray-100">
                      <td className="py-2 px-4">{tz.name}</td>
                      <td className="py-2 px-4">
                        {displayFormat === 'offset' ? tz.offset : tz.time}
                      </td>
                      {displayFormat === 'long' && (
                        <td className="py-2 px-4">{tz.date}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No time zones match your search.</p>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Tips</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Lists all IANA time zones with current times</li>
              <li>Search by region or name</li>
              <li>Sort by name or offset</li>
              <li>Real-time updates (toggleable)</li>
              <li>Export list as CSV</li>
              <li>Multiple display formats</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TimeZoneListGenerator;