"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading results

const AnnuityCalculator = () => {
  const [payment, setPayment] = useState(1000); // Monthly payment
  const [interestRate, setInterestRate] = useState(5); // Annual interest rate in %
  const [years, setYears] = useState(10); // Number of years
  const [frequency, setFrequency] = useState(12); // Payments per year
  const [type, setType] = useState("ordinary"); // Annuity type: ordinary (end) or due (beginning)
  const [results, setResults] = useState(null);
  const calculatorRef = React.useRef(null);

  const calculateAnnuity = useCallback(() => {
    const n = years * frequency; // Total number of payments
    const r = interestRate / 100 / frequency; // Periodic interest rate

    // Future Value of Annuity (FVA)
    let futureValue = payment * ((Math.pow(1 + r, n) - 1) / r);
    // Present Value of Annuity (PVA)
    let presentValue = payment * ((1 - Math.pow(1 + r, -n)) / r);

    // Adjust for annuity due (payments at beginning of period)
    if (type === "due") {
      futureValue *= 1 + r;
      presentValue *= 1 + r;
    }

    const totalPayments = payment * n;
    const totalInterest = futureValue - totalPayments;

    setResults({
      futureValue: futureValue.toFixed(2),
      presentValue: presentValue.toFixed(2),
      totalPayments: totalPayments.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      periods: n,
    });
  }, [payment, interestRate, years, frequency, type]);

  useEffect(() => {
    calculateAnnuity();
  }, [calculateAnnuity]);

  // Reset all inputs
  const reset = () => {
    setPayment(1000);
    setInterestRate(5);
    setYears(10);
    setFrequency(12);
    setType("ordinary");
  };

  // Download results as image
  const downloadResults = () => {
    if (calculatorRef.current) {
      html2canvas(calculatorRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `annuity-calculation-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div
        ref={calculatorRef}
        className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Annuity Calculator
        </h1>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount ($)
            </label>
            <input
              type="number"
              value={payment}
              onChange={(e) => setPayment(Math.max(0, Number(e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Interest Rate (%)
            </label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(Math.max(0, Math.min(20, Number(e.target.value))))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              max="20"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Years
            </label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(Math.max(1, Math.min(50, Number(e.target.value))))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="1"
              max="50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Annually</option>
              <option value={4}>Quarterly</option>
              <option value={12}>Monthly</option>
              <option value={52}>Weekly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annuity Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="ordinary">Ordinary (End of Period)</option>
              <option value="due">Due (Beginning of Period)</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p>
                  Future Value:{" "}
                  <span className="font-bold text-green-600">
                    ${Number(results.futureValue).toLocaleString()}
                  </span>
                </p>
                <p>
                  Present Value:{" "}
                  <span className="font-bold text-blue-600">
                    ${Number(results.presentValue).toLocaleString()}
                  </span>
                </p>
              </div>
              <div>
                <p>
                  Total Payments:{" "}
                  <span className="font-medium">
                    ${Number(results.totalPayments).toLocaleString()}
                  </span>
                </p>
                <p>
                  Total Interest Earned:{" "}
                  <span className="font-medium text-purple-600">
                    ${Number(results.totalInterest).toLocaleString()}
                  </span>
                </p>
                <p>
                  Total Periods: <span className="font-medium">{results.periods}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          <button
            onClick={downloadResults}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download Results
          </button>
        </div>

        {/* Notes */}
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">
            <strong>Note:</strong> Assumes fixed payments and interest rate. Results are estimates and may vary due to compounding variations, fees, or taxes. Consult a financial advisor for professional advice.
          </p>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculates Future and Present Value</li>
            <li>Supports multiple payment frequencies (Annual, Quarterly, Monthly, Weekly)</li>
            <li>Annuity type: Ordinary or Due</li>
            <li>Total interest earned calculation</li>
            <li>Download results as PNG</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnnuityCalculator;