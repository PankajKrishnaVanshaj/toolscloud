"use client";

import { useState } from "react";

const RetirementCalculator = () => {
  const [currentAge, setCurrentAge] = useState("");
  const [retirementAge, setRetirementAge] = useState("");
  const [monthlySavings, setMonthlySavings] = useState("");
  const [lumpSum, setLumpSum] = useState("");
  const [rate, setRate] = useState("");
  const [inflationRate, setInflationRate] = useState("");
  const [monthlyPension, setMonthlyPension] = useState("");
  const [totalSavings, setTotalSavings] = useState(null);
  const [yearlyBreakdown, setYearlyBreakdown] = useState([]);
  const [inflationAdjustedValue, setInflationAdjustedValue] = useState(null);

  const calculateRetirementSavings = () => {
    if (!currentAge || !retirementAge || !monthlySavings || !rate) {
      setTotalSavings(null);
      return;
    }

    const yearsToSave = parseInt(retirementAge) - parseInt(currentAge);
    if (yearsToSave <= 0) {
      alert("Retirement age must be greater than current age.");
      return;
    }

    const monthlyRate = parseFloat(rate) / 100 / 12;
    const months = yearsToSave * 12;
    const savings = parseFloat(monthlySavings || 0);
    const lump = parseFloat(lumpSum || 0);
    const yearlyInflationRate = parseFloat(inflationRate || 0) / 100;

    let futureValue = lump;
    let breakdown = [];

    for (let i = 0; i < months; i++) {
      futureValue = (futureValue + savings) * (1 + monthlyRate);
      if ((i + 1) % 12 === 0) {
        breakdown.push({
          year: Math.floor((i + 1) / 12),
          value: futureValue.toFixed(2),
        });
      }
    }

    const adjustedValue =
      yearlyInflationRate > 0
        ? futureValue / Math.pow(1 + yearlyInflationRate, yearsToSave)
        : futureValue;

    setTotalSavings(futureValue.toFixed(2));
    setInflationAdjustedValue(adjustedValue.toFixed(2));
    setYearlyBreakdown(breakdown);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg text-center">
      <h2 className="text-xl font-semibold mb-4">
        🏡 Advanced Retirement Savings Calculator
      </h2>
      <input
        type="number"
        placeholder="Current Age"
        value={currentAge}
        onChange={(e) => setCurrentAge(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2"
      />
      <input
        type="number"
        placeholder="Retirement Age"
        value={retirementAge}
        onChange={(e) => setRetirementAge(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2"
      />
      <input
        type="number"
        placeholder="Monthly Savings ($)"
        value={monthlySavings}
        onChange={(e) => setMonthlySavings(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2"
      />
      <input
        type="number"
        placeholder="Lump Sum Contribution ($)"
        value={lumpSum}
        onChange={(e) => setLumpSum(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2"
      />
      <input
        type="number"
        placeholder="Annual Interest Rate (%)"
        value={rate}
        onChange={(e) => setRate(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2"
      />
      <input
        type="number"
        placeholder="Inflation Rate (%) (Optional)"
        value={inflationRate}
        onChange={(e) => setInflationRate(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2"
      />
      <input
        type="number"
        placeholder="Estimated Monthly Pension ($)"
        value={monthlyPension}
        onChange={(e) => setMonthlyPension(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-3"
      />
      <button
        onClick={calculateRetirementSavings}
        className="px-4 py-2 bg-primary text-white font-semibold rounded-lg"
      >
        Calculate Savings
      </button>
      {totalSavings && (
        <div className="mt-4">
          <p className="text-lg font-medium">
            Total Savings at Retirement: ${totalSavings}
          </p>
          <p className="text-lg font-medium">
            Inflation-Adjusted Value: ${inflationAdjustedValue}
          </p>
          {monthlyPension && (
            <p className="text-lg font-medium">
              Estimated Monthly Pension: $
              {parseFloat(monthlyPension).toFixed(2)}
            </p>
          )}
          <h3 className="mt-4 font-semibold">📊 Yearly Savings Breakdown</h3>
          <ul className="text-left list-disc pl-5 h-40 overflow-auto">
            {yearlyBreakdown.map((year) => (
              <li key={year.year}>
                Year {year.year}: ${year.value}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RetirementCalculator;
