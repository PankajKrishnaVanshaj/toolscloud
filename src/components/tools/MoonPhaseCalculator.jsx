"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync } from "react-icons/fa";

const MoonPhaseCalculator = () => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [phase, setPhase] = useState(null);
  const [illumination, setIllumination] = useState(0);
  const [age, setAge] = useState(0);
  const [nextNewMoon, setNextNewMoon] = useState(null);
  const [nextFullMoon, setNextFullMoon] = useState(null);
  const [showRealTime, setShowRealTime] = useState(false);
  const [moonRiseSet, setMoonRiseSet] = useState({ rise: null, set: null });

  const referenceNewMoon = new Date("2000-01-06T00:00:00Z");
  const synodicMonth = 29.530588853;

  const calculateMoonPhase = useCallback((inputDate) => {
    const dateObj = new Date(inputDate);
    const diffMs = dateObj - referenceNewMoon;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const cycles = diffDays / synodicMonth;
    const ageDays = (cycles - Math.floor(cycles)) * synodicMonth;

    let phaseAngle = (ageDays / synodicMonth) * 360;
    if (phaseAngle > 360) phaseAngle -= 360;

    const illuminationFraction = (1 - Math.cos(phaseAngle * Math.PI / 180)) / 2;
    const illuminationPercent = illuminationFraction * 100;

    let phaseName;
    if (ageDays < 1.84566) phaseName = "New Moon";
    else if (ageDays < 5.53699) phaseName = "Waxing Crescent";
    else if (ageDays < 9.22831) phaseName = "First Quarter";
    else if (ageDays < 12.91963) phaseName = "Waxing Gibbous";
    else if (ageDays < 16.61096) phaseName = "Full Moon";
    else if (ageDays < 20.30228) phaseName = "Waning Gibbous";
    else if (ageDays < 23.99361) phaseName = "Last Quarter";
    else if (ageDays < 27.68493) phaseName = "Waning Crescent";
    else phaseName = "New Moon";

    const nextNewMoonDays = synodicMonth - ageDays;
    const nextNewMoonDate = new Date(dateObj.getTime() + nextNewMoonDays * 24 * 60 * 60 * 1000);
    const nextFullMoonDays =
      ageDays < synodicMonth / 2 ? synodicMonth / 2 - ageDays : synodicMonth - ageDays + synodicMonth / 2;
    const nextFullMoonDate = new Date(dateObj.getTime() + nextFullMoonDays * 24 * 60 * 60 * 1000);

    // Simulated moon rise/set times (simplified)
    const riseHour = 6 + (ageDays / synodicMonth) * 12;
    const setHour = riseHour + 12;
    const riseTime = new Date(dateObj).setHours(riseHour, 0, 0, 0);
    const setTime = new Date(dateObj).setHours(setHour, 0, 0, 0);

    return {
      phaseName,
      illumination: illuminationPercent,
      age: ageDays,
      nextNewMoon: nextNewMoonDate,
      nextFullMoon: nextFullMoonDate,
      moonRise: new Date(riseTime).toLocaleTimeString(),
      moonSet: new Date(setTime).toLocaleTimeString(),
    };
  }, []);

  const updatePhase = useCallback(() => {
    const result = calculateMoonPhase(showRealTime ? new Date() : date);
    setPhase(result.phaseName);
    setIllumination(result.illumination);
    setAge(result.age);
    setNextNewMoon(result.nextNewMoon.toISOString().slice(0, 10));
    setNextFullMoon(result.nextFullMoon.toISOString().slice(0, 10));
    setMoonRiseSet({ rise: result.moonRise, set: result.moonSet });
  }, [date, showRealTime, calculateMoonPhase]);

  useEffect(() => {
    updatePhase();
    if (showRealTime) {
      const interval = setInterval(updatePhase, 1000);
      return () => clearInterval(interval);
    }
  }, [updatePhase, showRealTime]);

  const handleNow = () => {
    setDate(new Date().toISOString().slice(0, 10));
    setShowRealTime(false);
  };

  const reset = () => {
    setDate(new Date().toISOString().slice(0, 10));
    setLatitude(0);
    setLongitude(0);
    setShowRealTime(false);
    updatePhase();
  };

  const getMoonVisual = () => {
    const size = 150;
    const illuminationAngle = (illumination / 100) * Math.PI;
    const isWaxing = age < synodicMonth / 2;

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
        <circle cx={size / 2} cy={size / 2} r={size / 2} fill="#e5e7eb" />
        <path
          d={`M ${size / 2} 0 A ${size / 2} ${size / 2} 0 0 ${isWaxing ? 0 : 1} ${size / 2} ${size}
              A ${size / 2 * Math.abs(Math.cos(illuminationAngle))} ${size / 2} 0 0 ${isWaxing ? 1 : 0} ${size / 2} 0 Z`}
          fill="#1f2937"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Moon Phase Calculator
        </h1>

        {/* Input Section */}
        <div className="grid gap-6">
          <div className="grid gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setShowRealTime(false);
                    }}
                    disabled={showRealTime}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
                  />
                  <button
                    onClick={handleNow}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Now
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude (-90 to 90)
                </label>
                <input
                  type="number"
                  value={latitude}
                  onChange={(e) => setLatitude(Math.max(-90, Math.min(90, e.target.value)))}
                  min="-90"
                  max="90"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude (-180 to 180)
                </label>
                <input
                  type="number"
                  value={longitude}
                  onChange={(e) => setLongitude(Math.max(-180, Math.min(180, e.target.value)))}
                  min="-180"
                  max="180"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showRealTime}
                  onChange={(e) => setShowRealTime(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Real-time Updates
                </span>
              </label>
              <button
                onClick={reset}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Results Section */}
          {phase && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                Moon Phase Results
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex justify-center">{getMoonVisual()}</div>
                <div className="grid gap-2 text-sm text-gray-700">
                  <p><span className="font-medium">Phase:</span> {phase}</p>
                  <p><span className="font-medium">Illumination:</span> {illumination.toFixed(2)}%</p>
                  <p><span className="font-medium">Age:</span> {age.toFixed(2)} days</p>
                  <p><span className="font-medium">Next New Moon:</span> {nextNewMoon}</p>
                  <p><span className="font-medium">Next Full Moon:</span> {nextFullMoon}</p>
                  <p><span className="font-medium">Moonrise:</span> {moonRiseSet.rise}</p>
                  <p><span className="font-medium">Moonset:</span> {moonRiseSet.set}</p>
                  <p><span className="font-medium">Location:</span> Lat {latitude}°, Lon {longitude}°</p>
                </div>
              </div>
            </div>
          )}

          {/* Features & Notes */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">
              Features & Notes
            </h3>
            <ul className="list-disc list-inside text-sm text-blue-600">
              <li>Calculates moon phase using synodic month (29.53 days)</li>
              <li>Dynamic SVG moon visualization</li>
              <li>Real-time updates with toggle</li>
              <li>Next New and Full Moon predictions</li>
              <li>Approximate moonrise/moonset times (simulated)</li>
              <li>Location input (future: visibility calculation)</li>
              <li>Reference: New Moon on 2000-01-06</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoonPhaseCalculator;