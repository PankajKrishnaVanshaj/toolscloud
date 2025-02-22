'use client'
import React, { useState } from 'react';

const LoanToValueCalculator = () => {
  const [mode, setMode] = useState('ltv'); // ltv, loan, value
  const [loanAmount, setLoanAmount] = useState('');
  const [propertyValue, setPropertyValue] = useState('');
  const [ltv, setLtv] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Calculate LTV based on mode
  const calculateLTV = () => {
    setError('');
    setResult(null);

    const loanNum = parseFloat(loanAmount);
    const valueNum = parseFloat(propertyValue);
    const ltvNum = parseFloat(ltv);

    if (mode === 'ltv') {
      if (isNaN(loanNum) || isNaN(valueNum)) {
        return { error: 'Please enter valid loan amount and property value' };
      }
      if (loanNum < 0 || valueNum <= 0) {
        return { error: 'Loan amount must be non-negative, property value must be positive' };
      }
      const ltvCalc = (loanNum / valueNum) * 100;
      return {
        loanAmount: loanNum.toFixed(2),
        propertyValue: valueNum.toFixed(2),
        ltv: ltvCalc.toFixed(2),
        type: 'ltv'
      };
    } else if (mode === 'loan') {
      if (isNaN(ltvNum) || isNaN(valueNum)) {
        return { error: 'Please enter valid LTV and property value' };
      }
      if (ltvNum < 0 || valueNum <= 0) {
        return { error: 'LTV must be non-negative, property value must be positive' };
      }
      const loanCalc = (ltvNum / 100) * valueNum;
      return {
        loanAmount: loanCalc.toFixed(2),
        propertyValue: valueNum.toFixed(2),
        ltv: ltvNum.toFixed(2),
        type: 'loan'
      };
    } else if (mode === 'value') {
      if (isNaN(loanNum) || isNaN(ltvNum)) {
        return { error: 'Please enter valid loan amount and LTV' };
      }
      if (loanNum < 0 || ltvNum <= 0) {
        return { error: 'Loan amount must be non-negative, LTV must be positive' };
      }
      const valueCalc = loanNum / (ltvNum / 100);
      return {
        loanAmount: loanNum.toFixed(2),
        propertyValue: valueCalc.toFixed(2),
        ltv: ltvNum.toFixed(2),
        type: 'value'
      };
    }
    return null;
  };

  const calculate = () => {
    if ((mode === 'ltv' && (!loanAmount || !propertyValue)) ||
        (mode === 'loan' && (!ltv || !propertyValue)) ||
        (mode === 'value' && (!loanAmount || !ltv))) {
      setError('Please fill in all required fields');
      return;
    }

    const calcResult = calculateLTV();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
  };

  const reset = () => {
    setMode('ltv');
    setLoanAmount('');
    setPropertyValue('');
    setLtv('');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Loan-to-Value Calculator
        </h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => setMode('ltv')}
            className={`px-3 py-1 rounded-lg ${mode === 'ltv' ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Calculate LTV
          </button>
          <button
            onClick={() => setMode('loan')}
            className={`px-3 py-1 rounded-lg ${mode === 'loan' ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Calculate Loan
          </button>
          <button
            onClick={() => setMode('value')}
            className={`px-3 py-1 rounded-lg ${mode === 'value' ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Calculate Value
          </button>
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            {(mode === 'ltv' || mode === 'value') && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Loan Amount ($):</label>
                <input
                  type="number"
                  step="0.01"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 80000"
                />
              </div>
            )}
            {(mode === 'ltv' || mode === 'loan') && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Property Value ($):</label>
                <input
                  type="number"
                  step="0.01"
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 100000"
                />
              </div>
            )}
            {(mode === 'loan' || mode === 'value') && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">LTV (%):</label>
                <input
                  type="number"
                  step="0.01"
                  value={ltv}
                  onChange={(e) => setLtv(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 80"
                />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-all font-semibold"
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
          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">LTV Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center">Loan Amount: ${result.loanAmount}</p>
              <p className="text-center">Property Value: ${result.propertyValue}</p>
              <p className="text-center">LTV Ratio: {result.ltv}%</p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-purple-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    {result.type === 'ltv' && (
                      <>
                        <li>Loan Amount: ${result.loanAmount}</li>
                        <li>Property Value: ${result.propertyValue}</li>
                        <li>LTV = (Loan Amount / Property Value) × 100 = ({result.loanAmount} / {result.propertyValue}) × 100 = {result.ltv}%</li>
                      </>
                    )}
                    {result.type === 'loan' && (
                      <>
                        <li>Property Value: ${result.propertyValue}</li>
                        <li>LTV: {result.ltv}%</li>
                        <li>Loan Amount = (LTV / 100) × Property Value = ({result.ltv} / 100) × {result.propertyValue} = ${result.loanAmount}</li>
                      </>
                    )}
                    {result.type === 'value' && (
                      <>
                        <li>Loan Amount: ${result.loanAmount}</li>
                        <li>LTV: {result.ltv}%</li>
                        <li>Property Value = Loan Amount / (LTV / 100) = {result.loanAmount} / ({result.ltv} / 100) = ${result.propertyValue}</li>
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

export default LoanToValueCalculator;