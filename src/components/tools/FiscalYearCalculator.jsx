'use client';

import React, { useState } from 'react';

const FiscalYearCalculator = () => {
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [fiscalStartMonth, setFiscalStartMonth] = useState(4); // Default to April (1 = Jan, 12 = Dec)
  const [fiscalYearFormat, setFiscalYearFormat] = useState('single'); // 'single', 'split', 'custom'
  const [customFormat, setCustomFormat] = useState('FY{year}');
  const [result, setResult] = useState(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const calculateFiscalYear = () => {
    const date = new Date(startDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JS months are 0-based

    let fiscalYearStart, fiscalYearEnd, fiscalYear;
    if (month >= fiscalStartMonth) {
      fiscalYearStart = new Date(year, fiscalStartMonth - 1, 1);
      fiscalYearEnd = new Date(year + 1, fiscalStartMonth - 1, 0);
      fiscalYear = year;
    } else {
      fiscalYearStart = new Date(year - 1, fiscalStartMonth - 1, 1);
      fiscalYearEnd = new Date(year, fiscalStartMonth - 1, 0);
      fiscalYear = year - 1;
    }

    const fiscalQuarter = Math.ceil(((month - fiscalStartMonth + 12) % 12 + 1) / 3) || 4;

    let fiscalYearString;
    switch (fiscalYearFormat) {
      case 'single':
        fiscalYearString = `FY${fiscalYear + 1}`;
        break;
      case 'split':
        fiscalYearString = `FY${fiscalYear}-${(fiscalYear + 1) % 100}`;
        break;
      case 'custom':
        fiscalYearString = customFormat
          .replace('{year}', fiscalYear + 1)
          .replace('{startYear}', fiscalYear)
          .replace('{endYear}', fiscalYear + 1);
        break;
      default:
        fiscalYearString = `FY${fiscalYear + 1}`;
    }

    setResult({
      fiscalYear: fiscalYearString,
      startDate: fiscalYearStart.toISOString().slice(0, 10),
      endDate: fiscalYearEnd.toISOString().slice(0, 10),
      quarter: `Q${fiscalQuarter}`,
      daysInFiscalYear: Math.ceil((fiscalYearEnd - fiscalYearStart) / (1000 * 60 * 60 * 24)) + 1,
    });
  };

  const handleCalculate = () => {
    try {
      calculateFiscalYear();
    } catch (err) {
      setResult(null);
      console.error('Calculation error:', err);
    }
  };

  const handleExport = () => {
    if (!result) return;
    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fiscal_year_${startDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Fiscal Year Calculator
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fiscal Year Start Month
              </label>
              <select
                value={fiscalStartMonth}
                onChange={(e) => setFiscalStartMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fiscal Year Format
              </label>
              <select
                value={fiscalYearFormat}
                onChange={(e) => setFiscalYearFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="single">Single Year (e.g., FY2025)</option>
                <option value="split">Split Year (e.g., FY2024-25)</option>
                <option value="custom">Custom Format</option>
              </select>
            </div>

            {fiscalYearFormat === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Format
                </label>
                <input
                  type="text"
                  value={customFormat}
                  onChange={(e) => setCustomFormat(e.target.value)}
                  placeholder="e.g., FY{year}, {startYear}-{endYear}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {`{year}`} for end year, {`{startYear}`} for start year, {`{endYear}`} for end year
                </p>
              </div>
            )}

            <button
              onClick={handleCalculate}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Calculate
            </button>
          </div>

          {/* Results Section */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Fiscal Year Details:</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Fiscal Year:</span> {result.fiscalYear}</p>
                <p><span className="font-medium">Start Date:</span> {result.startDate}</p>
                <p><span className="font-medium">End Date:</span> {result.endDate}</p>
                <p><span className="font-medium">Quarter:</span> {result.quarter}</p>
                <p><span className="font-medium">Days in Fiscal Year:</span> {result.daysInFiscalYear}</p>
                <button
                  onClick={handleExport}
                  className="mt-2 px-4 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                >
                  Export as JSON
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Calculate fiscal year based on any start month</li>
              <li>Supports single year, split year, or custom formats</li>
              <li>Determines fiscal quarter</li>
              <li>Provides full date range and days count</li>
              <li>Export results as JSON</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default FiscalYearCalculator;