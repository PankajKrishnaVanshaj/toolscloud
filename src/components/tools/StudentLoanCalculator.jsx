"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const StudentLoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(20000);
  const [interestRate, setInterestRate] = useState(5);
  const [loanTerm, setLoanTerm] = useState(10);
  const [extraPayment, setExtraPayment] = useState(0);
  const [calculationMode, setCalculationMode] = useState("standard"); // standard or amortization
  const [results, setResults] = useState(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);

  const calculateLoan = useCallback(() => {
    const monthlyInterest = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    const principal = Number(loanAmount);
    const extra = Number(extraPayment);

    // Standard monthly payment calculation
    const monthlyPayment =
      (principal * monthlyInterest * Math.pow(1 + monthlyInterest, numberOfPayments)) /
      (Math.pow(1 + monthlyInterest, numberOfPayments) - 1);

    let totalPaid = 0;
    let totalInterest = 0;
    let remainingBalance = principal;
    const schedule = [];

    if (calculationMode === "amortization") {
      // Amortization with extra payments
      let months = 0;
      while (remainingBalance > 0 && months < numberOfPayments) {
        const interestPayment = remainingBalance * monthlyInterest;
        const principalPayment = monthlyPayment + extra - interestPayment;
        remainingBalance = Math.max(0, remainingBalance - principalPayment);
        totalInterest += interestPayment;
        totalPaid += monthlyPayment + extra;

        schedule.push({
          month: months + 1,
          payment: (monthlyPayment + extra).toFixed(2),
          principal: principalPayment.toFixed(2),
          interest: interestPayment.toFixed(2),
          balance: remainingBalance.toFixed(2),
        });
        months++;
      }
      if (remainingBalance > 0) {
        totalPaid += remainingBalance;
        totalInterest += remainingBalance * monthlyInterest;
        schedule.push({
          month: months + 1,
          payment: remainingBalance.toFixed(2),
          principal: remainingBalance.toFixed(2),
          interest: (remainingBalance * monthlyInterest).toFixed(2),
          balance: "0.00",
        });
      }
    } else {
      // Standard calculation
      totalPaid = monthlyPayment * numberOfPayments;
      totalInterest = totalPaid - principal;
    }

    setResults({
      monthlyPayment: monthlyPayment.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      totalMonths: calculationMode === "amortization" ? schedule.length : numberOfPayments,
    });
    setAmortizationSchedule(schedule);
  }, [loanAmount, interestRate, loanTerm, extraPayment, calculationMode]);

  useEffect(() => {
    calculateLoan();
  }, [calculateLoan]);

  const reset = () => {
    setLoanAmount(20000);
    setInterestRate(5);
    setLoanTerm(10);
    setExtraPayment(0);
    setCalculationMode("standard");
  };

  const downloadSchedule = () => {
    if (amortizationSchedule.length === 0) return;

    const csvContent = [
      "Month,Payment,Principal,Interest,Remaining Balance",
      ...amortizationSchedule.map((row) =>
        `${row.month},${row.payment},${row.principal},${row.interest},${row.balance}`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `loan_amortization_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Student Loan Calculator
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loan Amount ($)
            </label>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Math.max(1000, Math.min(1000000, Number(e.target.value))))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="1000"
              max="1000000"
              step="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Rate (%)
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
              Loan Term (Years)
            </label>
            <input
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(Math.max(1, Math.min(30, Number(e.target.value))))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="1"
              max="30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Extra Payment ($)
            </label>
            <input
              type="number"
              value={extraPayment}
              onChange={(e) => setExtraPayment(Math.max(0, Number(e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="10"
            />
          </div>
        </div>

        {/* Calculation Mode */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Calculation Mode
          </label>
          <select
            value={calculationMode}
            onChange={(e) => setCalculationMode(e.target.value)}
            className="w-full sm:w-auto p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="standard">Standard</option>
            <option value="amortization">Amortization with Extra Payments</option>
          </select>
        </div>

        {/* Results */}
        {results && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-4 text-center">Loan Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <p className="flex justify-between">
                <span className="font-medium">Monthly Payment:</span>
                <span className="text-green-600 font-bold">
                  ${Number(results.monthlyPayment).toLocaleString()}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Total Interest Paid:</span>
                <span className="text-red-600">${Number(results.totalInterest).toLocaleString()}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Total Amount Paid:</span>
                <span className="text-blue-600">${Number(results.totalPaid).toLocaleString()}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">
                  {calculationMode === "amortization" ? "Total Months:" : "Number of Payments:"}
                </span>
                <span>{results.totalMonths}</span>
              </p>
            </div>
          </div>
        )}

        {/* Amortization Schedule */}
        {calculationMode === "amortization" && amortizationSchedule.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-center">Amortization Schedule</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-700">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 text-left">Month</th>
                    <th className="p-2 text-left">Payment</th>
                    <th className="p-2 text-left">Principal</th>
                    <th className="p-2 text-left">Interest</th>
                    <th className="p-2 text-left">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {amortizationSchedule.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                      <td className="p-2">{row.month}</td>
                      <td className="p-2">${Number(row.payment).toLocaleString()}</td>
                      <td className="p-2">${Number(row.principal).toLocaleString()}</td>
                      <td className="p-2">${Number(row.interest).toLocaleString()}</td>
                      <td className="p-2">${Number(row.balance).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={downloadSchedule}
              className="mt-4 w-full sm:w-auto py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center mx-auto"
            >
              <FaDownload className="mr-2" /> Download Schedule (CSV)
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
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
            <li>Calculate standard monthly payments</li>
            <li>Amortization schedule with extra payments</li>
            <li>Adjustable loan amount, interest rate, and term</li>
            <li>Downloadable amortization schedule as CSV</li>
            <li>Real-time updates</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentLoanCalculator;