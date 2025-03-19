"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaChartPie, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading results

const CarLoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(25000);
  const [interestRate, setInterestRate] = useState(5);
  const [loanTerm, setLoanTerm] = useState(60); // in months
  const [downPayment, setDownPayment] = useState(0);
  const [tradeInValue, setTradeInValue] = useState(0);
  const [salesTaxRate, setSalesTaxRate] = useState(0); // in percentage
  const [results, setResults] = useState(null);
  const [showAmortization, setShowAmortization] = useState(false);
  const resultRef = React.useRef(null);

  // Calculate loan details
  const calculateLoan = useCallback(() => {
    const principal = loanAmount - downPayment - tradeInValue;
    const taxAmount = (loanAmount * salesTaxRate) / 100;
    const totalLoanAmount = principal + taxAmount;
    const monthlyInterest = interestRate / 100 / 12;
    const numberOfPayments = loanTerm;

    // Monthly payment formula: P[r(1+r)^n]/[(1+r)^n - 1]
    const monthlyPayment =
      totalLoanAmount *
      (monthlyInterest * Math.pow(1 + monthlyInterest, numberOfPayments)) /
      (Math.pow(1 + monthlyInterest, numberOfPayments) - 1);

    const totalCost = monthlyPayment * numberOfPayments;
    const totalInterest = totalCost - totalLoanAmount;

    // Amortization schedule
    let balance = totalLoanAmount;
    const amortization = [];
    for (let i = 0; i < numberOfPayments; i++) {
      const interestPayment = balance * monthlyInterest;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      amortization.push({
        month: i + 1,
        payment: monthlyPayment.toFixed(2),
        principal: principalPayment.toFixed(2),
        interest: interestPayment.toFixed(2),
        balance: Math.max(0, balance).toFixed(2),
      });
    }

    setResults({
      monthlyPayment: monthlyPayment.toFixed(2),
      totalCost: totalCost.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      totalLoanAmount: totalLoanAmount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      amortization,
    });
  }, [loanAmount, interestRate, loanTerm, downPayment, tradeInValue, salesTaxRate]);

  useEffect(() => {
    calculateLoan();
  }, [calculateLoan]);

  // Reset all inputs
  const reset = () => {
    setLoanAmount(25000);
    setInterestRate(5);
    setLoanTerm(60);
    setDownPayment(0);
    setTradeInValue(0);
    setSalesTaxRate(0);
    setShowAmortization(false);
  };

  // Download results as image
  const downloadResults = () => {
    if (resultRef.current) {
      html2canvas(resultRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `car-loan-results-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Car Loan Calculator
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            { label: "Loan Amount ($)", value: loanAmount, setter: setLoanAmount, min: 1000, step: 100 },
            { label: "Annual Interest Rate (%)", value: interestRate, setter: setInterestRate, min: 0, max: 20, step: 0.1 },
            { label: "Loan Term (months)", value: loanTerm, setter: setLoanTerm, min: 12, max: 84, step: 12 },
            { label: "Down Payment ($)", value: downPayment, setter: setDownPayment, min: 0, step: 100 },
            { label: "Trade-In Value ($)", value: tradeInValue, setter: setTradeInValue, min: 0, step: 100 },
            { label: "Sales Tax Rate (%)", value: salesTaxRate, setter: setSalesTaxRate, min: 0, max: 15, step: 0.1 },
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
        </div>

        {/* Results Section */}
        {results && (
          <div ref={resultRef} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Loan Summary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p>
                  Monthly Payment: <span className="font-bold text-green-600">${Number(results.monthlyPayment).toLocaleString()}</span>
                </p>
                <p>
                  Total Loan Amount: <span className="font-medium">${Number(results.totalLoanAmount).toLocaleString()}</span>
                </p>
                <p>
                  Total Interest Paid: <span className="font-medium">${Number(results.totalInterest).toLocaleString()}</span>
                </p>
                <p>
                  Total Cost of Loan: <span className="font-medium">${Number(results.totalCost).toLocaleString()}</span>
                </p>
                <p>
                  Sales Tax: <span className="font-medium">${Number(results.taxAmount).toLocaleString()}</span>
                </p>
              </div>
            </div>

            {/* Amortization Schedule */}
            <div>
              <button
                onClick={() => setShowAmortization(!showAmortization)}
                className="flex items-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaChartPie /> {showAmortization ? "Hide" : "Show"} Amortization Schedule
              </button>
              {showAmortization && (
                <div className="mt-4 max-h-64 overflow-y-auto bg-gray-50 p-4 rounded-md">
                  <table className="w-full text-sm text-gray-700">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="p-2 text-left">Month</th>
                        <th className="p-2 text-right">Payment</th>
                        <th className="p-2 text-right">Principal</th>
                        <th className="p-2 text-right">Interest</th>
                        <th className="p-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.amortization.map((row) => (
                        <tr key={row.month} className="border-t">
                          <td className="p-2">{row.month}</td>
                          <td className="p-2 text-right">${row.payment}</td>
                          <td className="p-2 text-right">${row.principal}</td>
                          <td className="p-2 text-right">${row.interest}</td>
                          <td className="p-2 text-right">${row.balance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          <button
            onClick={downloadResults}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            disabled={!results}
          >
            <FaDownload className="mr-2" /> Download Results
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 mt-4">
          Note: This calculator provides estimates only. Actual loan terms may vary based on credit score, taxes, fees, and lender policies. Consult your lender for exact figures.
        </p>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate monthly payments and total costs</li>
            <li>Include down payment, trade-in value, and sales tax</li>
            <li>Detailed amortization schedule</li>
            <li>Download results as PNG</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CarLoanCalculator;