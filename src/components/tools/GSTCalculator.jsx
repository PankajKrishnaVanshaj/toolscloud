'use client'
import React, { useState } from 'react';

const GSTCalculator = () => {
  const [amount, setAmount] = useState('');
  const [gstRate, setGstRate] = useState(''); // GST rate in percentage
  const [isGstIncluded, setIsGstIncluded] = useState(false); // Whether amount includes GST
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Calculate GST and total
  const calculateGST = (price, rate, gstIncluded) => {
    const amountNum = parseFloat(price);
    const rateNum = parseFloat(rate);

    if (isNaN(amountNum) || isNaN(rateNum)) {
      return { error: 'Please enter valid numbers' };
    }
    if (amountNum < 0 || rateNum < 0) {
      return { error: 'Amount and GST rate must be non-negative' };
    }

    let gstAmount, netPrice, totalPrice;

    if (gstIncluded) {
      // Amount includes GST, calculate net price and GST
      totalPrice = amountNum;
      netPrice = amountNum / (1 + rateNum / 100);
      gstAmount = totalPrice - netPrice;
    } else {
      // Amount excludes GST, calculate GST and total
      netPrice = amountNum;
      gstAmount = netPrice * (rateNum / 100);
      totalPrice = netPrice + gstAmount;
    }

    return {
      netPrice: netPrice.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
      gstRate: rateNum.toFixed(2),
      isGstIncluded
    };
  };

  const calculate = () => {
    setError('');
    setResult(null);

    if (!amount || !gstRate) {
      setError('Please enter both amount and GST rate');
      return;
    }

    const calcResult = calculateGST(amount, gstRate, isGstIncluded);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setAmount('');
    setGstRate('');
    setIsGstIncluded(false);
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          GST Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Amount ($):</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., 100"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">GST Rate (%):</label>
              <input
                type="number"
                step="0.01"
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., 10"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">GST Included?</label>
              <input
                type="checkbox"
                checked={isGstIncluded}
                onChange={(e) => setIsGstIncluded(e.target.checked)}
                className="h-5 w-5 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-gray-700">Yes</span>
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">GST Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center">Net Price (excl. GST): ${result.netPrice}</p>
              <p className="text-center">GST Amount: ${result.gstAmount}</p>
              <p className="text-center text-xl">Total Price (incl. GST): ${result.totalPrice}</p>

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
                    <li>GST Rate: {result.gstRate}%</li>
                    {result.isGstIncluded ? (
                      <>
                        <li>Total Price (with GST): ${result.totalPrice}</li>
                        <li>Net Price = Total / (1 + GST Rate/100) = {result.totalPrice} / (1 + {result.gstRate}/100) = ${result.netPrice}</li>
                        <li>GST Amount = Total - Net = {result.totalPrice} - {result.netPrice} = ${result.gstAmount}</li>
                      </>
                    ) : (
                      <>
                        <li>Net Price (without GST): ${result.netPrice}</li>
                        <li>GST Amount = Net × (GST Rate/100) = {result.netPrice} × ({result.gstRate}/100) = ${result.gstAmount}</li>
                        <li>Total Price = Net + GST = {result.netPrice} + {result.gstAmount} = ${result.totalPrice}</li>
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

export default GSTCalculator;