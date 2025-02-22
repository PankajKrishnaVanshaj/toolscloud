'use client'
import React, { useState } from 'react';

const TimeCalculator = () => {
  const [time1, setTime1] = useState(''); // Format: HH:MM (24-hour)
  const [time2, setTime2] = useState(''); // Format: HH:MM (24-hour)
  const [operation, setOperation] = useState('difference'); // difference, addDuration, subtractDuration
  const [durationHours, setDurationHours] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Parse time string (HH:MM) to minutes since midnight
  const parseTimeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }
    return hours * 60 + minutes;
  };

  // Convert minutes to time string (HH:MM)
  const minutesToTime = (minutes) => {
    const totalMinutes = ((minutes % 1440) + 1440) % 1440; // Handle negative and wrap around 24 hours
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Calculate time based on operation
  const calculateTime = () => {
    setError('');
    setResult(null);

    const time1Minutes = time1 ? parseTimeToMinutes(time1) : null;
    const time2Minutes = time2 ? parseTimeToMinutes(time2) : null;
    const durHoursNum = parseInt(durationHours) || 0;
    const durMinsNum = parseInt(durationMinutes) || 0;

    if (operation === 'difference') {
      if (time1Minutes === null || time2Minutes === null) {
        return { error: 'Please enter valid times in HH:MM format (e.g., 14:30)' };
      }
      let diffMinutes = time2Minutes - time1Minutes;
      if (diffMinutes < 0) diffMinutes += 1440; // Handle crossing midnight
      const diffHours = Math.floor(diffMinutes / 60);
      const diffMins = diffMinutes % 60;
      const totalHours = (diffMinutes / 60).toFixed(2);

      return {
        time1,
        time2,
        diffHours,
        diffMinutes: diffMins,
        totalMinutes: diffMinutes,
        totalHours,
        type: 'difference'
      };
    } else if (operation === 'addDuration' || operation === 'subtractDuration') {
      if (time1Minutes === null) {
        return { error: 'Please enter a valid start time in HH:MM format (e.g., 14:30)' };
      }
      if (durHoursNum < 0 || durMinsNum < 0 || durMinsNum > 59) {
        return { error: 'Duration hours must be non-negative, minutes must be 0-59' };
      }

      const durationMinutes = durHoursNum * 60 + durMinsNum;
      const startMinutes = time1Minutes;
      const endMinutes = operation === 'addDuration'
        ? startMinutes + durationMinutes
        : startMinutes - durationMinutes;
      const endTime = minutesToTime(endMinutes);

      return {
        time1,
        durationHours: durHoursNum,
        durationMinutes: durMinsNum,
        endTime,
        totalMinutes: operation === 'addDuration' ? durationMinutes : -durationMinutes,
        type: operation
      };
    }
    return null;
  };

  const calculate = () => {
    if ((operation === 'difference' && (!time1 || !time2)) ||
        ((operation === 'addDuration' || operation === 'subtractDuration') && !time1)) {
      setError('Please fill in all required time fields');
      return;
    }

    const calcResult = calculateTime();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
  };

  const reset = () => {
    setTime1('');
    setTime2('');
    setOperation('difference');
    setDurationHours('');
    setDurationMinutes('');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Time Calculator
        </h1>

        {/* Operation Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => setOperation('difference')}
            className={`px-3 py-1 rounded-lg ${operation === 'difference' ? 'bg-lime-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Time Difference
          </button>
          <button
            onClick={() => setOperation('addDuration')}
            className={`px-3 py-1 rounded-lg ${operation === 'addDuration' ? 'bg-lime-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Add Duration
          </button>
          <button
            onClick={() => setOperation('subtractDuration')}
            className={`px-3 py-1 rounded-lg ${operation === 'subtractDuration' ? 'bg-lime-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Subtract Duration
          </button>
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Start Time (HH:MM):</label>
              <input
                type="text"
                value={time1}
                onChange={(e) => setTime1(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                placeholder="e.g., 09:00"
              />
            </div>
            {operation === 'difference' && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">End Time (HH:MM):</label>
                <input
                  type="text"
                  value={time2}
                  onChange={(e) => setTime2(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                  placeholder="e.g., 17:00"
                />
              </div>
            )}
            {(operation === 'addDuration' || operation === 'subtractDuration') && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Duration:</label>
                <input
                  type="number"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="w-20 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                  placeholder="Hours"
                  min="0"
                />
                <span className="text-gray-700">h</span>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-20 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                  placeholder="Mins"
                  min="0"
                  max="59"
                />
                <span className="text-gray-700">m</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-lime-600 text-white py-2 rounded-lg hover:bg-lime-700 transition-all font-semibold"
            >
              Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all font-semibold"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-lime-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Time Results:</h2>
            <div className="mt-2 space-y-2">
              {result.type === 'difference' && (
                <>
                  <p className="text-center text-xl">
                    Difference: {result.diffHours}h {result.diffMinutes}m
                  </p>
                  <p className="text-center">Total Hours: {result.totalHours}</p>
                  <p className="text-center">Total Minutes: {result.totalMinutes}</p>
                </>
              )}
              {(result.type === 'addDuration' || result.type === 'subtractDuration') && (
                <p className="text-center text-xl">
                  Result: {result.endTime}
                </p>
              )}

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-lime-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    {result.type === 'difference' && (
                      <>
                        <li>Start Time: {result.time1}</li>
                        <li>End Time: {result.time2}</li>
                        <li>Time1 in Minutes: {parseTimeToMinutes(result.time1)}</li>
                        <li>Time2 in Minutes: {parseTimeToMinutes(result.time2)}</li>
                        <li>Total Minutes = Time2 - Time1{parseTimeToMinutes(result.time2) < parseTimeToMinutes(result.time1) ? ' + 1440' : ''} = {result.totalMinutes}</li>
                        <li>Hours = Total Minutes / 60 = {result.diffHours}</li>
                        <li>Remaining Minutes = Total Minutes % 60 = {result.diffMinutes}</li>
                        <li>Total Hours = Total Minutes / 60 = {result.totalHours}</li>
                      </>
                    )}
                    {(result.type === 'addDuration' || result.type === 'subtractDuration') && (
                      <>
                        <li>Start Time: {result.time1}</li>
                        <li>Start Minutes: {parseTimeToMinutes(result.time1)}</li>
                        <li>Duration: {result.durationHours}h {result.durationMinutes}m = {result.totalMinutes} minutes</li>
                        <li>End Minutes = Start {result.type === 'addDuration' ? '+' : '-'} Duration = {parseTimeToMinutes(result.time1)} {result.type === 'addDuration' ? '+' : '-'} {result.totalMinutes} = {parseTimeToMinutes(result.time1) + result.totalMinutes}</li>
                        <li>End Time = Converted to HH:MM = {result.endTime}</li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeCalculator;