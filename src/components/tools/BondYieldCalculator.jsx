// components/BondYieldCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const BondYieldCalculator = () => {
  const [faceValue, setFaceValue] = useState(1000); // Par value of the bond
  const [couponRate, setCouponRate] = useState(5); // Annual coupon rate in %
  const [currentPrice, setCurrentPrice] = useState(950); // Current market price
  const [yearsToMaturity, setYearsToMaturity] = useState(10); // Years until maturity
  const [yieldToMaturity, setYieldToMaturity] = useState(null);

  // Calculate Yield to Maturity using approximation formula
  const calculateYTM = () => {
    if (!faceValue || !couponRate || !currentPrice || !yearsToMaturity) {
      setYieldToMaturity(null);
      return;
    }

    const couponPayment = (couponRate / 100) * faceValue;
    const ytm = ((couponPayment + ((faceValue - currentPrice) / yearsToMaturity)) / 
                ((faceValue + currentPrice) / 2)) * 100;
    
    setYieldToMaturity(ytm.toFixed(2));
  };

  useEffect(() => {
    calculateYTM();
  }, [faceValue, couponRate, currentPrice, yearsToMaturity]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Bond Yield Calculator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Face Value ($)
          </label>
          <input
            type="number"
            value={faceValue}
            onChange={(e) => setFaceValue(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="1"
            step="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coupon Rate (%)
          </label>
          <input
            type="number"
            value={couponRate}
            onChange={(e) => setCouponRate(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            max="100"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Price ($)
          </label>
          <input
            type="number"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="1"
            step="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Years to Maturity
          </label>
          <input
            type="number"
            value={yearsToMaturity}
            onChange={(e) => setYearsToMaturity(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="1"
            step="1"
          />
        </div>
      </div>

      {yieldToMaturity && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <h2 className="text-lg font-semibold mb-2">Yield to Maturity (YTM)</h2>
          <p className="text-2xl font-bold text-green-600">
            {yieldToMaturity}%
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Annual coupon payment: ${(faceValue * (couponRate / 100)).toFixed(2)}
          </p>
        </div>
      )}

      {!yieldToMaturity && (
        <p className="text-center text-gray-500">
          Please enter valid values to calculate the yield
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: This uses an approximation formula for YTM. Actual YTM calculations may
        require more complex methods considering payment frequency and exact dates.
      </p>
    </div>
  );
};

export default BondYieldCalculator;