"use client";
import React, { useState, useCallback } from "react";
import { FaChartLine, FaDownload, FaSync } from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"; // For visualization

const CompoundInterestCalculator = () => {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [frequency, setFrequency] = useState("12");
  const [additionalContribution, setAdditionalContribution] = useState("0"); // New feature
  const [contributionFrequency, setContributionFrequency] = useState("12"); // New feature
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showChart, setShowChart] = useState(false);

  // Calculate compound interest with additional contributions
  const calculateCompoundInterest = useCallback((P, r, t, n, PMT, m) => {
    const ratePerPeriod = r / 100 / n;
    const totalPeriods = n * t;

    // Future value of initial principal
    const fvPrincipal = P * Math.pow(1 + ratePerPeriod, totalPeriods);

    // Future value of regular contributions
    const periodsPerContribution = n / m;
    let fvContributions = 0;
    if (PMT > 0 && m > 0) {
      fvContributions =
        PMT *
        ((Math.pow(1 + ratePerPeriod, totalPeriods) - 1) / ratePerPeriod) *
        (1 / periodsPerContribution);
    }

    const finalAmount = fvPrincipal + fvContributions;
    const totalInterest = finalAmount - P - PMT * (totalPeriods / periodsPerContribution);

    // Yearly breakdown
    const breakdown = [];
    let currentBalance = P;
    const contributionPerPeriod = PMT / periodsPerContribution;
    for (let year = 1; year <= t; year++) {
      const periodsThisYear = n;
      let yearInterest = 0;
      let yearContribution = 0;

      for (let i = 0; i < periodsThisYear; i++) {
        const periodInterest = currentBalance * ratePerPeriod;
        yearInterest += periodInterest;
        if (i % periodsPerContribution === 0) {
          currentBalance += contributionPerPeriod;
          yearContribution += contributionPerPeriod;
        }
        currentBalance += periodInterest;
      }

      breakdown.push({
        year,
        balance: currentBalance.toFixed(2),
        interest: yearInterest.toFixed(2),
        contribution: yearContribution.toFixed(2),
      });
    }

    return {
      finalAmount: finalAmount.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      totalContributions: (PMT * (totalPeriods / periodsPerContribution)).toFixed(2),
      breakdown,
    };
  }, []);

  const calculate = () => {
    setError("");
    setResult(null);

    const P = parseFloat(principal);
    const r = parseFloat(rate);
    const t = parseInt(time);
    const n = parseInt(frequency);
    const PMT = parseFloat(additionalContribution);
    const m = parseInt(contributionFrequency);

    // Validation
    if (isNaN(P) || isNaN(r) || isNaN(t) || isNaN(n) || isNaN(PMT) || isNaN(m)) {
      setError("Please enter valid numbers");
      return;
    }
    if (P <= 0 || r < 0 || t <= 0 || n <= 0 || PMT < 0 || m <= 0) {
      setError("All values must be positive (rate and contributions can be 0)");
      return;
    }

    const calcResult = calculateCompoundInterest(P, r, t, n, PMT, m);
    setResult(calcResult);
  };

  const reset = () => {
    setPrincipal("");
    setRate("");
    setTime("");
    setFrequency("12");
    setAdditionalContribution("0");
    setContributionFrequency("12");
    setResult(null);
    setError("");
    setShowBreakdown(false);
    setShowChart(false);
  };

  const downloadBreakdown = () => {
    if (!result) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Year,Balance,Interest,Contribution\n" +
      result.breakdown
        .map(
          (row) =>
            `${row.year},${row.balance},${row.interest},${row.contribution || "0"}`
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "compound_interest_breakdown.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const frequencyOptions = {
    1: "Annually",
    4: "Quarterly",
    12: "Monthly",
    365: "Daily",
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Compound Interest Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Principal ($)
              </label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5.25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time (years)
              </label>
              <input
                type="number"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compound Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(frequencyOptions).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Contribution ($)
              </label>
              <input
                type="number"
                value={additionalContribution}
                onChange={(e) => setAdditionalContribution(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contribution Frequency
              </label>
              <select
                value={contributionFrequency}
                onChange={(e) => setContributionFrequency(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(frequencyOptions).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaChartLine className="mr-2" /> Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-center border border-red-200">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h2 className="text-lg font-semibold text-gray-700 text-center">
                Investment Results
              </h2>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                <p>
                  <strong>Final Amount:</strong> ${result.finalAmount}
                </p>
                <p>
                  <strong>Total Interest:</strong> ${result.totalInterest}
                </p>
                <p>
                  <strong>Initial Investment:</strong> ${principal}
                </p>
                <p>
                  <strong>Total Contributions:</strong> ${result.totalContributions}
                </p>
              </div>

              {/* Toggle Buttons */}
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showBreakdown ? "Hide Breakdown" : "Show Breakdown"}
                </button>
                <button
                  onClick={() => setShowChart(!showChart)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showChart ? "Hide Chart" : "Show Chart"}
                </button>
                <button
                  onClick={downloadBreakdown}
                  className="text-sm text-blue-600 hover:underline flex items-center"
                >
                  <FaDownload className="mr-1" /> Download CSV
                </button>
              </div>
            </div>

            {/* Yearly Breakdown */}
            {showBreakdown && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border">Year</th>
                      <th className="p-2 border">Balance</th>
                      <th className="p-2 border">Interest</th>
                      <th className="p-2 border">Contribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.breakdown.map((yearData) => (
                      <tr key={yearData.year}>
                        <td className="p-2 border text-center">{yearData.year}</td>
                        <td className="p-2 border text-center">${yearData.balance}</td>
                        <td className="p-2 border text-center">${yearData.interest}</td>
                        <td className="p-2 border text-center">${yearData.contribution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Chart */}
            {showChart && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={result.breakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="balance" stroke="#8884d8" name="Balance" />
                    <Line type="monotone" dataKey="interest" stroke="#82ca9d" name="Interest" />
                    <Line
                      type="monotone"
                      dataKey="contribution"
                      stroke="#ffc107"
                      name="Contribution"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate with additional contributions</li>
            <li>Customizable compound and contribution frequencies</li>
            <li>Yearly breakdown table</li>
            <li>Interactive growth chart</li>
            <li>Download results as CSV</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CompoundInterestCalculator;