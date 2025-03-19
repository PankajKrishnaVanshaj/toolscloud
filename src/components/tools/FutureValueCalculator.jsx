"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaChartPie } from "react-icons/fa";
import { Pie } from "react-chartjs-2"; // For pie chart visualization
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const FutureValueCalculator = () => {
  const [initialAmount, setInitialAmount] = useState(1000);
  const [regularContribution, setRegularContribution] = useState(100);
  const [interestRate, setInterestRate] = useState(5);
  const [years, setYears] = useState(10);
  const [contributionFrequency, setContributionFrequency] = useState("monthly");
  const [compoundFrequency, setCompoundFrequency] = useState("yearly");
  const [inflationRate, setInflationRate] = useState(0);
  const [result, setResult] = useState(null);
  const [showChart, setShowChart] = useState(false);

  const calculateFutureValue = useCallback(() => {
    const principal = Number(initialAmount) || 0;
    const rate = Number(interestRate) / 100 || 0;
    const inflation = Number(inflationRate) / 100 || 0;
    const time = Number(years) || 0;
    const periodsPerYear =
      contributionFrequency === "monthly" ? 12 : contributionFrequency === "quarterly" ? 4 : 1;
    const compoundPeriods =
      compoundFrequency === "monthly" ? 12 : compoundFrequency === "quarterly" ? 4 : 1;
    const contribution = Number(regularContribution) || 0;
    const totalPeriods = time * periodsPerYear;
    const compoundTotalPeriods = time * compoundPeriods;

    // Future value of initial amount with compounding
    const fvInitial = principal * Math.pow(1 + rate / compoundPeriods, compoundTotalPeriods);

    // Future value of regular contributions
    const fvContributions =
      contribution *
      ((Math.pow(1 + rate / compoundPeriods, totalPeriods) - 1) /
        (rate / compoundPeriods)) *
      (compoundPeriods / periodsPerYear);

    const totalFV = fvInitial + fvContributions;

    // Adjust for inflation
    const inflationAdjustedFV = totalFV / Math.pow(1 + inflation, time);

    setResult({
      total: totalFV.toFixed(2),
      initialFV: fvInitial.toFixed(2),
      contributionFV: fvContributions.toFixed(2),
      totalContributions: (contribution * totalPeriods).toFixed(2),
      inflationAdjusted: inflationAdjustedFV.toFixed(2),
    });
  }, [
    initialAmount,
    regularContribution,
    interestRate,
    years,
    contributionFrequency,
    compoundFrequency,
    inflationRate,
  ]);

  useEffect(() => {
    calculateFutureValue();
  }, [calculateFutureValue]);

  const reset = () => {
    setInitialAmount(1000);
    setRegularContribution(100);
    setInterestRate(5);
    setYears(10);
    setContributionFrequency("monthly");
    setCompoundFrequency("yearly");
    setInflationRate(0);
    setShowChart(false);
  };

  // Pie chart data
  const chartData = {
    labels: ["Initial Investment", "Contributions", "Interest Earned"],
    datasets: [
      {
        data: result
          ? [
              Number(result.initialFV),
              Number(result.totalContributions),
              Number(result.total) - Number(result.initialFV) - Number(result.totalContributions),
            ]
          : [0, 0, 0],
        backgroundColor: ["#34D399", "#3B82F6", "#FBBF24"],
        hoverBackgroundColor: ["#2CA87F", "#2563EB", "#F59E0B"],
      },
    ],
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Future Value Calculator
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Initial Investment ($)",
              value: initialAmount,
              setter: setInitialAmount,
              min: 0,
              step: 100,
            },
            {
              label: "Regular Contribution ($)",
              value: regularContribution,
              setter: setRegularContribution,
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
            {
              label: "Inflation Rate (%)",
              value: inflationRate,
              setter: setInflationRate,
              min: 0,
              max: 10,
              step: 0.1,
            },
          ].map(({ label, value, setter, min, max, step }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min={min}
                max={max}
                step={step}
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contribution Frequency
            </label>
            <select
              value={contributionFrequency}
              onChange={(e) => setContributionFrequency(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compound Frequency
            </label>
            <select
              value={compoundFrequency}
              onChange={(e) => setCompoundFrequency(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2 text-center">Future Value Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p>
                  Total Future Value:{" "}
                  <span className="font-bold text-green-600">
                    ${Number(result.total).toLocaleString()}
                  </span>
                </p>
                <p>
                  Inflation-Adjusted Value:{" "}
                  <span className="font-bold text-blue-600">
                    ${Number(result.inflationAdjusted).toLocaleString()}
                  </span>
                </p>
                <p>
                  From Initial Investment:{" "}
                  <span className="font-medium">
                    ${Number(result.initialFV).toLocaleString()}
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  From Contributions:{" "}
                  <span className="font-medium">
                    ${Number(result.contributionFV).toLocaleString()}
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
                  <span className="font-medium">
                    $
                    {(
                      Number(result.total) -
                      Number(result.initialFV) -
                      Number(result.totalContributions)
                    ).toLocaleString()}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Chart Toggle and Visualization */}
        {result && (
          <div className="mb-6">
            <button
              onClick={() => setShowChart(!showChart)}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
            >
              <FaChartPie className="mr-2" />
              {showChart ? "Hide Chart" : "Show Chart"}
            </button>
            {showChart && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow-inner">
                <Pie
                  data={chartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "top" },
                      tooltip: {
                        callbacks: {
                          label: (context) =>
                            `${context.label}: $${context.raw.toLocaleString()}`,
                        },
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Reset Button */}
        <button
          onClick={reset}
          className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
        >
          <FaSync className="mr-2" /> Reset
        </button>

        {/* Notes */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: Assumes compound interest and regular contributions. Actual results may vary due to
          market conditions, fees, and taxes.
        </p>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculates future value with regular contributions</li>
            <li>Adjustable contribution and compound frequencies</li>
            <li>Inflation adjustment option</li>
            <li>Visual breakdown with pie chart</li>
            <li>Real-time updates</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FutureValueCalculator;