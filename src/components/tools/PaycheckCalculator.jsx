// components/PaycheckCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const PaycheckCalculator = () => {
  const [payType, setPayType] = useState('hourly'); // 'hourly' or 'salary'
  const [hourlyRate, setHourlyRate] = useState(15);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [annualSalary, setAnnualSalary] = useState(30000);
  const [payFrequency, setPayFrequency] = useState('biweekly'); // 'weekly', 'biweekly', 'monthly'
  const [federalTax, setFederalTax] = useState(10); // Percentage
  const [stateTax, setStateTax] = useState(5); // Percentage
  const [otherDeductions, setOtherDeductions] = useState(0); // Flat amount
  const [results, setResults] = useState(null);

  const calculatePaycheck = () => {
    let grossPayPerPeriod;

    // Calculate gross pay based on pay type
    if (payType === 'hourly') {
      const weeklyGross = hourlyRate * hoursPerWeek;
      if (payFrequency === 'weekly') {
        grossPayPerPeriod = weeklyGross;
      } else if (payFrequency === 'biweekly') {
        grossPayPerPeriod = weeklyGross * 2;
      } else if (payFrequency === 'monthly') {
        grossPayPerPeriod = (weeklyGross * 52) / 12;
      }
    } else {
      // Salary
      if (payFrequency === 'weekly') {
        grossPayPerPeriod = annualSalary / 52;
      } else if (payFrequency === 'biweekly') {
        grossPayPerPeriod = annualSalary / 26;
      } else if (payFrequency === 'monthly') {
        grossPayPerPeriod = annualSalary / 12;
      }
    }

    // Calculate deductions
    const federalTaxAmount = grossPayPerPeriod * (federalTax / 100);
    const stateTaxAmount = grossPayPerPeriod * (stateTax / 100);
    const totalDeductions = federalTaxAmount + stateTaxAmount + Number(otherDeductions);
    const netPay = grossPayPerPeriod - totalDeductions;

    setResults({
      grossPay: grossPayPerPeriod.toFixed(2),
      federalTax: federalTaxAmount.toFixed(2),
      stateTax: stateTaxAmount.toFixed(2),
      otherDeductions: Number(otherDeductions).toFixed(2),
      netPay: netPay.toFixed(2),
    });
  };

  useEffect(() => {
    calculatePaycheck();
  }, [payType, hourlyRate, hoursPerWeek, annualSalary, payFrequency, federalTax, stateTax, otherDeductions]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Paycheck Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Pay Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pay Type</label>
          <select
            value={payType}
            onChange={(e) => setPayType(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="hourly">Hourly</option>
            <option value="salary">Salary</option>
          </select>
        </div>

        {/* Pay Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pay Frequency</label>
          <select
            value={payFrequency}
            onChange={(e) => setPayFrequency(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Hourly Inputs */}
        {payType === 'hourly' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours/Week</label>
              <input
                type="number"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min="0"
                max="168"
              />
            </div>
          </>
        )}

        {/* Salary Input */}
        {payType === 'salary' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Annual Salary ($)</label>
            <input
              type="number"
              value={annualSalary}
              onChange={(e) => setAnnualSalary(Number(e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="100"
            />
          </div>
        )}

        {/* Tax and Deductions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Federal Tax Rate (%)</label>
          <input
            type="number"
            value={federalTax}
            onChange={(e) => setFederalTax(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            max="100"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State Tax Rate (%)</label>
          <input
            type="number"
            value={stateTax}
            onChange={(e) => setStateTax(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            max="100"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Other Deductions ($)</label>
          <input
            type="number"
            value={otherDeductions}
            onChange={(e) => setOtherDeductions(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="1"
          />
        </div>
      </div>

      {results && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Paycheck Results</h2>
          <div className="space-y-2">
            <p>Gross Pay ({payFrequency}): <span className="font-bold">${Number(results.grossPay).toLocaleString()}</span></p>
            <p>Federal Tax: <span className="font-medium">${Number(results.federalTax).toLocaleString()}</span></p>
            <p>State Tax: <span className="font-medium">${Number(results.stateTax).toLocaleString()}</span></p>
            <p>Other Deductions: <span className="font-medium">${Number(results.otherDeductions).toLocaleString()}</span></p>
            <p className="text-lg">Net Pay: <span className="font-bold text-green-600">${Number(results.netPay).toLocaleString()}</span></p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: This is a simplified calculator. Actual take-home pay may vary due to additional taxes, benefits, or local regulations.
      </p>
    </div>
  );
};

export default PaycheckCalculator;