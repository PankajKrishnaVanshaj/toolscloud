// components/EmergencyFundCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const EmergencyFundCalculator = () => {
  const [monthlyExpenses, setMonthlyExpenses] = useState(2000);
  const [monthlyIncome, setMonthlyIncome] = useState(4000);
  const [monthsCoverage, setMonthsCoverage] = useState(6);
  const [emergencyFund, setEmergencyFund] = useState(null);

  const calculateEmergencyFund = () => {
    const totalFund = monthlyExpenses * monthsCoverage;
    const monthlySavingsNeeded = monthlyIncome > monthlyExpenses 
      ? (totalFund / 12) / (monthlyIncome - monthlyExpenses) * (monthlyIncome - monthlyExpenses)
      : 0; // Simplified savings rate
    
    setEmergencyFund({
      total: totalFund.toFixed(2),
      monthlySavings: monthlySavingsNeeded > 0 ? monthlySavingsNeeded.toFixed(2) : 'N/A',
    });
  };

  useEffect(() => {
    calculateEmergencyFund();
  }, [monthlyExpenses, monthlyIncome, monthsCoverage]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Emergency Fund Calculator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Expenses ($)
          </label>
          <input
            type="number"
            value={monthlyExpenses}
            onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Income ($)
          </label>
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Desired Coverage (months)
          </label>
          <input
            type="number"
            value={monthsCoverage}
            onChange={(e) => setMonthsCoverage(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="1"
            max="24"
          />
        </div>
      </div>

      {emergencyFund && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2 text-center">Your Emergency Fund</h2>
          <div className="space-y-2 text-center">
            <p>
              Total Amount Needed:
              <span className="font-bold text-green-600 ml-2">
                ${Number(emergencyFund.total).toLocaleString()}
              </span>
            </p>
            <p>
              Monthly Savings Needed (over 1 year):
              <span className="font-medium ml-2">
                {emergencyFund.monthlySavings === 'N/A' 
                  ? 'Income too low to save' 
                  : `$${Number(emergencyFund.monthlySavings).toLocaleString()}`}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Based on covering {monthsCoverage} months of expenses
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: This is a basic calculation. Consider factors like irregular income, 
        existing savings, and specific financial goals. Consult a financial advisor 
        for personalized advice.
      </p>
    </div>
  );
};

export default EmergencyFundCalculator;