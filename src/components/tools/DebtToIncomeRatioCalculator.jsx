// components/DebtToIncomeRatioCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const DebtToIncomeRatioCalculator = () => {
  const [monthlyDebt, setMonthlyDebt] = useState({
    mortgage: 0,
    carLoan: 0,
    creditCard: 0,
    studentLoan: 0,
    other: 0
  });
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [dtiRatio, setDTIRatio] = useState(null);

  const calculateDTI = () => {
    const totalDebt = Object.values(monthlyDebt).reduce((sum, value) => sum + Number(value), 0);
    const income = Number(monthlyIncome);
    
    if (income > 0) {
      const ratio = (totalDebt / income) * 100;
      setDTIRatio(ratio.toFixed(2));
    } else {
      setDTIRatio(null);
    }
  };

  useEffect(() => {
    calculateDTI();
  }, [monthlyDebt, monthlyIncome]);

  const handleDebtChange = (field) => (e) => {
    setMonthlyDebt(prev => ({
      ...prev,
      [field]: e.target.value >= 0 ? Number(e.target.value) : 0
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Debt-to-Income Ratio Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Debt Inputs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Mortgage/Rent ($)
          </label>
          <input
            type="number"
            value={monthlyDebt.mortgage}
            onChange={handleDebtChange('mortgage')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Car Loan ($)
          </label>
          <input
            type="number"
            value={monthlyDebt.carLoan}
            onChange={handleDebtChange('carLoan')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Credit Card Payments ($)
          </label>
          <input
            type="number"
            value={monthlyDebt.creditCard}
            onChange={handleDebtChange('creditCard')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Student Loan ($)
          </label>
          <input
            type="number"
            value={monthlyDebt.studentLoan}
            onChange={handleDebtChange('studentLoan')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Other Monthly Debt ($)
          </label>
          <input
            type="number"
            value={monthlyDebt.other}
            onChange={handleDebtChange('other')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        {/* Income Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Income ($)
          </label>
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value >= 0 ? Number(e.target.value) : 0)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>
      </div>

      {dtiRatio !== null && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <h2 className="text-lg font-semibold mb-2">Your DTI Ratio</h2>
          <p className="text-3xl font-bold text-blue-600">{dtiRatio}%</p>
          <div className="mt-2 text-sm text-gray-600">
            {dtiRatio <= 36 ? (
              <p className="text-green-600">Good (≤ 36%): Lenders typically prefer this range</p>
            ) : dtiRatio <= 43 ? (
              <p className="text-yellow-600">Moderate (37-43%): May qualify for some loans</p>
            ) : (
              <p className="text-red-600">High ({`> 43%`}): May face lending restrictions</p>
            )}
          </div>
        </div>
      )}

      {!dtiRatio && monthlyIncome === 0 && (
        <p className="text-center text-gray-500">Enter your monthly income to calculate DTI</p>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: This calculator provides an estimate of your Debt-to-Income ratio. 
        Consult a financial advisor for a comprehensive assessment.
      </p>
    </div>
  );
};

export default DebtToIncomeRatioCalculator;