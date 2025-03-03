'use client';

import React, { useState, useEffect } from 'react';

const PrayerTimeCalculator = () => {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [method, setMethod] = useState('MuslimWorldLeague');
  const [prayerTimes, setPrayerTimes] = useState({});
  const [error, setError] = useState('');

  // Calculation methods with their parameters (simplified)
  const methods = {
    MuslimWorldLeague: { fajrAngle: 18, ishaAngle: 17 },
    IslamicSocietyNorthAmerica: { fajrAngle: 15, ishaAngle: 15 },
    EgyptianGeneralAuthority: { fajrAngle: 19.5, ishaAngle: 17.5 },
    UmmAlQuraUniversity: { fajrAngle: 18.5, ishaAngle: 90 }, // 90 minutes after Maghrib
    UniversityKarachi: { fajrAngle: 18, ishaAngle: 18 },
  };

  // Time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  const toRadians = (degrees) => degrees * (Math.PI / 180);
  const toDegrees = (radians) => radians * (180 / Math.PI);

  const calculatePrayerTimes = () => {
    setError('');
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      setError('Please enter valid latitude and longitude');
      return;
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const calcDate = new Date(date);
    const timeZoneOffset = new Date().toLocaleString('en-US', { timeZone, timeZoneName: 'short' }).includes('GMT') 
      ? new Date().getTimezoneOffset() / -60 
      : 0; // Simplified offset calculation

    // Julian Day
    const jd = calcDate.getTime() / 86400000 + 2440587.5;
    const day = jd - 2451545.0;

    // Solar declination
    const meanAnomaly = toRadians(357.5291 + 0.98560028 * day);
    const meanLongitude = toRadians(280.459 + 0.98564736 * day);
    const eclipticLongitude = meanLongitude + toRadians(1.915 * Math.sin(meanAnomaly) + 0.02 * Math.sin(2 * meanAnomaly));
    const declination = Math.asin(0.39795 * Math.cos(eclipticLongitude));

    // Equation of time
    const eqTime = 12 + (toDegrees(meanLongitude - eclipticLongitude) / 15);

    // Solar noon
    const solarNoon = eqTime + (lon / 15) - timeZoneOffset;

    // Fajr and Isha angles
    const { fajrAngle, ishaAngle } = methods[method];
    
    // Hour angles
    const fajrHa = toDegrees(Math.acos((Math.sin(toRadians(-fajrAngle)) - Math.sin(declination) * Math.sin(toRadians(lat))) / 
      (Math.cos(declination) * Math.cos(toRadians(lat))))) / 15;
    const maghribHa = 0; // Sunset is at horizon
    const ishaHa = ishaAngle === 90 ? 1.5 : toDegrees(Math.acos((Math.sin(toRadians(-ishaAngle)) - Math.sin(declination) * Math.sin(toRadians(lat))) / 
      (Math.cos(declination) * Math.cos(toRadians(lat))))) / 15;

    // Prayer times (in hours)
    const times = {
      fajr: solarNoon - fajrHa,
      sunrise: solarNoon - maghribHa - 0.833 / 15, // 0.833° for sun below horizon
      dhuhr: solarNoon,
      asr: solarNoon + toDegrees(Math.acos((Math.sin(Math.asin(1 / (2 + Math.tan(toRadians(lat - declination))))) - Math.sin(declination) * Math.sin(toRadians(lat))) / 
        (Math.cos(declination) * Math.cos(toRadians(lat))))) / 15, // Shafi'i method
      maghrib: solarNoon + maghribHa,
      isha: ishaAngle === 90 ? solarNoon + maghribHa + 1.5 : solarNoon + ishaHa,
    };

    // Format times
    const formattedTimes = {};
    Object.entries(times).forEach(([prayer, hour]) => {
      const totalMinutes = Math.round(hour * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const dateTime = new Date(calcDate);
      dateTime.setHours(hours, minutes, 0);
      formattedTimes[prayer] = dateTime.toLocaleTimeString('en-US', { 
        timeZone, 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
    });

    setPrayerTimes(formattedTimes);
  };

  useEffect(() => {
    calculatePrayerTimes();
  }, [latitude, longitude, date, timeZone, method]);

  const handleNow = () => {
    setDate(new Date().toISOString().slice(0, 10));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(4));
          setLongitude(position.coords.longitude.toFixed(4));
        },
        (err) => setError(`Geolocation error: ${err.message}`)
      );
    } else {
      setError('Geolocation is not supported by this browser');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Prayer Time Calculator
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Latitude
                </label>
                <input
                  type="number"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g., 40.7128"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Longitude
                </label>
                <input
                  type="number"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g., -74.0060"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleNow}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Today
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
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
              <label className="block text-sm font-medium text-gray-700">
                Calculation Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(methods).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <button
              onClick={getCurrentLocation}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Use Current Location
            </button>
          </div>

          {/* Results Section */}
          {Object.keys(prayerTimes).length > 0 && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Prayer Times:</h2>
              <div className="grid gap-2 text-sm">
                {Object.entries(prayerTimes).map(([prayer, time]) => (
                  <p key={prayer}>
                    <span className="font-medium capitalize">{prayer}:</span> {time}
                  </p>
                ))}
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
              <li>Calculates Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha times</li>
              <li>Supports multiple calculation methods</li>
              <li>Time zone adjustments</li>
              <li>Geolocation support (browser permission required)</li>
              <li>Simplified algorithm; use a library like adhan-js for production</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default PrayerTimeCalculator;