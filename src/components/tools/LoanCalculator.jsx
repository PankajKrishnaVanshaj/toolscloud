"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading results

const LoanCalculator = () => {
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [extraPayment, setExtraPayment] = useState(""); // New: Extra monthly payment
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const resultRef = React.useRef(null);

  // Calculate loan details
  const calculateLoan = useCallback((principalAmt, rate, termYears, extra = 0) => {
    const principalNum = parseFloat(principalAmt);
    const annualRateNum = parseFloat(rate);
    const yearsNum = parseInt(termYears);
    const extraNum = parseFloat(extra) || 0;

    if (isNaN(principalNum) || isNaN(annualRateNum) || isNaN(yearsNum)) {
      return { error: "Please enter valid numbers" };
    }
    if (principalNum <= 0 || annualRateNum < 0 || yearsNum <= 0 || extraNum < 0) {
      return { error: "Principal and term must be positive, rates and extra payment cannot be negative" };
    }

    const monthlyRate = annualRateNum / 100 / 12;
    const totalPayments = yearsNum * 12;
    const monthlyPaymentBase = principalNum * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
                              (Math.pow(1 + monthlyRate, totalPayments) - 1);

    if (!isFinite(monthlyPaymentBase) || monthlyPaymentBase <= 0) {
      return { error: "Invalid calculation - check your inputs (rate may be too high)" };
    }

    // Amortization with extra payments
    const amortization = [];
    let remainingBalance = principalNum;
    let totalInterest = 0;
    let totalPaid = 0;
    let months = 0;

    while (remainingBalance > 0 && months < totalPayments) {
      months++;
      const interestPayment = remainingBalance * monthlyRate;
      const totalPayment = Math.min(monthlyPaymentBase + extraNum, remainingBalance + interestPayment);
      const principalPayment = totalPayment - interestPayment;

      remainingBalance -= principalPayment;
      totalInterest += interestPayment;
      totalPaid += totalPayment;

      if (remainingBalance < 0) remainingBalance = 0;

      amortization.push({
        month: months,
        monthlyPayment: totalPayment.toFixed(2),
        principalPayment: principalPayment.toFixed(2),
        interestPayment: interestPayment.toFixed(2),
        remainingBalance: remainingBalance.toFixed(2),
      });
    }

    const totalPaidBase = monthlyPaymentBase * totalPayments;
    const totalInterestBase = totalPaidBase - principalNum;

    return {
      principal: principalNum.toFixed(2),
      interestRate: annualRateNum.toFixed(2),
      loanTerm: yearsNum,
      monthlyPaymentBase: monthlyPaymentBase.toFixed(2),
      totalPaidBase: totalPaidBase.toFixed(2),
      totalInterestBase: totalInterestBase.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      monthsSaved: totalPayments - months,
      amortization,
    };
  }, []);

  const calculate = () => {
    setError("");
    setResult(null);

    if (!principal || !interestRate || !loanTerm) {
      setError("Please fill in all required fields");
      return;
    }

    const calcResult = calculateLoan(principal, interestRate, loanTerm, extraPayment);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setPrincipal("");
    setInterestRate("");
    setLoanTerm("");
    setExtraPayment("");
    setResult(null);
    setError("");
    setShowDetails(false);
  };

  const downloadResults = () => {
    if (resultRef.current) {
      html2canvas(resultRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `loan-calculation-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Loan Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Term (years)
              </label>
              <input
                type="number"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Extra Payment ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={extraPayment}
                onChange={(e) => setExtraPayment(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 50"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            {result && (
              <button
                onClick={downloadResults}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div ref={resultRef} className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Loan Results</h2>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Monthly Payment (Base):</p>
                  <p className="text-xl font-bold">${result.monthlyPaymentBase}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Paid (Base):</p>
                  <p className="text-xl font-bold">${result.totalPaidBase}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Interest (Base):</p>
                  <p className="text-xl font-bold">${result.totalInterestBase}</p>
                </div>
                {extraPayment && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Total Paid (with Extra):</p>
                      <p className="text-xl font-bold">${result.totalPaid}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Interest (with Extra):</p>
                      <p className="text-xl font-bold">${result.totalInterest}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Months Saved:</p>
                      <p className="text-xl font-bold">{result.monthsSaved}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showDetails ? "Hide Amortization Schedule" : "Show Amortization Schedule"}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-4">
                  <div>
                    <p className="font-semibold">Loan Details:</p>
                    <ul className="list-disc list-inside text-gray-600">
                      <li>Principal: ${result.principal}</li>
                      <li>Annual Interest Rate: {result.interestRate}%</li>
                      <li>Loan Term: {result.loanTerm} years ({result.loanTerm * 12} months)</li>
                      {extraPayment && <li>Extra Monthly Payment: ${extraPayment}</li>}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold">Amortization Schedule:</p>
                    <div className="max-h-64 overflow-y-auto rounded-lg border">
                      <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-gray-100">
                          <tr>
                            <th className="p-2 border text-center">Month</th>
                            <th className="p-2 border text-center">Payment</th>
                            <th className="p-2 border text-center">Principal</th>
                            <th className="p-2 border text-center">Interest</th>
                            <th className="p-2 border text-center">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.amortization.map((monthData) => (
                            <tr key={monthData.month} className="hover:bg-gray-50">
                              <td className="p-2 border text-center">{monthData.month}</td>
                              <td className="p-2 border text-center">${monthData.monthlyPayment}</td>
                              <td className="p-2 border text-center">${monthData.principalPayment}</td>
                              <td className="p-2 border text-center">${monthData.interestPayment}</td>
                              <td className="p-2 border text-center">${monthData.remainingBalance}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate monthly payments and total interest</li>
            <li>Optional extra payments to see savings</li>
            <li>Detailed amortization schedule</li>
            <li>Download results as PNG</li>
            <li>Real-time input validation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;