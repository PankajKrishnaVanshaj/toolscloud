// components/LeasePaymentCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const LeasePaymentCalculator = () => {
  const [vehiclePrice, setVehiclePrice] = useState(30000);
  const [downPayment, setDownPayment] = useState(3000);
  const [leaseTerm, setLeaseTerm] = useState(36);
  const [interestRate, setInterestRate] = useState(5);
  const [residualPercentage, setResidualPercentage] = useState(50);
  const [results, setResults] = useState(null);

  const calculateLease = () => {
    const principal = vehiclePrice - downPayment;
    const residualValue = vehiclePrice * (residualPercentage / 100);
    const monthlyInterest = interestRate / 100 / 12;
    
    // Depreciation portion of payment
    const depreciation = (principal - residualValue) / leaseTerm;
    
    // Interest portion of payment
    const interest = (principal + residualValue) * monthlyInterest;
    
    // Total monthly payment
    const monthlyPayment = depreciation + interest;
    
    setResults({
      monthlyPayment: monthlyPayment.toFixed(2),
      totalCost: (monthlyPayment * leaseTerm).toFixed(2),
      depreciation: depreciation.toFixed(2),
      interest: interest.toFixed(2),
      residualValue: residualValue.toFixed(2)
    });
  };

  useEffect(() => {
    calculateLease();
  }, [vehiclePrice, downPayment, leaseTerm, interestRate, residualPercentage]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Lease Payment Calculator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle Price ($)
          </label>
          <input
            type="number"
            value={vehiclePrice}
            onChange={(e) => setVehiclePrice(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="1000"
            step="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Down Payment ($)
          </label>
          <input
            type="number"
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            max={vehiclePrice}
            step="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lease Term (months)
          </label>
          <input
            type="number"
            value={leaseTerm}
            onChange={(e) => setLeaseTerm(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="12"
            max="60"
            step="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interest Rate (%)
          </label>
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            max="20"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Residual Value (%)
          </label>
          <input
            type="number"
            value={residualPercentage}
            onChange={(e) => setResidualPercentage(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="10"
            max="80"
            step="1"
          />
        </div>
      </div>

      {results && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Lease Results</h2>
          <div className="space-y-2">
            <p>Monthly Payment: 
              <span className="font-bold text-green-600">
                ${Number(results.monthlyPayment).toLocaleString()}
              </span>
            </p>
            <p>Total Lease Cost: 
              <span className="font-medium">
                ${Number(results.totalCost).toLocaleString()}
              </span>
            </p>
            <p>Monthly Depreciation: 
              <span className="font-medium">
                ${Number(results.depreciation).toLocaleString()}
              </span>
            </p>
            <p>Monthly Interest: 
              <span className="font-medium">
                ${Number(results.interest).toLocaleString()}
              </span>
            </p>
            <p>Residual Value: 
              <span className="font-medium">
                ${Number(results.residualValue).toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: This is a simplified calculation. Actual lease payments may include taxes, 
        fees, and other factors. Consult a leasing professional for accurate quotes.
      </p>
    </div>
  );
};

export default LeasePaymentCalculator;