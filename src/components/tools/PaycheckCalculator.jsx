"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCalculator, FaSync } from "react-icons/fa";

const PaycheckCalculator = () => {
  const [payType, setPayType] = useState("hourly"); // 'hourly' or 'salary'
  const [hourlyRate, setHourlyRate] = useState(15);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [overtimeRate, setOvertimeRate] = useState(1.5); // Multiplier for overtime
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [annualSalary, setAnnualSalary] = useState(30000);
  const [payFrequency, setPayFrequency] = useState("biweekly"); // 'weekly', 'biweekly', 'semimonthly', 'monthly'
  const [federalTax, setFederalTax] = useState(10); // Percentage
  const [stateTax, setStateTax] = useState(5); // Percentage
  const [otherDeductions, setOtherDeductions] = useState(0); // Flat amount
  const [retirementContribution, setRetirementContribution] = useState(0); // Percentage
  const [results, setResults] = useState(null);

  const calculatePaycheck = useCallback(() => {
    let grossPayPerPeriod;

    // Calculate gross pay based on pay type
    if (payType === "hourly") {
      const regularWeeklyGross = hourlyRate * Math.min(hoursPerWeek, 40);
      const overtimeWeeklyGross =
        overtimeHours > 0 ? hourlyRate * overtimeRate * overtimeHours : 0;
      const weeklyGross = regularWeeklyGross + overtimeWeeklyGross;

      if (payFrequency === "weekly") {
        grossPayPerPeriod = weeklyGross;
      } else if (payFrequency === "biweekly") {
        grossPayPerPeriod = weeklyGross * 2;
      } else if (payFrequency === "semimonthly") {
        grossPayPerPeriod = (weeklyGross * 52) / 24;
      } else if (payFrequency === "monthly") {
        grossPayPerPeriod = (weeklyGross * 52) / 12;
      }
    } else {
      // Salary
      if (payFrequency === "weekly") {
        grossPayPerPeriod = annualSalary / 52;
      } else if (payFrequency === "biweekly") {
        grossPayPerPeriod = annualSalary / 26;
      } else if (payFrequency === "semimonthly") {
        grossPayPerPeriod = annualSalary / 24;
      } else if (payFrequency === "monthly") {
        grossPayPerPeriod = annualSalary / 12;
      }
    }

    // Calculate deductions
    const federalTaxAmount = grossPayPerPeriod * (federalTax / 100);
    const stateTaxAmount = grossPayPerPeriod * (stateTax / 100);
    const retirementAmount = grossPayPerPeriod * (retirementContribution / 100);
    const totalDeductions =
      federalTaxAmount + stateTaxAmount + retirementAmount + Number(otherDeductions);
    const netPay = grossPayPerPeriod - totalDeductions;

    setResults({
      grossPay: grossPayPerPeriod.toFixed(2),
      federalTax: federalTaxAmount.toFixed(2),
      stateTax: stateTaxAmount.toFixed(2),
      retirementContribution: retirementAmount.toFixed(2),
      otherDeductions: Number(otherDeductions).toFixed(2),
      netPay: netPay.toFixed(2),
    });
  }, [
    payType,
    hourlyRate,
    hoursPerWeek,
    overtimeRate,
    overtimeHours,
    annualSalary,
    payFrequency,
    federalTax,
    stateTax,
    retirementContribution,
    otherDeductions,
  ]);

  useEffect(() => {
    calculatePaycheck();
  }, [calculatePaycheck]);

  const reset = () => {
    setPayType("hourly");
    setHourlyRate(15);
    setHoursPerWeek(40);
    setOvertimeRate(1.5);
    setOvertimeHours(0);
    setAnnualSalary(30000);
    setPayFrequency("biweekly");
    setFederalTax(10);
    setStateTax(5);
    setRetirementContribution(0);
    setOtherDeductions(0);
    setResults(null);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Paycheck Calculator
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {/* Pay Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pay Type</label>
            <select
              value={payType}
              onChange={(e) => setPayType(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="hourly">Hourly</option>
              <option value="salary">Salary</option>
            </select>
          </div>

          {/* Pay Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pay Frequency</label>
            <select
              value={payFrequency}
              onChange={(e) => setPayFrequency(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Biweekly</option>
              <option value="semimonthly">Semimonthly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Hourly Inputs */}
          {payType === "hourly" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Math.max(0, Number(e.target.value)))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hours/Week
                </label>
                <input
                  type="number"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Math.max(0, Math.min(168, Number(e.target.value))))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="168"
                  step="0.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overtime Rate (x)
                </label>
                <input
                  type="number"
                  value={overtimeRate}
                  onChange={(e) => setOvertimeRate(Math.max(1, Number(e.target.value)))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  min="1"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overtime Hours/Week
                </label>
                <input
                  type="number"
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(Math.max(0, Number(e.target.value)))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.5"
                />
              </div>
            </>
          )}

          {/* Salary Input */}
          {payType === "salary" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Salary ($)
              </label>
              <input
                type="number"
                value={annualSalary}
                onChange={(e) => setAnnualSalary(Math.max(0, Number(e.target.value)))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min="0"
                step="100"
              />
            </div>
          )}

          {/* Tax and Deductions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Federal Tax Rate (%)
            </label>
            <input
              type="number"
              value={federalTax}
              onChange={(e) => setFederalTax(Math.max(0, Math.min(100, Number(e.target.value))))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State Tax Rate (%)
            </label>
            <input
              type="number"
              value={stateTax}
              onChange={(e) => setStateTax(Math.max(0, Math.min(100, Number(e.target.value))))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Retirement Contribution (%)
            </label>
            <input
              type="number"
              value={retirementContribution}
              onChange={(e) =>
                setRetirementContribution(Math.max(0, Math.min(100, Number(e.target.value))))
              }
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Other Deductions ($)
            </label>
            <input
              type="number"
              value={otherDeductions}
              onChange={(e) => setOtherDeductions(Math.max(0, Number(e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="1"
            />
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Paycheck Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm">
                  Gross Pay ({payFrequency}):{" "}
                  <span className="font-bold text-blue-600">
                    ${Number(results.grossPay).toLocaleString()}
                  </span>
                </p>
                <p className="text-sm">
                  Federal Tax:{" "}
                  <span className="font-medium text-red-500">
                    ${Number(results.federalTax).toLocaleString()}
                  </span>
                </p>
                <p className="text-sm">
                  State Tax:{" "}
                  <span className="font-medium text-red-500">
                    ${Number(results.stateTax).toLocaleString()}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm">
                  Retirement Contribution:{" "}
                  <span className="font-medium text-red-500">
                    ${Number(results.retirementContribution).toLocaleString()}
                  </span>
                </p>
                <p className="text-sm">
                  Other Deductions:{" "}
                  <span className="font-medium text-red-500">
                    ${Number(results.otherDeductions).toLocaleString()}
                  </span>
                </p>
                <p className="text-lg">
                  Net Pay:{" "}
                  <span className="font-bold text-green-600">
                    ${Number(results.netPay).toLocaleString()}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={calculatePaycheck}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Calculate
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Notes */}
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-700">
            <strong>Note:</strong> This is a simplified calculator. Actual take-home pay may vary
            due to additional taxes, benefits, or local regulations.
          </p>
        </div>

        {/* Features */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports hourly and salary calculations</li>
            <li>Multiple pay frequencies: Weekly, Biweekly, Semimonthly, Monthly</li>
            <li>Overtime calculation for hourly workers</li>
            <li>Customizable tax rates and deductions</li>
            <li>Retirement contribution option</li>
            <li>Real-time results with responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaycheckCalculator;