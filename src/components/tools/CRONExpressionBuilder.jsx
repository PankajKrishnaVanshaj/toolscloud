"use client";

import React, { useState } from 'react';

const CRONExpressionBuilder = () => {
  const [minute, setMinute] = useState('*');
  const [hour, setHour] = useState('*');
  const [day, setDay] = useState('*');
  const [month, setMonth] = useState('*');
  const [weekday, setWeekday] = useState('*');
  const [specificMinute, setSpecificMinute] = useState('0');
  const [specificHour, setSpecificHour] = useState('0');
  const [specificDay, setSpecificDay] = useState('1');
  const [specificMonth, setSpecificMonth] = useState('1');
  const [specificWeekday, setSpecificWeekday] = useState('0');
  const [copied, setCopied] = useState(false);

  const generateCRON = () => {
    const parts = [
      minute === 'specific' ? specificMinute : minute,
      hour === 'specific' ? specificHour : hour,
      day === 'specific' ? specificDay : day,
      month === 'specific' ? specificMonth : month,
      weekday === 'specific' ? specificWeekday : weekday
    ];
    return parts.join(' ');
  };

  const getScheduleDescription = () => {
    const cron = generateCRON();
    if (cron === '* * * * *') return 'Runs every minute';
    let desc = 'Runs ';
    
    if (minute === 'specific') desc += `at minute ${specificMinute} `;
    else desc += 'every minute ';
    
    if (hour === 'specific') desc += `of hour ${specificHour} `;
    else desc += 'of every hour ';
    
    if (day === 'specific') desc += `on day ${specificDay} `;
    else desc += 'every day ';
    
    if (month === 'specific') desc += `of month ${specificMonth} `;
    else desc += 'of every month ';
    
    if (weekday === 'specific') desc += `on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][specificWeekday]}`;
    else desc += 'every day of the week';

    return desc;
  };

  const handleCopy = () => {
    const cron = generateCRON();
    navigator.clipboard.writeText(cron);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">CRON Expression Builder</h2>

        {/* CRON Fields */}
        <div className="space-y-6">
          {/* Minute */}
          <div className="flex gap-4 items-center">
            <label className="w-24 text-sm font-medium text-gray-700">Minute</label>
            <select
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="*">Every minute (*)</option>
              <option value="specific">Specific minute</option>
            </select>
            {minute === 'specific' && (
              <input
                type="number"
                value={specificMinute}
                onChange={(e) => setSpecificMinute(Math.max(0, Math.min(59, e.target.value)))}
                className="w-20 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="59"
              />
            )}
          </div>

          {/* Hour */}
          <div className="flex gap-4 items-center">
            <label className="w-24 text-sm font-medium text-gray-700">Hour</label>
            <select
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="*">Every hour (*)</option>
              <option value="specific">Specific hour</option>
            </select>
            {hour === 'specific' && (
              <input
                type="number"
                value={specificHour}
                onChange={(e) => setSpecificHour(Math.max(0, Math.min(23, e.target.value)))}
                className="w-20 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="23"
              />
            )}
          </div>

          {/* Day of Month */}
          <div className="flex gap-4 items-center">
            <label className="w-24 text-sm font-medium text-gray-700">Day</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="*">Every day (*)</option>
              <option value="specific">Specific day</option>
            </select>
            {day === 'specific' && (
              <input
                type="number"
                value={specificDay}
                onChange={(e) => setSpecificDay(Math.max(1, Math.min(31, e.target.value)))}
                className="w-20 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="31"
              />
            )}
          </div>

          {/* Month */}
          <div className="flex gap-4 items-center">
            <label className="w-24 text-sm font-medium text-gray-700">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="*">Every month (*)</option>
              <option value="specific">Specific month</option>
            </select>
            {month === 'specific' && (
              <input
                type="number"
                value={specificMonth}
                onChange={(e) => setSpecificMonth(Math.max(1, Math.min(12, e.target.value)))}
                className="w-20 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="12"
              />
            )}
          </div>

          {/* Day of Week */}
          <div className="flex gap-4 items-center">
            <label className="w-24 text-sm font-medium text-gray-700">Weekday</label>
            <select
              value={weekday}
              onChange={(e) => setWeekday(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="*">Every weekday (*)</option>
              <option value="specific">Specific weekday</option>
            </select>
            {weekday === 'specific' && (
              <select
                value={specificWeekday}
                onChange={(e) => setSpecificWeekday(e.target.value)}
                className="w-32 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
              </select>
            )}
          </div>
        </div>

        {/* Generated CRON Expression */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700">CRON Expression</h3>
            <button
              onClick={handleCopy}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800">
            {generateCRON()}
          </pre>
          <p className="mt-2 text-sm text-gray-600">
            {getScheduleDescription()}
          </p>
        </div>

        {/* Examples */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-2">Examples</h3>
          <ul className="text-sm text-gray-600 list-disc pl-5">
            <li><code>0 0 * * *</code> - Runs at midnight every day</li>
            <li><code>0 12 * * 1</code> - Runs at noon every Monday</li>
            <li><code>*/15 * * * *</code> - Runs every 15 minutes</li>
            <li><code>0 9 1 * *</code> - Runs at 9 AM on the 1st of every month</li>
          </ul>
          <p className="mt-2 text-sm text-gray-600">
            Note: This tool generates standard 5-field CRON expressions (minute, hour, day, month, weekday).
          </p>
        </div>
      </div>
    </div>
  );
};

export default CRONExpressionBuilder;