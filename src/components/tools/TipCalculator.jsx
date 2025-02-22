'use client'
import React, { useState } from 'react';

const TipCalculator = () => {
  const [billAmount, setBillAmount] = useState('');
  const [tipPercentage, setTipPercentage] = useState('15'); // Default 15%
  const [customTip, setCustomTip] = useState('');
  const [numPeople, setNumPeople] = useState('1');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Calculate tip and total
  const calculateTip = (bill, tipPercent, people) => {
    const billNum = parseFloat(bill);
    const tipNum = tipPercent === 'custom' ? parseFloat(customTip) : parseFloat(tipPercent);
    const peopleNum = parseInt(people);

    if (isNaN(billNum) || isNaN(tipNum) || isNaN(peopleNum)) {
      return { error: 'Please enter valid numbers' };
    }
    if (billNum < 0 || tipNum < 0 || peopleNum < 1) {
      return { error: 'Bill and tip must be non-negative, people must be at least 1' };
    }

    const tipAmount = billNum * (tipNum / 100);
    const totalAmount = billNum + tipAmount;
    const tipPerPerson = tipAmount / peopleNum;
    const totalPerPerson = totalAmount / peopleNum;

    return {
      tipAmount: tipAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      tipPerPerson: tipPerPerson.toFixed(2),
      totalPerPerson: totalPerPerson.toFixed(2),
      bill: billNum.toFixed(2),
      tipPercentage: tipNum,
      people: peopleNum
    };
  };

  const calculate = () => {
    setError('');
    setResult(null);

    if (!billAmount || (tipPercentage === 'custom' && !customTip)) {
      setError('Please enter bill amount and tip percentage');
      return;
    }

    const calcResult = calculateTip(billAmount, tipPercentage, numPeople);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setBillAmount('');
    setTipPercentage('15');
    setCustomTip('');
    setNumPeople('1');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  const tipOptions = ['10', '15', '20', '25', 'custom'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Tip Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Bill Amount ($):</label>
              <input
                type="number"
                step="0.01"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 50.00"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Tip Percentage:</label>
              <div className="flex-1 flex gap-2">
                {tipOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setTipPercentage(option)}
                    className={`px-2 py-1 rounded-md ${tipPercentage === option ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    {option === 'custom' ? 'Custom' : `${option}%`}
                  </button>
                ))}
              </div>
            </div>
            {tipPercentage === 'custom' && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Custom Tip (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 18"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Number of People:</label>
              <input
                type="number"
                value={numPeople}
                onChange={(e) => setNumPeople(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 1"
                min="1"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all font-semibold"
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
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Tip Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center">Total Tip: ${result.tipAmount}</p>
              <p className="text-center">Total Bill: ${result.totalAmount}</p>
              <p className="text-center">Tip per Person: ${result.tipPerPerson}</p>
              <p className="text-center">Total per Person: ${result.totalPerPerson}</p>
              
              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-green-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
              
              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    <li>Bill Amount: ${result.bill}</li>
                    <li>Tip Percentage: {result.tipPercentage}%</li>
                    <li>Tip Amount = ${result.bill} × {result.tipPercentage / 100} = ${result.tipAmount}</li>
                    <li>Total Amount = ${result.bill} + ${result.tipAmount} = ${result.totalAmount}</li>
                    <li>Number of People: {result.people}</li>
                    <li>Tip per Person = ${result.tipAmount} / {result.people} = ${result.tipPerPerson}</li>
                    <li>Total per Person = ${result.totalAmount} / {result.people} = ${result.totalPerPerson}</li>
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

export default TipCalculator;