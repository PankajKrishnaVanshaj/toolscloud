"use client";

import { useState } from "react";

const LoanCalculator = () => {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [emi, setEmi] = useState(null);

  const calculateEMI = () => {
    const principal = parseFloat(amount);
    const monthlyRate = parseFloat(rate) / 100 / 12;
    const numPayments = parseInt(years) * 12;

    if (!principal || !monthlyRate || !numPayments) {
      setEmi(null);
      return;
    }

    const emiValue = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    setEmi(emiValue.toFixed(2));
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg text-center">
      <h2 className="text-xl font-semibold mb-4">🏦 Loan Calculator</h2>
      <input type="number" placeholder="Loan Amount" value={amount} onChange={(e) => setAmount(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2" />
      <input type="number" placeholder="Interest Rate (%)" value={rate} onChange={(e) => setRate(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2" />
      <input type="number" placeholder="Loan Term (Years)" value={years} onChange={(e) => setYears(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2" />
      <button onClick={calculateEMI} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
        Calculate EMI
      </button>
      {emi && <p className="mt-3 text-lg font-medium">EMI: ${emi} / month</p>}
    </div>
  );
};

export default LoanCalculator;
