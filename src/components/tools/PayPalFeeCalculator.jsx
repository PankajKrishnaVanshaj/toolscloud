'use client'
import React, { useState } from 'react';

const PayPalFeeCalculator = () => {
  const [amount, setAmount] = useState('');
  const [feeType, setFeeType] = useState('domestic'); // domestic, international, custom
  const [customPercent, setCustomPercent] = useState('');
  const [customFixed, setCustomFixed] = useState('');
  const [isFeeDeducted, setIsFeeDeducted] = useState(false); // Whether amount includes fees
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // PayPal fee rates (as of common structures, may need adjustment based on current rates)
  const feeRates = {
    domestic: { percent: 2.9, fixed: 0.30 }, // US standard rate
    international: { percent: 4.4, fixed: 0.30 } // Typical international rate
  };

  // Calculate PayPal fees
  const calculatePayPalFees = (amt, type, customP, customF, feeDeducted) => {
    const amountNum = parseFloat(amt);
    let percent = type === 'custom' ? parseFloat(customP) : feeRates[type].percent;
    let fixed = type === 'custom' ? parseFloat(customF) : feeRates[type].fixed;

    if (isNaN(amountNum) || (type === 'custom' && (isNaN(percent) || isNaN(fixed)))) {
      return { error: 'Please enter valid numbers' };
    }
    if (amountNum < 0 || percent < 0 || fixed < 0) {
      return { error: 'Amount, percentage, and fixed fee must be non-negative' };
    }

    let fee, net, gross;

    if (feeDeducted) {
      // Amount is what you receive (net), calculate gross and fee
      // net = gross - (gross * percent/100 + fixed)
      // net = gross * (1 - percent/100) - fixed
      // gross * (1 - percent/100) = net + fixed
      // gross = (net + fixed) / (1 - percent/100)
      gross = (amountNum + fixed) / (1 - percent / 100);
      fee = gross * (percent / 100) + fixed;
      net = amountNum;
    } else {
      // Amount is what you charge (gross), calculate fee and net
      gross = amountNum;
      fee = gross * (percent / 100) + fixed;
      net = gross - fee;
    }

    return {
      gross: gross.toFixed(2),
      fee: fee.toFixed(2),
      net: net.toFixed(2),
      percent: percent.toFixed(2),
      fixed: fixed.toFixed(2),
      isFeeDeducted
    };
  };

  const calculate = () => {
    setError('');
    setResult(null);

    if (!amount || (feeType === 'custom' && (!customPercent || !customFixed))) {
      setError('Please fill in all required fields');
      return;
    }

    const calcResult = calculatePayPalFees(amount, feeType, customPercent, customFixed, isFeeDeducted);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setAmount('');
    setFeeType('domestic');
    setCustomPercent('');
    setCustomFixed('');
    setIsFeeDeducted(false);
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          PayPal Fee Calculator
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
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., 100"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Fee Type:</label>
              <select
                value={feeType}
                onChange={(e) => setFeeType(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="domestic">Domestic (2.9% + $0.30)</option>
                <option value="international">International (4.4% + $0.30)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {feeType === 'custom' && (
              <>
                <div className="flex items-center gap-2">
                  <label className="w-32 text-gray-700">Custom %:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={customPercent}
                    onChange={(e) => setCustomPercent(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="e.g., 2.9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-32 text-gray-700">Fixed Fee ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={customFixed}
                    onChange={(e) => setCustomFixed(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="e.g., 0.30"
                  />
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Fee Deducted?</label>
              <input
                type="checkbox"
                checked={isFeeDeducted}
                onChange={(e) => setIsFeeDeducted(e.target.checked)}
                className="h-5 w-5 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-gray-700">Yes (net amount)</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700 transition-all font-semibold"
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
          <div className="mt-6 p-4 bg-cyan-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">PayPal Fee Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center">Gross Amount: ${result.gross}</p>
              <p className="text-center">PayPal Fee: ${result.fee}</p>
              <p className="text-center">Net Amount: ${result.net}</p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-cyan-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    <li>Fee Rate: {result.percent}% + ${result.fixed}</li>
                    {result.isFeeDeducted ? (
                      <>
                        <li>Net Amount (received): ${result.net}</li>
                        <li>Gross = (Net + Fixed) / (1 - Percent/100)</li>
                        <li>Gross = ({result.net} + {result.fixed}) / (1 - {result.percent}/100) = ${result.gross}</li>
                        <li>Fee = Gross × (Percent/100) + Fixed = {result.gross} × ({result.percent}/100) + {result.fixed} = ${result.fee}</li>
                      </>
                    ) : (
                      <>
                        <li>Gross Amount (charged): ${result.gross}</li>
                        <li>Fee = Gross × (Percent/100) + Fixed = {result.gross} × ({result.percent}/100) + {result.fixed} = ${result.fee}</li>
                        <li>Net = Gross - Fee = {result.gross} - {result.fee} = ${result.net}</li>
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

export default PayPalFeeCalculator;