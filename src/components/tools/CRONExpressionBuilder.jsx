"use client";

import React, { useState, useCallback } from 'react';
import { FaCopy, FaDownload, FaSync, FaInfoCircle } from 'react-icons/fa';

const CRONExpressionBuilder = () => {
  const [cronFields, setCronFields] = useState({
    minute: '*',
    hour: '*',
    day: '*',
    month: '*',
    weekday: '*',
  });
  const [specificValues, setSpecificValues] = useState({
    minute: '0',
    hour: '0',
    day: '1',
    month: '1',
    weekday: '0',
    intervalMinute: '5',
    intervalHour: '1',
  });
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const generateCRON = useCallback(() => {
    const { minute, hour, day, month, weekday } = cronFields;
    const { specificMinute, specificHour, specificDay, specificMonth, specificWeekday, intervalMinute, intervalHour } = specificValues;
    const parts = [
      minute === 'specific' ? specificMinute : minute === 'interval' ? `*/${intervalMinute}` : minute,
      hour === 'specific' ? specificHour : hour === 'interval' ? `*/${intervalHour}` : hour,
      day === 'specific' ? specificDay : day,
      month === 'specific' ? specificMonth : month,
      weekday === 'specific' ? specificWeekday : weekday,
    ];
    return parts.join(' ');
  }, [cronFields, specificValues]);

  const getScheduleDescription = () => {
    const cron = generateCRON();
    if (cron === '* * * * *') return 'Runs every minute';
    let desc = 'Runs ';

    const { minute, hour, day, month, weekday } = cronFields;
    const { specificMinute, specificHour, specificDay, specificMonth, specificWeekday, intervalMinute, intervalHour } = specificValues;

    desc += minute === 'specific' ? `at minute ${specificMinute} ` : minute === 'interval' ? `every ${intervalMinute} minutes ` : 'every minute ';
    desc += hour === 'specific' ? `of hour ${specificHour} ` : hour === 'interval' ? `every ${intervalHour} hours ` : 'of every hour ';
    desc += day === 'specific' ? `on day ${specificDay} ` : 'every day ';
    desc += month === 'specific' ? `of month ${specificMonth} ` : 'of every month ';
    desc += weekday === 'specific' ? `on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][specificWeekday]}` : 'every day of the week';

    return desc;
  };

  const handleCopy = () => {
    const cron = generateCRON();
    navigator.clipboard.writeText(cron);
    setCopied(true);
    setHistory(prev => [cron, ...prev].slice(0, 5));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const cron = generateCRON();
    const blob = new Blob([cron], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cron-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setCronFields({ minute: '*', hour: '*', day: '*', month: '*', weekday: '*' });
    setSpecificValues({ minute: '0', hour: '0', day: '1', month: '1', weekday: '0', intervalMinute: '5', intervalHour: '1' });
  };

  const FieldInput = ({ label, field, options }) => (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <label className="w-24 text-sm font-medium text-gray-700">{label}</label>
      <select
        value={cronFields[field]}
        onChange={(e) => setCronFields(prev => ({ ...prev, [field]: e.target.value }))}
        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      >
        {options.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      {cronFields[field] === 'specific' && (
        <input
          type="number"
          value={specificValues[field]}
          onChange={(e) => {
            const val = e.target.value;
            const constraints = {
              minute: [0, 59],
              hour: [0, 23],
              day: [1, 31],
              month: [1, 12],
              weekday: [0, 6],
            };
            setSpecificValues(prev => ({
              ...prev,
              [field]: Math.max(constraints[field][0], Math.min(constraints[field][1], val))
            }));
          }}
          className="w-20 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          min={field === 'day' || field === 'month' ? 1 : 0}
          max={{ minute: 59, hour: 23, day: 31, month: 12, weekday: 6 }[field]}
        />
      )}
      {cronFields[field] === 'interval' && (field === 'minute' || field === 'hour') && (
        <input
          type="number"
          value={specificValues[field === 'minute' ? 'intervalMinute' : 'intervalHour']}
          onChange={(e) => {
            const val = Math.max(1, Math.min(field === 'minute' ? 59 : 23, e.target.value));
            setSpecificValues(prev => ({ ...prev, [field === 'minute' ? 'intervalMinute' : 'intervalHour']: val }));
          }}
          className="w-20 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="1"
          max={field === 'minute' ? 59 : 23}
        />
      )}
      {field === 'weekday' && cronFields[field] === 'specific' && (
        <select
          value={specificValues.weekday}
          onChange={(e) => setSpecificValues(prev => ({ ...prev, weekday: e.target.value }))}
          className="w-32 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => (
            <option key={i} value={i}>{day}</option>
          ))}
        </select>
      )}
    </div>
  );

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">CRON Expression Builder</h2>

        {/* CRON Fields */}
        <div className="space-y-6">
          <FieldInput
            label="Minute"
            field="minute"
            options={[
              { value: '*', label: 'Every minute (*)' },
              { value: 'specific', label: 'Specific minute' },
              { value: 'interval', label: 'Every X minutes (*/X)' },
            ]}
          />
          <FieldInput
            label="Hour"
            field="hour"
            options={[
              { value: '*', label: 'Every hour (*)' },
              { value: 'specific', label: 'Specific hour' },
              { value: 'interval', label: 'Every X hours (*/X)' },
            ]}
          />
          <FieldInput
            label="Day"
            field="day"
            options={[
              { value: '*', label: 'Every day (*)' },
              { value: 'specific', label: 'Specific day' },
            ]}
          />
          <FieldInput
            label="Month"
            field="month"
            options={[
              { value: '*', label: 'Every month (*)' },
              { value: 'specific', label: 'Specific month' },
            ]}
          />
          <FieldInput
            label="Weekday"
            field="weekday"
            options={[
              { value: '*', label: 'Every weekday (*)' },
              { value: 'specific', label: 'Specific weekday' },
            ]}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={handleCopy}
            className={`flex-1 py-2 px-4 rounded-lg text-white transition-colors ${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} flex items-center justify-center`}
          >
            <FaCopy className="mr-2" /> {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download
          </button>
          <button
            onClick={resetForm}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Generated CRON Expression */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">CRON Expression</h3>
          <pre className="p-4 bg-white rounded-md text-sm font-mono text-gray-800 border border-gray-200">
            {generateCRON()}
          </pre>
          <p className="mt-2 text-sm text-gray-600">{getScheduleDescription()}</p>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Recent Expressions (Last 5)</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              {history.map((expr, index) => (
                <li key={index} className="p-2 bg-white rounded-md">{expr}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Examples and Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
            <FaInfoCircle className="mr-2" /> Examples & Info
          </h3>
          <ul className="text-sm text-blue-600 list-disc pl-5 space-y-1">
            <li><code>0 0 * * *</code> - Midnight every day</li>
            <li><code>0 12 * * 1</code> - Noon every Monday</li>
            <li><code>*/15 * * * *</code> - Every 15 minutes</li>
            <li><code>0 9 1 * *</code> - 9 AM on the 1st of every month</li>
          </ul>
          <p className="mt-2 text-sm text-blue-600">
            Supports standard 5-field CRON (minute, hour, day, month, weekday). Use '*' for all, specific values, or intervals (*/X).
          </p>
        </div>
      </div>
    </div>
  );
};

export default CRONExpressionBuilder;