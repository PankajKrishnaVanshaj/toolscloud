"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaMapMarkerAlt, FaSync, FaSun, FaMoon } from "react-icons/fa";

const PrayerTimeCalculator = () => {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [method, setMethod] = useState("MuslimWorldLeague");
  const [asrMethod, setAsrMethod] = useState("Shafii"); // Shafi'i or Hanafi
  const [prayerTimes, setPrayerTimes] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Calculation methods with parameters
  const methods = {
    MuslimWorldLeague: { fajrAngle: 18, ishaAngle: 17, label: "Muslim World League" },
    IslamicSocietyNorthAmerica: { fajrAngle: 15, ishaAngle: 15, label: "ISNA" },
    EgyptianGeneralAuthority: { fajrAngle: 19.5, ishaAngle: 17.5, label: "Egyptian Authority" },
    UmmAlQuraUniversity: { fajrAngle: 18.5, ishaAngle: 90, label: "Umm Al-Qura" },
    UniversityKarachi: { fajrAngle: 18, ishaAngle: 18, label: "Karachi University" },
  };

  const timeZones = Intl.supportedValuesOf("timeZone");

  const toRadians = (degrees) => degrees * (Math.PI / 180);
  const toDegrees = (radians) => radians * (180 / Math.PI);

  const calculatePrayerTimes = useCallback(() => {
    setError("");
    setIsLoading(true);

    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      setError("Please enter valid latitude and longitude");
      setIsLoading(false);
      return;
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const calcDate = new Date(date);
    const timeZoneOffset = -new Date().getTimezoneOffset() / 60; // Simplified offset

    // Julian Day
    const jd = calcDate.getTime() / 86400000 + 2440587.5;
    const day = jd - 2451545.0;

    // Solar declination
    const meanAnomaly = toRadians(357.5291 + 0.98560028 * day);
    const meanLongitude = toRadians(280.459 + 0.98564736 * day);
    const eclipticLongitude =
      meanLongitude +
      toRadians(1.915 * Math.sin(meanAnomaly) + 0.02 * Math.sin(2 * meanAnomaly));
    const declination = Math.asin(0.39795 * Math.cos(eclipticLongitude));

    // Equation of time
    const eqTime = 12 + (toDegrees(meanLongitude - eclipticLongitude) / 15);

    // Solar noon
    const solarNoon = eqTime + lon / 15 - timeZoneOffset;

    // Prayer angles
    const { fajrAngle, ishaAngle } = methods[method];
    const fajrHa =
      toDegrees(
        Math.acos(
          (Math.sin(toRadians(-fajrAngle)) -
            Math.sin(declination) * Math.sin(toRadians(lat))) /
            (Math.cos(declination) * Math.cos(toRadians(lat)))
        )
      ) / 15;
    const maghribHa = 0; // Sunset at horizon
    const ishaHa =
      ishaAngle === 90
        ? 1.5
        : toDegrees(
            Math.acos(
              (Math.sin(toRadians(-ishaAngle)) -
                Math.sin(declination) * Math.sin(toRadians(lat))) /
                (Math.cos(declination) * Math.cos(toRadians(lat)))
            )
          ) / 15;

    // Asr calculation (Shafi'i or Hanafi)
    const asrFactor = asrMethod === "Shafii" ? 1 : 2;
    const asrHa =
      toDegrees(
        Math.acos(
          (Math.sin(
            Math.atan(1 / (asrFactor + Math.tan(toRadians(Math.abs(lat - declination)))))
          ) -
            Math.sin(declination) * Math.sin(toRadians(lat))) /
            (Math.cos(declination) * Math.cos(toRadians(lat)))
        )
      ) / 15;

    // Prayer times (in hours)
    const times = {
      fajr: solarNoon - fajrHa,
      sunrise: solarNoon - maghribHa - 0.833 / 15,
      dhuhr: solarNoon,
      asr: solarNoon + asrHa,
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
      formattedTimes[prayer] = dateTime.toLocaleTimeString("en-US", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    });

    setPrayerTimes(formattedTimes);
    setIsLoading(false);
  }, [latitude, longitude, date, timeZone, method, asrMethod]);

  useEffect(() => {
    if (latitude && longitude) {
      calculatePrayerTimes();
    }
  }, [latitude, longitude, date, timeZone, method, asrMethod, calculatePrayerTimes]);

  const handleNow = () => {
    setDate(new Date().toISOString().slice(0, 10));
  };

  const getCurrentLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(4));
          setLongitude(position.coords.longitude.toFixed(4));
          setIsLoading(false);
        },
        (err) => {
          setError(`Geolocation error: ${err.message}`);
          setIsLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser");
      setIsLoading(false);
    }
  };

  const reset = () => {
    setLatitude("");
    setLongitude("");
    setDate(new Date().toISOString().slice(0, 10));
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setMethod("MuslimWorldLeague");
    setAsrMethod("Shafii");
    setPrayerTimes({});
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Prayer Time Calculator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g., 40.7128"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g., -74.0060"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleNow}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  Today
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {timeZones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calculation Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {Object.entries(methods).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asr Method</label>
              <select
                value={asrMethod}
                onChange={(e) => setAsrMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="Shafii">Shafi'i (1 shadow)</option>
                <option value="Hanafi">Hanafi (2 shadows)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={getCurrentLocation}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={isLoading}
            >
              <FaMapMarkerAlt className="mr-2" /> Use Current Location
            </button>
            <button
              onClick={reset}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={isLoading}
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results Section */}
          {isLoading && (
            <div className="text-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Calculating...</p>
            </div>
          )}
          {Object.keys(prayerTimes).length > 0 && !isLoading && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                Prayer Times{" "}
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="ml-2 text-blue-500 hover:text-blue-700 text-sm"
                >
                  {showDetails ? "Hide Details" : "Show Details"}
                </button>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(prayerTimes).map(([prayer, time]) => (
                  <div
                    key={prayer}
                    className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm"
                  >
                    <span className="font-medium capitalize flex items-center">
                      {prayer === "sunrise" || prayer === "sunset" ? (
                        <FaSun className="mr-2 text-yellow-500" />
                      ) : prayer === "fajr" || prayer === "isha" ? (
                        <FaMoon className="mr-2 text-gray-600" />
                      ) : null}
                      {prayer}
                    </span>
                    <span>{time}</span>
                  </div>
                ))}
              </div>
              {showDetails && (
                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    <strong>Location:</strong> {latitude}°N, {longitude}°E
                  </p>
                  <p>
                    <strong>Date:</strong> {new Date(date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Time Zone:</strong> {timeZone}
                  </p>
                  <p>
                    <strong>Method:</strong> {methods[method].label} (Fajr: {methods[method].fajrAngle}°, Isha:{" "}
                    {methods[method].ishaAngle === 90 ? "90 min" : `${methods[method].ishaAngle}°`})
                  </p>
                  <p>
                    <strong>Asr Method:</strong> {asrMethod}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Section */}
          {error && !isLoading && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features & Notes */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features & Notes</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Calculates Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha times</li>
              <li>Multiple calculation methods and Asr options (Shafi'i/Hanafi)</li>
              <li>Geolocation support with browser permission</li>
              <li>Time zone selection with auto-detection</li>
              <li>Simplified algorithm; consider adhan-js for production use</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerTimeCalculator;