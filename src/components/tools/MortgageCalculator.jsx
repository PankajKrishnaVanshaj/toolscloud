"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaSync } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading result

const MortgageCalculator = () => {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState(""); // In years
  const [downPayment, setDownPayment] = useState(""); // Optional down payment
  const [propertyTax, setPropertyTax] = useState(""); // Annual property tax
  const [insurance, setInsurance] = useState(""); // Annual insurance cost
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showBreakdown, setShowBreakdown] = useState(false);
  const resultRef = React.useRef(null);

  // Calculate mortgage details
  const calculateMortgage = useCallback(
    (principal, annualRate, years, downPay = 0, tax = 0, ins = 0) => {
      const effectivePrincipal = principal - downPay;
      const monthlyRate = annualRate / 100 / 12;
      const totalPayments = years * 12;

      if (effectivePrincipal <= 0) {
        return { error: "Loan amount must exceed down payment" };
      }

      // Monthly payment formula: P * [r(1+r)^n] / [(1+r)^n - 1]
      const monthlyPayment =
        effectivePrincipal *
        (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
        (Math.pow(1 + monthlyRate, totalPayments) - 1);

      if (!isFinite(monthlyPayment)) {
        return { error: "Invalid calculation - check your inputs" };
      }

      const monthlyTax = tax / 12;
      const monthlyInsurance = ins / 12;
      const totalMonthlyPayment = monthlyPayment + monthlyTax + monthlyInsurance;

      const totalPaid = totalMonthlyPayment * totalPayments;
      const totalInterest = totalPaid - effectivePrincipal - tax * years - ins * years;
      const totalPrincipal = effectivePrincipal;

      // Amortization schedule
      const amortization = [];
      let remainingBalance = effectivePrincipal;
      for (let i = 1; i <= totalPayments && remainingBalance > 0; i++) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        remainingBalance -= principalPayment;
        if (remainingBalance < 0) remainingBalance = 0;

        amortization.push({
          paymentNumber: i,
          monthlyPayment: totalMonthlyPayment.toFixed(2),
          principalPayment: principalPayment.toFixed(2),
          interestPayment: interestPayment.toFixed(2),
          taxPayment: monthlyTax.toFixed(2),
          insurancePayment: monthlyInsurance.toFixed(2),
          remainingBalance: remainingBalance.toFixed(2),
        });
      }

      return {
        monthlyPayment: monthlyPayment.toFixed(2),
        totalMonthlyPayment: totalMonthlyPayment.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
        totalPaid: totalPaid.toFixed(2),
        totalPrincipal: totalPrincipal.toFixed(2),
        totalTax: (tax * years).toFixed(2),
        totalInsurance: (ins * years).toFixed(2),
        amortization,
      };
    },
    []
  );

  const calculate = () => {
    setError("");
    setResult(null);

    const principal = parseFloat(loanAmount) || 0;
    const annualRate = parseFloat(interestRate) || 0;
    const years = parseInt(loanTerm) || 0;
    const downPay = parseFloat(downPayment) || 0;
    const tax = parseFloat(propertyTax) || 0;
    const ins = parseFloat(insurance) || 0;

    // Validation
    if (principal <= 0 || years <= 0) {
      setError("Loan amount and term must be positive");
      return;
    }
    if (annualRate < 0 || downPay < 0 || tax < 0 || ins < 0) {
      setError("Interest rate, down payment, tax, and insurance cannot be negative");
      return;
    }

    const calcResult = calculateMortgage(principal, annualRate, years, downPay, tax, ins);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setLoanAmount("");
    setInterestRate("");
    setLoanTerm("");
    setDownPayment("");
    setPropertyTax("");
    setInsurance("");
    setResult(null);
    setError("");
    setShowBreakdown(false);
  };

  const downloadResult = () => {
    if (resultRef.current && result) {
      html2canvas(resultRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `mortgage-calculation-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Mortgage Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Loan Amount ($)", value: loanAmount, setter: setLoanAmount, placeholder: "e.g., 200000" },
              { label: "Interest Rate (%)", value: interestRate, setter: setInterestRate, step: "0.1", placeholder: "e.g., 5.5" },
              { label: "Loan Term (years)", value: loanTerm, setter: setLoanTerm, placeholder: "e.g., 30" },
              { label: "Down Payment ($)", value: downPayment, setter: setDownPayment, placeholder: "e.g., 40000" },
              { label: "Property Tax ($/yr)", value: propertyTax, setter: setPropertyTax, placeholder: "e.g., 2400" },
              { label: "Insurance ($/yr)", value: insurance, setter: setInsurance, placeholder: "e.g., 1200" },
            ].map(({ label, value, setter, step, placeholder }) => (
              <div key={label} className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  step={step}
                  className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            {result && (
              <button
                onClick={downloadResult}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div ref={resultRef} className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Mortgage Details</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <p>Monthly Payment (Loan): ${result.monthlyPayment}</p>
              <p>Total Monthly Payment: ${result.totalMonthlyPayment}</p>
              <p>Total Principal: ${result.totalPrincipal}</p>
              <p>Total Interest: ${result.totalInterest}</p>
              <p>Total Property Tax: ${result.totalTax}</p>
              <p>Total Insurance: ${result.totalInsurance}</p>
              <p>Total Paid: ${result.totalPaid}</p>
            </div>

            {/* Amortization Toggle */}
            <div className="text-center mt-4">
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showBreakdown ? "Hide Amortization" : "Show Amortization"}
              </button>
            </div>

            {showBreakdown && (
              <div className="mt-4 max-h-64 overflow-y-auto text-sm">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 sticky top-0">
                      <th className="p-2 border">Month</th>
                      <th className="p-2 border">Total Payment</th>
                      <th className="p-2 border">Principal</th>
                      <th className="p-2 border">Interest</th>
                      <th className="p-2 border">Tax</th>
                      <th className="p-2 border">Insurance</th>
                      <th className="p-2 border">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.amortization.map((payment) => (
                      <tr key={payment.paymentNumber}>
                        <td className="p-2 border text-center">{payment.paymentNumber}</td>
                        <td className="p-2 border text-center">${payment.monthlyPayment}</td>
                        <td className="p-2 border text-center">${payment.principalPayment}</td>
                        <td className="p-2 border text-center">${payment.interestPayment}</td>
                        <td className="p-2 border text-center">${payment.taxPayment}</td>
                        <td className="p-2 border text-center">${payment.insurancePayment}</td>
                        <td className="p-2 border text-center">${payment.remainingBalance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Includes down payment, property tax, and insurance costs</li>
            <li>Detailed amortization schedule</li>
            <li>Total monthly payment breakdown</li>
            <li>Download result as PNG</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;