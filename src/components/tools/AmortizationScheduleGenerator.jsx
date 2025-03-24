"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaSync } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the schedule

const AmortizationScheduleGenerator = () => {
  const [loanAmount, setLoanAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [extraPayment, setExtraPayment] = useState(0); // New feature
  const [schedule, setSchedule] = useState([]);
  const [monthlyPayment, setMonthlyPayment] = useState(null);
  const [showFullSchedule, setShowFullSchedule] = useState(false); // Toggle for full table
  const scheduleRef = React.useRef(null);

  const calculateSchedule = useCallback(() => {
    const principal = parseFloat(loanAmount);
    const monthlyRate = parseFloat(interestRate) / 100 / 12;
    const termMonths = parseFloat(loanTerm) * 12;
    const extra = parseFloat(extraPayment) || 0;

    // Calculate monthly payment: P[r(1+r)^n]/[(1+r)^n-1]
    const basePayment =
      principal *
      (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
    const totalPayment = basePayment + extra;
    setMonthlyPayment(basePayment.toFixed(2));

    let balance = principal;
    const newSchedule = [];
    let totalInterest = 0;

    for (let i = 1; i <= termMonths && balance > 0; i++) {
      const interest = balance * monthlyRate;
      let principalPayment = basePayment - interest;
      balance -= principalPayment;

      if (extra > 0 && balance > 0) {
        const additionalPrincipal = Math.min(extra, balance);
        balance -= additionalPrincipal;
        principalPayment += additionalPrincipal;
      }

      totalInterest += interest;

      newSchedule.push({
        paymentNumber: i,
        payment: (balance > 0 ? totalPayment : principalPayment + interest).toFixed(2),
        principal: principalPayment.toFixed(2),
        interest: interest.toFixed(2),
        balance: balance > 0 ? balance.toFixed(2) : 0,
      });

      if (balance <= 0) break; // Stop when loan is paid off
    }

    setSchedule(newSchedule);
  }, [loanAmount, interestRate, loanTerm, extraPayment]);

  const handleCalculate = (e) => {
    e.preventDefault();
    calculateSchedule();
  };

  const reset = () => {
    setLoanAmount(100000);
    setInterestRate(5);
    setLoanTerm(30);
    setExtraPayment(0);
    setSchedule([]);
    setMonthlyPayment(null);
    setShowFullSchedule(false);
  };

  const downloadSchedule = () => {
    if (scheduleRef.current) {
      html2canvas(scheduleRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `amortization-schedule-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  const totalInterest = schedule.reduce((sum, item) => sum + parseFloat(item.interest), 0);
  const totalPaid = schedule.reduce((sum, item) => sum + parseFloat(item.payment), 0);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Amortization Schedule Generator
        </h1>

        {/* Input Form */}
        <form onSubmit={handleCalculate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount ($)</label>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Math.max(1000, e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="1000"
              step="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(Math.max(0.1, Math.min(20, e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0.1"
              max="20"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Term (Years)</label>
            <input
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(Math.max(1, Math.min(50, e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="1"
              max="50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Extra Payment ($)</label>
            <input
              type="number"
              value={extraPayment}
              onChange={(e) => setExtraPayment(Math.max(0, e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="10"
            />
          </div>
          <div className="lg:col-span-4 flex flex-col sm:flex-row gap-4 justify-center mt-2">
            <button
              type="submit"
              className="flex-1 py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Generate Schedule
            </button>
            <button
              onClick={reset}
              type="button"
              className="flex-1 py-2 px-6 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            {schedule.length > 0 && (
              <button
                onClick={downloadSchedule}
                type="button"
                className="flex-1 py-2 px-6 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            )}
          </div>
        </form>

        {/* Results Summary */}
        {monthlyPayment && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-lg font-semibold">
              Monthly Payment: <span className="text-green-600">${monthlyPayment}</span>
              {extraPayment > 0 && (
                <span className="text-blue-600"> + ${extraPayment} Extra</span>
              )}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Total Paid: <span className="text-green-600">${totalPaid.toFixed(2)}</span> | 
              Total Interest: <span className="text-red-600">${totalInterest.toFixed(2)}</span> | 
              Term: <span className="text-blue-600">{schedule.length} months</span>
            </p>
          </div>
        )}

        {/* Schedule Table */}
        {schedule.length > 0 && (
          <div ref={scheduleRef} className="overflow-x-auto">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowFullSchedule(!showFullSchedule)}
                className="px-4 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                {showFullSchedule ? "Show First 12 Months" : "Show Full Schedule"}
              </button>
            </div>
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-xs uppercase bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Payment #</th>
                  <th className="px-4 py-2">Payment</th>
                  <th className="px-4 py-2">Principal</th>
                  <th className="px-4 py-2">Interest</th>
                  <th className="px-4 py-2">Balance</th>
                </tr>
              </thead>
              <tbody>
                {(showFullSchedule ? schedule : schedule.slice(0, 12)).map((item) => (
                  <tr key={item.paymentNumber} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{item.paymentNumber}</td>
                    <td className="px-4 py-2">${item.payment}</td>
                    <td className="px-4 py-2">${item.principal}</td>
                    <td className="px-4 py-2">${item.interest}</td>
                    <td className="px-4 py-2">${item.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!schedule.length && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 italic">
              Enter loan details and click "Generate Schedule" to see the amortization table.
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate monthly payments and full amortization schedule</li>
            <li>Support for extra payments to reduce loan term</li>
            <li>Download schedule as PNG</li>
            <li>Toggle between full schedule and first 12 months</li>
            <li>Detailed summary with total paid and interest</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Note: This is a basic amortization calculator. Actual payments may vary due to rounding, 
          additional fees, or variable rates.
        </p>
      </div>
    </div>
  );
};

export default AmortizationScheduleGenerator;