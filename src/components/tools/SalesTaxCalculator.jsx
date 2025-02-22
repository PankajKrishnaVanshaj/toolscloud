'use client'
import React, { useState } from 'react';

const SalesTaxCalculator = () => {
  const [amount, setAmount] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [isTaxIncluded, setIsTaxIncluded] = useState(false); // Whether amount includes tax
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Calculate sales tax and total
  const calculateSalesTax = (price, rate, taxIncluded) => {
    const priceNum = parseFloat(price);
    const rateNum = parseFloat(rate);

    if (isNaN(priceNum) || isNaN(rateNum)) {
      return { error: 'Please enter valid numbers' };
    }
    if (priceNum < 0 || rateNum < 0) {
      return { error: 'Amount and tax rate must be non-negative' };
    }

    let taxAmount, subtotal, total;

    if (taxIncluded) {
      // Amount includes tax, calculate original price and tax
      total = priceNum;
      subtotal = priceNum / (1 + rateNum / 100);
      taxAmount = total - subtotal;
    } else {
      // Amount excludes tax, calculate tax and total
      subtotal = priceNum;
      taxAmount = subtotal * (rateNum / 100);
      total = subtotal + taxAmount;
    }

    return {
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
      taxRate: rateNum.toFixed(2),
      isTaxIncluded: taxIncluded
    };
  };

  const calculate = () => {
    setError('');
    setResult(null);

    if (!amount || !taxRate) {
      setError('Please enter both amount and tax rate');
      return;
    }

    const calcResult = calculateSalesTax(amount, taxRate, isTaxIncluded);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setAmount('');
    setTaxRate('');
    setIsTaxIncluded(false);
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Sales Tax Calculator
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
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., 100"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Tax Rate (%):</label>
              <input
                type="number"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., 8.5"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Tax Included?</label>
              <input
                type="checkbox"
                checked={isTaxIncluded}
                onChange={(e) => setIsTaxIncluded(e.target.checked)}
                className="h-5 w-5 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-gray-700">Yes</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-all font-semibold"
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
          <div className="mt-6 p-4 bg-teal-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center">Subtotal (before tax): ${result.subtotal}</p>
              <p className="text-center">Sales Tax: ${result.taxAmount}</p>
              <p className="text-center">Total Amount: ${result.total}</p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-teal-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    {result.isTaxIncluded ? (
                      <>
                        <li>Total Amount (with tax): ${result.total}</li>
                        <li>Tax Rate: {result.taxRate}%</li>
                        <li>Subtotal = Total / (1 + Tax Rate/100) = {result.total} / (1 + {result.taxRate}/100) = ${result.subtotal}</li>
                        <li>Sales Tax = Total - Subtotal = {result.total} - {result.subtotal} = ${result.taxAmount}</li>
                      </>
                    ) : (
                      <>
                        <li>Subtotal (before tax): ${result.subtotal}</li>
                        <li>Tax Rate: {result.taxRate}%</li>
                        <li>Sales Tax = Subtotal × (Tax Rate/100) = {result.subtotal} × ({result.taxRate}/100) = ${result.taxAmount}</li>
                        <li>Total Amount = Subtotal + Sales Tax = {result.subtotal} + {result.taxAmount} = ${result.total}</li>
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

export default SalesTaxCalculator;