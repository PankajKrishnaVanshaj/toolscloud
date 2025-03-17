"use client";
import React, { useState, useCallback } from "react";
import { FaChartLine, FaDownload, FaSync } from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const InvestmentCalculator = () => {
  const [initialInvestment, setInitialInvestment] = useState("");
  const [contribution, setContribution] = useState("");
  const [contributionFrequency, setContributionFrequency] = useState("monthly");
  const [interestRate, setInterestRate] = useState("");
  const [years, setYears] = useState("");
  const [compoundFrequency, setCompoundFrequency] = useState("yearly");
  const [inflationRate, setInflationRate] = useState(""); // New: Adjust for inflation
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const compoundFrequencies = { yearly: 1, quarterly: 4, monthly: 12 };
  const contributionFrequencies = { monthly: 12, quarterly: 4, yearly: 1 };

  // Calculate investment growth with inflation adjustment
  const calculateInvestment = useCallback(() => {
    const initialNum = parseFloat(initialInvestment) || 0;
    const contribNum = parseFloat(contribution) || 0;
    const rateNum = parseFloat(interestRate) || 0;
    const yearsNum = parseInt(years) || 0;
    const inflationNum = parseFloat(inflationRate) || 0;
    const compoundsPerYear = compoundFrequencies[compoundFrequency];
    const contribsPerYear = contributionFrequencies[contributionFrequency];

    if (initialNum < 0 || contribNum < 0 || rateNum < 0 || yearsNum <= 0) {
      return { error: "Initial investment, contribution, and rate must be non-negative; years must be positive" };
    }
    if (!initialInvestment || !interestRate || !years) {
      return { error: "Please fill in all required fields" };
    }

    const periodRate = rateNum / 100 / compoundsPerYear;
    const totalPeriods = yearsNum * compoundsPerYear;
    const contribPerPeriod = contribNum * (contribsPerYear / compoundsPerYear);
    const inflationRatePerYear = inflationNum / 100;

    let fvInitial = initialNum * Math.pow(1 + periodRate, totalPeriods);
    let fvContributions = contribNum > 0 ? contribPerPeriod * ((Math.pow(1 + periodRate, totalPeriods) - 1) / periodRate) : 0;
    let totalValue = fvInitial + fvContributions;
    const totalContributed = initialNum + contribNum * contribsPerYear * yearsNum;
    const totalInterest = totalValue - totalContributed;

    // Adjust for inflation
    const realValue = totalValue / Math.pow(1 + inflationRatePerYear, yearsNum);

    // Detailed breakdown
    const breakdown = [];
    let currentBalance = initialNum;
    let chartData = [{ year: 0, balance: initialNum, realBalance: initialNum }];
    for (let year = 1; year <= yearsNum; year++) {
      const yearStart = currentBalance;
      const yearContrib = contribNum * contribsPerYear;
      const periodsThisYear = Math.min(compoundsPerYear, totalPeriods - (year - 1) * compoundsPerYear);

      for (let period = 0; period < periodsThisYear; period++) {
        currentBalance += currentBalance * periodRate;
        if (period === 0) currentBalance += contribPerPeriod * contribsPerYear;
      }

      const yearInterest = currentBalance - yearStart - yearContrib;
      const realBalance = currentBalance / Math.pow(1 + inflationRatePerYear, year);
      breakdown.push({
        year,
        startBalance: yearStart.toFixed(2),
        contribution: yearContrib.toFixed(2),
        interest: yearInterest.toFixed(2),
        endBalance: currentBalance.toFixed(2),
        realBalance: realBalance.toFixed(2),
      });
      chartData.push({ year, balance: currentBalance, realBalance });
    }

    return {
      initialInvestment: initialNum.toFixed(2),
      contribution: contribNum.toFixed(2),
      contributionFrequency,
      interestRate: rateNum.toFixed(2),
      years: yearsNum,
      compoundFrequency,
      inflationRate: inflationNum.toFixed(2),
      totalValue: totalValue.toFixed(2),
      totalContributed: totalContributed.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      realValue: realValue.toFixed(2),
      breakdown,
      chartData,
    };
  }, [initialInvestment, contribution, contributionFrequency, interestRate, years, compoundFrequency, inflationRate]);

  const calculate = () => {
    setError("");
    setResult(null);
    const calcResult = calculateInvestment();
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
  };

  const reset = () => {
    setInitialInvestment("");
    setContribution("");
    setContributionFrequency("monthly");
    setInterestRate("");
    setYears("");
    setCompoundFrequency("yearly");
    setInflationRate("");
    setResult(null);
    setError("");
    setShowDetails(false);
    setShowChart(false);
  };

  const downloadCSV = () => {
    if (!result) return;
    const headers = "Year,Start Balance,Contribution,Interest,End Balance,Real Balance (Inflation Adjusted)\n";
    const csv = result.breakdown.reduce((acc, row) => {
      return acc + `${row.year},${row.startBalance},${row.contribution},${row.interest},${row.endBalance},${row.realBalance}\n`;
    }, headers);
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `investment_breakdown_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Investment Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Initial Investment ($)", value: initialInvestment, setter: setInitialInvestment, placeholder: "e.g., 1000" },
              { label: "Contribution ($)", value: contribution, setter: setContribution, placeholder: "e.g., 100" },
              { label: "Annual Interest Rate (%)", value: interestRate, setter: setInterestRate, placeholder: "e.g., 5" },
              { label: "Years", value: years, setter: setYears, placeholder: "e.g., 10", min: 1 },
              { label: "Inflation Rate (%)", value: inflationRate, setter: setInflationRate, placeholder: "e.g., 2" },
            ].map(({ label, value, setter, placeholder, min }) => (
              <div key={label} className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="number"
                  step="0.01"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={placeholder}
                  min={min || 0}
                />
              </div>
            ))}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Contribution Frequency</label>
              <select
                value={contributionFrequency}
                onChange={(e) => setContributionFrequency(e.target.value)}
                className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Compound Frequency</label>
              <select
                value={compoundFrequency}
                onChange={(e) => setCompoundFrequency(e.target.value)}
                className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="yearly">Yearly</option>
                <option value="quarterly">Quarterly</option>
                <option value="monthly">Monthly</option>
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
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
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
              <h2 className="text-lg font-semibold text-gray-700 text-center">Investment Results</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                <p><strong>Future Value:</strong> ${result.totalValue}</p>
                <p><strong>Real Value (Inflation Adjusted):</strong> ${result.realValue}</p>
                <p><strong>Total Contributed:</strong> ${result.totalContributed}</p>
                <p><strong>Total Interest:</strong> ${result.totalInterest}</p>
              </div>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showDetails ? "Hide Details" : "Show Details"}
                </button>
                <button
                  onClick={() => setShowChart(!showChart)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showChart ? "Hide Chart" : "Show Chart"}
                </button>
                <button
                  onClick={downloadCSV}
                  className="text-sm text-blue-600 hover:underline flex items-center"
                >
                  <FaDownload className="mr-1" /> Download CSV
                </button>
              </div>
            </div>

            {/* Detailed Breakdown */}
            {showDetails && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Detailed Breakdown</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Input Summary:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      <li>Initial Investment: ${result.initialInvestment}</li>
                      <li>{result.contributionFrequency} Contribution: ${result.contribution}</li>
                      <li>Annual Interest Rate: {result.interestRate}%</li>
                      <li>Years: {result.years}</li>
                      <li>Inflation Rate: {result.inflationRate}%</li>
                      <li>Compound Frequency: {result.compoundFrequency} ({compoundFrequencies[result.compoundFrequency]} times/year)</li>
                    </ul>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 border">Year</th>
                          <th className="p-2 border">Start</th>
                          <th className="p-2 border">Contrib</th>
                          <th className="p-2 border">Interest</th>
                          <th className="p-2 border">End</th>
                          <th className="p-2 border">Real End</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.breakdown.map((yearData) => (
                          <tr key={yearData.year}>
                            <td className="p-2 border text-center">{yearData.year}</td>
                            <td className="p-2 border text-center">${yearData.startBalance}</td>
                            <td className="p-2 border text-center">${yearData.contribution}</td>
                            <td className="p-2 border text-center">${yearData.interest}</td>
                            <td className="p-2 border text-center">${yearData.endBalance}</td>
                            <td className="p-2 border text-center">${yearData.realBalance}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Chart */}
            {showChart && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Growth Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={result.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Line type="monotone" dataKey="balance" stroke="#8884d8" name="Nominal Value" />
                    <Line type="monotone" dataKey="realBalance" stroke="#82ca9d" name="Real Value (Inflation Adjusted)" />
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
            <li>Calculate future value with regular contributions</li>
            <li>Adjustable contribution and compound frequencies</li>
            <li>Inflation adjustment for real value</li>
            <li>Detailed yearly breakdown</li>
            <li>Interactive growth chart</li>
            <li>Download results as CSV</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InvestmentCalculator;