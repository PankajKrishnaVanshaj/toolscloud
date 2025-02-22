'use client'
import React, { useState } from 'react';

const DiscountCalculator = () => {
  const [mode, setMode] = useState('originalDiscount'); // originalDiscount, finalDiscount
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [finalPrice, setFinalPrice] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Calculate discount based on mode
  const calculateDiscount = () => {
    setError('');
    setResult(null);

    const original = parseFloat(originalPrice);
    const discount = parseFloat(discountPercent);
    const final = parseFloat(finalPrice);

    if (mode === 'originalDiscount') {
      if (isNaN(original) || isNaN(discount)) {
        return { error: 'Please enter valid original price and discount percentage' };
      }
      if (original < 0 || discount < 0 || discount > 100) {
        return { error: 'Original price must be non-negative, discount must be between 0 and 100%' };
      }
      const discountAmount = original * (discount / 100);
      const finalPriceCalc = original - discountAmount;
      return {
        originalPrice: original.toFixed(2),
        discountPercent: discount.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        finalPrice: finalPriceCalc.toFixed(2),
        type: 'originalDiscount'
      };
    } else if (mode === 'finalDiscount') {
      if (isNaN(final) || isNaN(discount)) {
        return { error: 'Please enter valid final price and discount percentage' };
      }
      if (final < 0 || discount < 0 || discount >= 100) {
        return { error: 'Final price must be non-negative, discount must be between 0 and 99.99%' };
      }
      const originalPriceCalc = final / (1 - discount / 100);
      const discountAmount = originalPriceCalc - final;
      return {
        originalPrice: originalPriceCalc.toFixed(2),
        discountPercent: discount.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        finalPrice: final.toFixed(2),
        type: 'finalDiscount'
      };
    }
    return null;
  };

  const calculate = () => {
    if ((mode === 'originalDiscount' && (!originalPrice || !discountPercent)) ||
        (mode === 'finalDiscount' && (!finalPrice || !discountPercent))) {
      setError('Please fill in all required fields');
      return;
    }

    const calcResult = calculateDiscount();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
  };

  const reset = () => {
    setMode('originalDiscount');
    setOriginalPrice('');
    setDiscountPercent('');
    setFinalPrice('');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Discount Calculator
        </h1>

        {/* Mode Selection */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setMode('originalDiscount')}
            className={`px-3 py-1 rounded-lg ${mode === 'originalDiscount' ? 'bg-pink-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Original & Discount
          </button>
          <button
            onClick={() => setMode('finalDiscount')}
            className={`px-3 py-1 rounded-lg ${mode === 'finalDiscount' ? 'bg-pink-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Final & Discount
          </button>
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            {mode === 'originalDiscount' && (
              <>
                <div className="flex items-center gap-2">
                  <label className="w-32 text-gray-700">Original Price ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="e.g., 100"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-32 text-gray-700">Discount (%):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="e.g., 20"
                  />
                </div>
              </>
            )}
            {mode === 'finalDiscount' && (
              <>
                <div className="flex items-center gap-2">
                  <label className="w-32 text-gray-700">Final Price ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="e.g., 80"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-32 text-gray-700">Discount (%):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="e.g., 20"
                  />
                </div>
              </>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-all font-semibold"
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
          <div className="mt-6 p-4 bg-pink-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Discount Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center">Original Price: ${result.originalPrice}</p>
              <p className="text-center">Discount: {result.discountPercent}%</p>
              <p className="text-center">Savings: ${result.discountAmount}</p>
              <p className="text-center">Final Price: ${result.finalPrice}</p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-pink-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    {result.type === 'originalDiscount' && (
                      <>
                        <li>Original Price: ${result.originalPrice}</li>
                        <li>Discount Amount = Original × (Discount/100) = {result.originalPrice} × ({result.discountPercent}/100) = ${result.discountAmount}</li>
                        <li>Final Price = Original - Discount Amount = {result.originalPrice} - {result.discountAmount} = ${result.finalPrice}</li>
                      </>
                    )}
                    {result.type === 'finalDiscount' && (
                      <>
                        <li>Final Price: ${result.finalPrice}</li>
                        <li>Original Price = Final / (1 - Discount/100) = {result.finalPrice} / (1 - {result.discountPercent}/100) = ${result.originalPrice}</li>
                        <li>Discount Amount = Original - Final = {result.originalPrice} - {result.finalPrice} = ${result.discountAmount}</li>
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

export default DiscountCalculator;