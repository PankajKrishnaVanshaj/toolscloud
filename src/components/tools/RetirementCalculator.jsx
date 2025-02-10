"use client";

import { useState } from "react";

const RetirementCalculator = () => {
  const [currentAge, setCurrentAge] = useState("");
  const [retirementAge, setRetirementAge] = useState("");
  const [monthlySavings, setMonthlySavings] = useState("");
  const [rate, setRate] = useState("");
  const [totalSavings, setTotalSavings] = useState(null);

  const calculateRetirementSavings = () => {
    if (!currentAge || !retirementAge || !monthlySavings || !rate) {
      setTotalSavings(null);
      return;
    }

    const yearsToSave = parseInt(retirementAge) - parseInt(currentAge);
    const monthlyRate = parseFloat(rate) / 100 / 12;
    const months = yearsToSave * 12;
    const savings = parseFloat(monthlySavings);

    let futureValue = 0;
    for (let i = 0; i < months; i++) {
      futureValue = (futureValue + savings) * (1 + monthlyRate);
    }

    setTotalSavings(futureValue.toFixed(2));
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg text-center">
      <h2 className="text-xl font-semibold mb-4">🏡 Retirement Savings Calculator</h2>
      <input type="number" placeholder="Current Age" value={currentAge} onChange={(e) => setCurrentAge(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2" />
      <input type="number" placeholder="Retirement Age" value={retirementAge} onChange={(e) => setRetirementAge(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2" />
      <input type="number" placeholder="Monthly Savings ($)" value={monthlySavings} onChange={(e) => setMonthlySavings(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2" />
      <input type="number" placeholder="Annual Interest Rate (%)" value={rate} onChange={(e) => setRate(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2" />
      <button onClick={calculateRetirementSavings} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
        Calculate Savings
      </button>
      {totalSavings && <p className="mt-3 text-lg font-medium">Total Savings at Retirement: ${totalSavings}</p>}
    </div>
  );
};

export default RetirementCalculator;
