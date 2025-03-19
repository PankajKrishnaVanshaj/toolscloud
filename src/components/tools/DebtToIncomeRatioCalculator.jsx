"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaChartPie, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the result

const DebtToIncomeRatioCalculator = () => {
  const [monthlyDebt, setMonthlyDebt] = useState({
    mortgage: 0,
    carLoan: 0,
    creditCard: 0,
    studentLoan: 0,
    other: 0,
  });
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [dtiRatio, setDTIRatio] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const resultRef = React.useRef(null);

  // Calculate DTI
  const calculateDTI = useCallback(() => {
    const totalDebt = Object.values(monthlyDebt).reduce((sum, value) => sum + Number(value), 0);
    const income = Number(monthlyIncome);

    if (income > 0) {
      const ratio = (totalDebt / income) * 100;
      setDTIRatio(ratio.toFixed(2));
    } else {
      setDTIRatio(null);
    }
  }, [monthlyDebt, monthlyIncome]);

  useEffect(() => {
    calculateDTI();
  }, [calculateDTI]);

  // Handle debt input changes
  const handleDebtChange = (field) => (e) => {
    const value = e.target.value >= 0 ? Number(e.target.value) : 0;
    setMonthlyDebt((prev) => ({ ...prev, [field]: value }));
  };

  // Reset all inputs
  const reset = () => {
    setMonthlyDebt({
      mortgage: 0,
      carLoan: 0,
      creditCard: 0,
      studentLoan: 0,
      other: 0,
    });
    setMonthlyIncome(0);
    setDTIRatio(null);
    setShowChart(false);
  };

  // Download result as image
  const downloadResult = () => {
    if (resultRef.current && dtiRatio !== null) {
      html2canvas(resultRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `dti-ratio-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Simple pie chart simulation (using CSS)
  const renderChart = () => {
    const totalDebt = Object.values(monthlyDebt).reduce((sum, val) => sum + val, 0);
    const incomeAfterDebt = monthlyIncome - totalDebt;
    const debtPercentage = dtiRatio ? parseFloat(dtiRatio) : 0;
    const incomePercentage = 100 - debtPercentage;

    return (
      <div className="flex flex-col items-center mt-4">
        <div
          className="w-40 h-40 rounded-full relative overflow-hidden"
          style={{
            background: `conic-gradient(
              #ef4444 ${debtPercentage}%,
              #10b981 ${debtPercentage}% 100%
            )`,
          }}
        >
          <div className="absolute inset-4 bg-white rounded-full"></div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          <p>
            <span className="text-red-500">Debt: {debtPercentage}%</span> |{" "}
            <span className="text-green-500">Income: {incomePercentage}%</span>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Debt-to-Income Ratio Calculator
        </h1>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            { label: "Monthly Mortgage/Rent ($)", field: "mortgage" },
            { label: "Monthly Car Loan ($)", field: "carLoan" },
            { label: "Monthly Credit Card Payments ($)", field: "creditCard" },
            { label: "Monthly Student Loan ($)", field: "studentLoan" },
            { label: "Other Monthly Debt ($)", field: "other" },
            { label: "Monthly Income ($)", field: "income", isIncome: true },
          ].map(({ label, field, isIncome }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="number"
                value={isIncome ? monthlyIncome : monthlyDebt[field]}
                onChange={
                  isIncome
                    ? (e) => setMonthlyIncome(e.target.value >= 0 ? Number(e.target.value) : 0)
                    : handleDebtChange(field)
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
          ))}
        </div>

        {/* Result */}
        {dtiRatio !== null && (
          <div ref={resultRef} className="bg-gray-50 p-4 rounded-lg text-center">
            <h2 className="text-lg font-semibold mb-2">Your DTI Ratio</h2>
            <p className="text-3xl font-bold text-blue-600">{dtiRatio}%</p>
            <div className="mt-2 text-sm text-gray-600">
              {dtiRatio <= 36 ? (
                <p className="text-green-600">Good (≤ 36%): Lenders typically prefer this range</p>
              ) : dtiRatio <= 43 ? (
                <p className="text-yellow-600">Moderate (37-43%): May qualify for some loans</p>
              ) : (
                <p className="text-red-600">High ({`> 43%`}): May face lending restrictions</p>
              )}
            </div>
            {showChart && renderChart()}
          </div>
        )}

        {!dtiRatio && monthlyIncome === 0 && (
          <p className="text-center text-gray-500">
            Enter your monthly income to calculate DTI
          </p>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={() => setShowChart((prev) => !prev)}
            disabled={dtiRatio === null}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaChartPie className="mr-2" />
            {showChart ? "Hide Chart" : "Show Chart"}
          </button>
          <button
            onClick={downloadResult}
            disabled={dtiRatio === null}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download Result
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate DTI based on multiple debt types</li>
            <li>Visual feedback with DTI range assessment</li>
            <li>Pie chart visualization of debt vs. income</li>
            <li>Download result as PNG</li>
            <li>Real-time calculation updates</li>
          </ul>
        </div>

        {/* Note */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: This calculator provides an estimate. Consult a financial advisor for a detailed
          assessment.
        </p>
      </div>
    </div>
  );
};

export default DebtToIncomeRatioCalculator;