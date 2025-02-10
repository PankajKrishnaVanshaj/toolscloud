"use client";

import { useState } from "react";

const InvestmentCalculator = () => {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [compound, setCompound] = useState(1);
  const [futureValue, setFutureValue] = useState(null);

  const calculateInvestment = () => {
    if (!principal || !rate || !years) {
      setFutureValue(null);
      return;
    }

    const P = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const n = parseInt(compound);
    const t = parseInt(years);

    const FV = P * Math.pow(1 + r / n, n * t);
    setFutureValue(FV.toFixed(2));
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg text-center">
      <h2 className="text-xl font-semibold mb-4">📈 Investment Calculator</h2>
      <input type="number" placeholder="Initial Investment ($)" value={principal} onChange={(e) => setPrincipal(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2" />
      <input type="number" placeholder="Annual Interest Rate (%)" value={rate} onChange={(e) => setRate(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2" />
      <input type="number" placeholder="Years to Invest" value={years} onChange={(e) => setYears(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2" />
      <select value={compound} onChange={(e) => setCompound(e.target.value)} className="border rounded-lg px-3 py-2 w-full mb-3">
        <option value={1}>Yearly</option>
        <option value={4}>Quarterly</option>
        <option value={12}>Monthly</option>
      </select>
      <button onClick={calculateInvestment} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
        Calculate Future Value
      </button>
      {futureValue && <p className="mt-3 text-lg font-medium">Future Value: ${futureValue}</p>}
    </div>
  );
};

export default InvestmentCalculator;
