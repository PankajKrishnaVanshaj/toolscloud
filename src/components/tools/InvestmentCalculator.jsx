"use client";

import { useState } from "react";

const InvestmentCalculator = () => {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [compound, setCompound] = useState(1);
  const [contribution, setContribution] = useState("");
  const [contributionFrequency, setContributionFrequency] = useState(12);
  const [startAge, setStartAge] = useState("");
  const [futureValue, setFutureValue] = useState(null);
  const [yearlyBreakdown, setYearlyBreakdown] = useState([]);

  const calculateInvestment = () => {
    if (!principal || !rate || !years) {
      setFutureValue(null);
      return;
    }

    const P = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const n = parseInt(compound);
    const t = parseInt(years);
    const C = parseFloat(contribution || 0);
    const freq = parseInt(contributionFrequency);
    const age = parseInt(startAge);

    let FV = P;
    const breakdown = [];

    for (let year = 1; year <= t; year++) {
      FV = (FV + C * freq) * Math.pow(1 + r / n, n);
      breakdown.push({ year: year, amount: FV.toFixed(2) });
    }

    setFutureValue({
      total: FV.toFixed(2),
      endAge: age ? age + t : null,
    });

    setYearlyBreakdown(breakdown);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg text-center">
      <h2 className="text-xl font-semibold mb-4">📈 Advanced Investment Calculator</h2>
      <input
        type="number"
        placeholder="Initial Investment ($)"
        value={principal}
        onChange={(e) => setPrincipal(e.target.value)}
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
        placeholder="Years to Invest"
        value={years}
        onChange={(e) => setYears(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2"
      />
      <select
        value={compound}
        onChange={(e) => setCompound(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2"
      >
        <option value={1}>Yearly</option>
        <option value={4}>Quarterly</option>
        <option value={12}>Monthly</option>
      </select>
      <input
        type="number"
        placeholder="Regular Contribution ($)"
        value={contribution}
        onChange={(e) => setContribution(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2"
      />
      <select
        value={contributionFrequency}
        onChange={(e) => setContributionFrequency(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2"
      >
        <option value={12}>Monthly</option>
        <option value={4}>Quarterly</option>
        <option value={1}>Yearly</option>
      </select>
      <input
        type="number"
        placeholder="Starting Age (Optional)"
        value={startAge}
        onChange={(e) => setStartAge(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-4"
      />
      <button
        onClick={calculateInvestment}
        className="px-4 py-2 bg-primary text-white font-semibold rounded-lg"
      >
        Calculate Future Value
      </button>
      {futureValue && (
        <div className="mt-5 text-left">
          <p className="text-lg font-medium">Future Value: ${futureValue.total}</p>
          {futureValue.endAge && <p>Age at Investment Maturity: {futureValue.endAge}</p>}
        </div>
      )}
      {yearlyBreakdown.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Yearly Breakdown</h3>
          <ul className="text-left">
            {yearlyBreakdown.map((entry) => (
              <li key={entry.year} className="mb-1">
                Year {entry.year}: ${entry.amount}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InvestmentCalculator;
