'use client'
import React, { useState } from 'react';

const SalaryCalculator = () => {
  const [mode, setMode] = useState('hourlyToAnnual'); // hourlyToAnnual, annualToHourly
  const [hourlyRate, setHourlyRate] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('40');
  const [annualSalary, setAnnualSalary] = useState('');
  const [taxRate, setTaxRate] = useState(''); // Percentage
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Constants
  const WEEKS_PER_YEAR = 52;

  // Calculate salary based on mode
  const calculateSalary = () => {
    setError('');
    setResult(null);

    const hourlyNum = parseFloat(hourlyRate);
    const hoursNum = parseFloat(hoursPerWeek);
    const annualNum = parseFloat(annualSalary);
    const taxNum = parseFloat(taxRate) || 0;

    if (taxNum < 0 || taxNum > 100) {
      return { error: 'Tax rate must be between 0 and 100%' };
    }

    if (mode === 'hourlyToAnnual') {
      if (isNaN(hourlyNum) || isNaN(hoursNum)) {
        return { error: 'Please enter valid hourly rate and hours per week' };
      }
      if (hourlyNum < 0 || hoursNum <= 0) {
        return { error: 'Hourly rate must be non-negative, hours per week must be positive' };
      }

      const weeklyGross = hourlyNum * hoursNum;
      const annualGross = weeklyGross * WEEKS_PER_YEAR;
      const monthlyGross = annualGross / 12;
      const taxAmount = annualGross * (taxNum / 100);
      const annualNet = annualGross - taxAmount;
      const monthlyNet = annualNet / 12;

      return {
        hourlyRate: hourlyNum.toFixed(2),
        hoursPerWeek: hoursNum.toFixed(1),
        weeklyGross: weeklyGross.toFixed(2),
        monthlyGross: monthlyGross.toFixed(2),
        annualGross: annualGross.toFixed(2),
        taxRate: taxNum.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        monthlyNet: monthlyNet.toFixed(2),
        annualNet: annualNet.toFixed(2),
        type: 'hourlyToAnnual'
      };
    } else if (mode === 'annualToHourly') {
      if (isNaN(annualNum) || isNaN(hoursNum)) {
        return { error: 'Please enter valid annual salary and hours per week' };
      }
      if (annualNum < 0 || hoursNum <= 0) {
        return { error: 'Annual salary must be non-negative, hours per week must be positive' };
      }

      const weeklyGross = annualNum / WEEKS_PER_YEAR;
      const hourlyRateCalc = weeklyGross / hoursNum;
      const monthlyGross = annualNum / 12;
      const taxAmount = annualNum * (taxNum / 100);
      const annualNet = annualNum - taxAmount;
      const monthlyNet = annualNet / 12;

      return {
        hourlyRate: hourlyRateCalc.toFixed(2),
        hoursPerWeek: hoursNum.toFixed(1),
        weeklyGross: weeklyGross.toFixed(2),
        monthlyGross: monthlyGross.toFixed(2),
        annualGross: annualNum.toFixed(2),
        taxRate: taxNum.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        monthlyNet: monthlyNet.toFixed(2),
        annualNet: annualNet.toFixed(2),
        type: 'annualToHourly'
      };
    }
    return null;
  };

  const calculate = () => {
    if ((mode === 'hourlyToAnnual' && (!hourlyRate || !hoursPerWeek)) ||
        (mode === 'annualToHourly' && (!annualSalary || !hoursPerWeek))) {
      setError('Please fill in all required fields');
      return;
    }

    const calcResult = calculateSalary();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
  };

  const reset = () => {
    setMode('hourlyToAnnual');
    setHourlyRate('');
    setHoursPerWeek('40');
    setAnnualSalary('');
    setTaxRate('');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Salary Calculator
        </h1>

        {/* Mode Selection */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setMode('hourlyToAnnual')}
            className={`px-3 py-1 rounded-lg ${mode === 'hourlyToAnnual' ? 'bg-orange-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Hourly to Annual
          </button>
          <button
            onClick={() => setMode('annualToHourly')}
            className={`px-3 py-1 rounded-lg ${mode === 'annualToHourly' ? 'bg-orange-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Annual to Hourly
          </button>
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            {mode === 'hourlyToAnnual' && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Hourly Rate ($):</label>
                <input
                  type="number"
                  step="0.01"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 20"
                />
              </div>
            )}
            {(mode === 'hourlyToAnnual' || mode === 'annualToHourly') && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Hours/Week:</label>
                <input
                  type="number"
                  step="0.1"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 40"
                />
              </div>
            )}
            {mode === 'annualToHourly' && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Annual Salary ($):</label>
                <input
                  type="number"
                  step="0.01"
                  value={annualSalary}
                  onChange={(e) => setAnnualSalary(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 41600"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Tax Rate (%):</label>
              <input
                type="number"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., 20 (optional)"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-all font-semibold"
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
          <div className="mt-6 p-4 bg-orange-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Salary Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center">Hourly Rate: ${result.hourlyRate}</p>
              <p className="text-center">Weekly Gross: ${result.weeklyGross}</p>
              <p className="text-center">Monthly Gross: ${result.monthlyGross}</p>
              <p className="text-center">Annual Gross: ${result.annualGross}</p>
              {result.taxRate > 0 && (
                <>
                  <p className="text-center">Tax Amount: ${result.taxAmount}</p>
                  <p className="text-center">Monthly Net: ${result.monthlyNet}</p>
                  <p className="text-center">Annual Net: ${result.annualNet}</p>
                </>
              )}

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-orange-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    <li>Hours per Week: {result.hoursPerWeek}</li>
                    {result.type === 'hourlyToAnnual' && (
                      <>
                        <li>Hourly Rate: ${result.hourlyRate}</li>
                        <li>Weekly Gross = Hourly × Hours = {result.hourlyRate} × {result.hoursPerWeek} = ${result.weeklyGross}</li>
                        <li>Annual Gross = Weekly × {WEEKS_PER_YEAR} = {result.weeklyGross} × {WEEKS_PER_YEAR} = ${result.annualGross}</li>
                        <li>Monthly Gross = Annual / 12 = {result.annualGross} / 12 = ${result.monthlyGross}</li>
                      </>
                    )}
                    {result.type === 'annualToHourly' && (
                      <>
                        <li>Annual Gross: ${result.annualGross}</li>
                        <li>Weekly Gross = Annual / {WEEKS_PER_YEAR} = {result.annualGross} / {WEEKS_PER_YEAR} = ${result.weeklyGross}</li>
                        <li>Hourly Rate = Weekly / Hours = {result.weeklyGross} / {result.hoursPerWeek} = ${result.hourlyRate}</li>
                        <li>Monthly Gross = Annual / 12 = {result.annualGross} / 12 = ${result.monthlyGross}</li>
                      </>
                    )}
                    {result.taxRate > 0 && (
                      <>
                        <li>Tax Rate: {result.taxRate}%</li>
                        <li>Tax Amount = Annual Gross × (Tax Rate / 100) = {result.annualGross} × ({result.taxRate} / 100) = ${result.taxAmount}</li>
                        <li>Annual Net = Annual Gross - Tax = {result.annualGross} - {result.taxAmount} = ${result.annualNet}</li>
                        <li>Monthly Net = Annual Net / 12 = {result.annualNet} / 12 = ${result.monthlyNet}</li>
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

export default SalaryCalculator;