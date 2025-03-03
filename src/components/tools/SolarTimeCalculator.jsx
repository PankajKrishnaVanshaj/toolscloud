'use client';

import React, { useState, useEffect } from 'react';

const SolarTimeCalculator = () => {
  const [latitude, setLatitude] = useState('40.7128'); // Default: New York City
  const [longitude, setLongitude] = useState('-74.0060');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [altitude, setAltitude] = useState('0'); // Meters above sea level
  const [solarTimes, setSolarTimes] = useState({});
  const [error, setError] = useState('');

  // Time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  // Calculate solar time based on longitude and date
  const calculateSolarTimes = () => {
    try {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const alt = parseFloat(altitude);
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        throw new Error('Invalid coordinates');
      }

      const inputDate = new Date(date);
      if (isNaN(inputDate.getTime())) throw new Error('Invalid date');

      // Julian Day calculation
      const jd = inputDate.getTime() / 86400000 + 2440587.5;
      const n = jd - 2451545.0; // Days since J2000.0
      const L = (280.460 + 0.9856474 * n) % 360; // Mean longitude
      const g = (357.528 + 0.9856003 * n) % 360; // Mean anomaly
      const lambda = L + 1.915 * Math.sin(g * Math.PI / 180) + 0.020 * Math.sin(2 * g * Math.PI / 180); // Ecliptic longitude

      // Obliquity of the ecliptic
      const epsilon = 23.439 - 0.0000004 * n;
      const sinDelta = Math.sin(epsilon * Math.PI / 180) * Math.sin(lambda * Math.PI / 180);
      const declination = Math.asin(sinDelta) * 180 / Math.PI; // Solar declination

      // Equation of time (approximation in minutes)
      const B = (360 / 365.24) * (n - 81) * Math.PI / 180;
      const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

      // Hour angle for sunrise/sunset (cos H0 = -tan(lat) * tan(declination))
      const cosH0 = -Math.tan(lat * Math.PI / 180) * Math.tan(declination * Math.PI / 180);
      const h0 = Math.acos(cosH0) * 180 / Math.PI; // Hour angle in degrees

      // Altitude correction (approximate, in minutes)
      const altCorrection = (alt > 0 ? Math.sqrt(alt) / 60 : 0);

      // Local Standard Time Meridian
      const lstMeridian = -new Date().getTimezoneOffset() / 4; // Approximation based on time zone offset
      const timeCorrection = 4 * (lon - lstMeridian) + eot; // Minutes

      // Solar noon (in minutes from midnight UTC)
      const solarNoonMinutes = 720 - timeCorrection;
      const sunriseMinutes = solarNoonMinutes - 4 * h0 - altCorrection;
      const sunsetMinutes = solarNoonMinutes + 4 * h0 + altCorrection;

      // Convert to local time
      const formatTime = (minutes) => {
        const dateObj = new Date(inputDate);
        dateObj.setUTCHours(0, 0, 0, 0);
        dateObj.setUTCMinutes(minutes);
        return new Intl.DateTimeFormat('en-US', {
          timeZone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(dateObj);
      };

      setSolarTimes({
        solarNoon: formatTime(solarNoonMinutes),
        sunrise: formatTime(sunriseMinutes),
        sunset: formatTime(sunsetMinutes),
        equationOfTime: eot.toFixed(2) + ' minutes',
        declination: declination.toFixed(2) + '°',
      });
      setError('');
    } catch (err) {
      setError(`Calculation error: ${err.message}`);
      setSolarTimes({});
    }
  };

  useEffect(() => {
    calculateSolarTimes();
  }, [latitude, longitude, date, timeZone, altitude]);

  const handleNow = () => {
    setDate(new Date().toISOString().slice(0, 10));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Solar Time Calculator
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude (°N/S, -90 to 90)
                </label>
                <input
                  type="number"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  min="-90"
                  max="90"
                  step="0.0001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude (°E/W, -180 to 180)
                </label>
                <input
                  type="number"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  min="-180"
                  max="180"
                  step="0.0001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Zone
                </label>
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Altitude (meters)
              </label>
              <input
                type="number"
                value={altitude}
                onChange={(e) => setAltitude(e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleNow}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Use Current Date
            </button>
          </div>

          {/* Results Section */}
          {Object.keys(solarTimes).length > 0 && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Solar Times:</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Solar Noon:</span> {solarTimes.solarNoon}</p>
                <p><span className="font-medium">Sunrise:</span> {solarTimes.sunrise}</p>
                <p><span className="font-medium">Sunset:</span> {solarTimes.sunset}</p>
                <p><span className="font-medium">Equation of Time:</span> {solarTimes.equationOfTime}</p>
                <p><span className="font-medium">Solar Declination:</span> {solarTimes.declination}</p>
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Notes</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Calculates solar noon, sunrise, and sunset</li>
              <li>Adjusts for altitude above sea level</li>
              <li>Uses approximate astronomical calculations</li>
              <li>Supports all time zones</li>
              <li>Latitude: Positive = North, Negative = South</li>
              <li>Longitude: Positive = East, Negative = West</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default SolarTimeCalculator;