"use client";

import { useState } from "react";

const LoanCalculator = () => {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [term, setTerm] = useState("");
  const [frequency, setFrequency] = useState("Monthly");
  const [termUnit, setTermUnit] = useState("Year");
  const [interestType, setInterestType] = useState("Compound");
  const [currency, setCurrency] = useState("USD");
  const [emi, setEmi] = useState(null);
  const [totalInterest, setTotalInterest] = useState(null);
  const [totalPayment, setTotalPayment] = useState(null);
  const [error, setError] = useState("");

  const calculateEMI = () => {
    setError("");
    const principal = parseFloat(amount);
    const annualRate = parseFloat(rate) / 100;

    if (!principal || !annualRate || !term) {
      setError("Please fill in all the fields.");
      return;
    }

    let numPeriods;
    switch (termUnit) {
      case "Month":
        numPeriods = parseInt(term);
        break;
      case "Day":
        numPeriods = Math.ceil(parseInt(term) / 30);
        break;
      case "Week":
        numPeriods = Math.ceil(parseInt(term) / 4);
        break;
      default:
        numPeriods = parseInt(term) * 12;
    }

    let ratePerPeriod;
    switch (frequency) {
      case "Quarterly":
        ratePerPeriod = annualRate / 4;
        break;
      case "Yearly":
        ratePerPeriod = annualRate;
        break;
      default:
        ratePerPeriod = annualRate / 12;
    }

    let emiValue;
    if (interestType === "Compound") {
      emiValue =
        (principal * ratePerPeriod * Math.pow(1 + ratePerPeriod, numPeriods)) /
        (Math.pow(1 + ratePerPeriod, numPeriods) - 1);
    } else {
      const totalInterestValue = principal * annualRate * (numPeriods / 12);
      emiValue = (principal + totalInterestValue) / numPeriods;
    }

    const totalPaymentValue = emiValue * numPeriods;
    const totalInterestValue = totalPaymentValue - principal;

    setEmi(emiValue.toFixed(2));
    setTotalInterest(totalInterestValue.toFixed(2));
    setTotalPayment(totalPaymentValue.toFixed(2));
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg text-center">
      <h2 className="text-xl font-semibold mb-4">🏦 Loan Calculator</h2>

      <input
        type="number"
        placeholder="Loan Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2"
      />

      <input
        type="number"
        placeholder="Interest Rate (%)"
        value={rate}
        onChange={(e) => setRate(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2"
      />

      <input
        type="number"
        placeholder="Loan Term"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-4"
      />

      <div className="mb-4">
        <label className="block text-left mb-1">Loan Term Unit</label>
        <select
          value={termUnit}
          onChange={(e) => setTermUnit(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full"
        >
          <option value="Year">Year</option>
          <option value="Month">Month</option>
          <option value="Day">Day</option>
          <option value="Week">Week</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-left mb-1">Payment Frequency</label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full"
        >
          <option value="Monthly">Monthly</option>
          <option value="Quarterly">Quarterly</option>
          <option value="Yearly">Yearly</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-left mb-1">Interest Type</label>
        <select
          value={interestType}
          onChange={(e) => setInterestType(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full"
        >
          <option value="Compound">Compound Interest</option>
          <option value="Simple">Simple Interest</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-left mb-1">Currency</label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full"
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="INR">INR</option>
        </select>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <button
        onClick={calculateEMI}
        className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition"
      >
        Calculate EMI
      </button>

      {emi && (
        <div className="mt-5">
          <p className="text-lg font-medium">
            EMI: {currency} {emi} / {frequency.toLowerCase()}
          </p>
          <p>Total Interest: {currency} {totalInterest}</p>
          <p>Total Payment: {currency} {totalPayment}</p>
        </div>
      )}
    </div>
  );
};

export default LoanCalculator;
