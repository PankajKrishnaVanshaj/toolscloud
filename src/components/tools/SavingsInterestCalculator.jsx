"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaChartLine } from "react-icons/fa";
import { Line } from "react-chartjs-2"; // For visualization
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SavingsInterestCalculator = () => {
  const [initialDeposit, setInitialDeposit] = useState(1000);
  const [monthlyContribution, setMonthlyContribution] = useState(100);
  const [interestRate, setInterestRate] = useState(5);
  const [years, setYears] = useState(10);
  const [compoundFrequency, setCompoundFrequency] = useState("monthly");
  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [showChart, setShowChart] = useState(false);

  const calculateSavings = useCallback(() => {
    const periodsPerYear = {
      daily: 365,
      monthly: 12,
      quarterly: 4,
      annually: 1,
    }[compoundFrequency];
    const totalPeriods = years * periodsPerYear;
    const periodRate = interestRate / 100 / periodsPerYear;

    // Future value of initial deposit
    const futureValueInitial = initialDeposit * Math.pow(1 + periodRate, totalPeriods);

    // Future value of periodic contributions
    const futureValueContributions =
      monthlyContribution *
      periodsPerYear *
      ((Math.pow(1 + periodRate, totalPeriods) - 1) / periodRate);

    const total = futureValueInitial + futureValueContributions;
    const totalContributions = initialDeposit + monthlyContribution * periodsPerYear * years;
    const interestEarned = total - totalContributions;

    setResult({
      total: total.toFixed(2),
      totalContributions: totalContributions.toFixed(2),
      interestEarned: interestEarned.toFixed(2),
    });

    // Generate chart data
    const yearlyData = [];
    let balance = initialDeposit;
    for (let year = 0; year <= years; year++) {
      if (year > 0) {
        balance =
          balance * Math.pow(1 + periodRate, periodsPerYear) +
          monthlyContribution * periodsPerYear * ((Math.pow(1 + periodRate, periodsPerYear) - 1) / periodRate);
      }
      yearlyData.push({
        year,
        balance: balance.toFixed(2),
        contributions: (initialDeposit + monthlyContribution * periodsPerYear * year).toFixed(2),
      });
    }

    setChartData({
      labels: yearlyData.map((d) => `Year ${d.year}`),
      datasets: [
        {
          label: "Total Savings",
          data: yearlyData.map((d) => d.balance),
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
        {
          label: "Contributions",
          data: yearlyData.map((d) => d.contributions),
          borderColor: "rgb(255, 99, 132)",
          tension: 0.1,
        },
      ],
    });
  }, [initialDeposit, monthlyContribution, interestRate, years, compoundFrequency]);

  useEffect(() => {
    calculateSavings();
  }, [calculateSavings]);

  const reset = () => {
    setInitialDeposit(1000);
    setMonthlyContribution(100);
    setInterestRate(5);
    setYears(10);
    setCompoundFrequency("monthly");
    setShowChart(false);
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Savings Growth Over Time" },
      tooltip: {
        callbacks: {
          label: (context) => `$${Number(context.parsed.y).toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Savings Interest Calculator
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {[
            {
              label: "Initial Deposit ($)",
              value: initialDeposit,
              setter: setInitialDeposit,
              min: 0,
              step: 100,
            },
            {
              label: "Monthly Contribution ($)",
              value: monthlyContribution,
              setter: setMonthlyContribution,
              min: 0,
              step: 10,
            },
            {
              label: "Annual Interest Rate (%)",
              value: interestRate,
              setter: setInterestRate,
              min: 0,
              max: 20,
              step: 0.1,
            },
            {
              label: "Time Period (Years)",
              value: years,
              setter: setYears,
              min: 1,
              max: 50,
              step: 1,
            },
          ].map(({ label, value, setter, min, max, step }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setter(Number(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min={min}
                max={max}
                step={step}
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compound Frequency
            </label>
            <select
              value={compoundFrequency}
              onChange={(e) => setCompoundFrequency(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-4">Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <p>
                Total Savings:{" "}
                <span className="font-bold text-green-600">
                  ${Number(result.total).toLocaleString()}
                </span>
              </p>
              <p>
                Total Contributions:{" "}
                <span className="font-medium">
                  ${Number(result.totalContributions).toLocaleString()}
                </span>
              </p>
              <p>
                Interest Earned:{" "}
                <span className="font-medium text-blue-600">
                  ${Number(result.interestEarned).toLocaleString()}
                </span>
              </p>
              <p>
                Time Period: <span className="font-medium">{years} years</span>
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => setShowChart(!showChart)}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaChartLine className="mr-2" /> {showChart ? "Hide" : "Show"} Chart
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Chart */}
        {showChart && chartData && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}

        {/* Notes */}
        <p className="text-xs text-gray-500">
          Note: This calculator assumes constant contributions and interest rate with{" "}
          {compoundFrequency} compounding. Actual results may vary due to fees, taxes, and market
          conditions.
        </p>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable initial deposit and monthly contributions</li>
            <li>Adjustable interest rate and time period</li>
            <li>Multiple compounding frequencies (daily, monthly, quarterly, annually)</li>
            <li>Real-time results with detailed breakdown</li>
            <li>Interactive growth chart</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SavingsInterestCalculator;