"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";

const SalaryCalculator = () => {
  const [mode, setMode] = useState("hourlyToAnnual");
  const [hourlyRate, setHourlyRate] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [weeksPerYear, setWeeksPerYear] = useState("52");
  const [annualSalary, setAnnualSalary] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [bonus, setBonus] = useState(""); // New: Annual bonus
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [currency, setCurrency] = useState("USD"); // New: Currency selection

  // Calculate salary
  const calculateSalary = useCallback(() => {
    setError("");
    setResult(null);

    const hourlyNum = parseFloat(hourlyRate) || 0;
    const hoursNum = parseFloat(hoursPerWeek) || 0;
    const weeksNum = parseFloat(weeksPerYear) || 0;
    const annualNum = parseFloat(annualSalary) || 0;
    const taxNum = parseFloat(taxRate) || 0;
    const bonusNum = parseFloat(bonus) || 0;

    // Validation
    if (taxNum < 0 || taxNum > 100) return { error: "Tax rate must be between 0 and 100%" };
    if (hoursNum <= 0) return { error: "Hours per week must be positive" };
    if (weeksNum <= 0 || weeksNum > 52) return { error: "Weeks per year must be between 1 and 52" };
    if (bonusNum < 0) return { error: "Bonus cannot be negative" };

    let calcResult = {};

    if (mode === "hourlyToAnnual") {
      if (!hourlyNum) return { error: "Please enter a valid hourly rate" };
      const weeklyGross = hourlyNum * hoursNum;
      const annualGross = weeklyGross * weeksNum + bonusNum;
      const monthlyGross = annualGross / 12;
      const taxAmount = annualGross * (taxNum / 100);
      const annualNet = annualGross - taxAmount;
      const monthlyNet = annualNet / 12;

      calcResult = {
        hourlyRate: hourlyNum.toFixed(2),
        hoursPerWeek: hoursNum.toFixed(1),
        weeksPerYear: weeksNum.toFixed(1),
        weeklyGross: weeklyGross.toFixed(2),
        monthlyGross: monthlyGross.toFixed(2),
        annualGross: annualGross.toFixed(2),
        taxRate: taxNum.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        monthlyNet: monthlyNet.toFixed(2),
        annualNet: annualNet.toFixed(2),
        bonus: bonusNum.toFixed(2),
        type: "hourlyToAnnual",
      };
    } else if (mode === "annualToHourly") {
      if (!annualNum) return { error: "Please enter a valid annual salary" };
      const totalAnnual = annualNum + bonusNum;
      const weeklyGross = totalAnnual / weeksNum;
      const hourlyRateCalc = weeklyGross / hoursNum;
      const monthlyGross = totalAnnual / 12;
      const taxAmount = totalAnnual * (taxNum / 100);
      const annualNet = totalAnnual - taxAmount;
      const monthlyNet = annualNet / 12;

      calcResult = {
        hourlyRate: hourlyRateCalc.toFixed(2),
        hoursPerWeek: hoursNum.toFixed(1),
        weeksPerYear: weeksNum.toFixed(1),
        weeklyGross: weeklyGross.toFixed(2),
        monthlyGross: monthlyGross.toFixed(2),
        annualGross: totalAnnual.toFixed(2),
        taxRate: taxNum.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        monthlyNet: monthlyNet.toFixed(2),
        annualNet: annualNet.toFixed(2),
        bonus: bonusNum.toFixed(2),
        type: "annualToHourly",
      };
    }

    return calcResult.error ? calcResult : { ...calcResult, currency };
  }, [mode, hourlyRate, hoursPerWeek, weeksPerYear, annualSalary, taxRate, bonus, currency]);

  const calculate = () => {
    const requiredFields =
      mode === "hourlyToAnnual" ? [!hourlyRate, !hoursPerWeek] : [!annualSalary, !hoursPerWeek];
    if (requiredFields.some((field) => field)) {
      setError("Please fill in all required fields");
      return;
    }

    const calcResult = calculateSalary();
    if (calcResult.error) {
      setError(calcResult.error);
    } else {
      setResult(calcResult);
    }
  };

  const reset = () => {
    setMode("hourlyToAnnual");
    setHourlyRate("");
    setHoursPerWeek("40");
    setWeeksPerYear("52");
    setAnnualSalary("");
    setTaxRate("");
    setBonus("");
    setResult(null);
    setError("");
    setShowDetails(false);
    setCurrency("USD");
  };

  const downloadResult = () => {
    if (!result) return;
    const text = `
      Salary Calculation Result (${result.type === "hourlyToAnnual" ? "Hourly to Annual" : "Annual to Hourly"})
      Currency: ${currency}
      Hourly Rate: ${currency} ${result.hourlyRate}
      Hours/Week: ${result.hoursPerWeek}
      Weeks/Year: ${result.weeksPerYear}
      Weekly Gross: ${currency} ${result.weeklyGross}
      Monthly Gross: ${currency} ${result.monthlyGross}
      Annual Gross: ${currency} ${result.annualGross}
      ${result.bonus > 0 ? `Bonus: ${currency} ${result.bonus}` : ""}
      ${result.taxRate > 0 ? `Tax Rate: ${result.taxRate}%` : ""}
      ${result.taxRate > 0 ? `Tax Amount: ${currency} ${result.taxAmount}` : ""}
      ${result.taxRate > 0 ? `Monthly Net: ${currency} ${result.monthlyNet}` : ""}
      ${result.taxRate > 0 ? `Annual Net: ${currency} ${result.annualNet}` : ""}
    `.trim();
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `salary-calculation-${Date.now()}.txt`;
    link.click();
  };

  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Salary Calculator
        </h1>

        {/* Mode and Currency Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500"
            >
              <option value="hourlyToAnnual">Hourly to Annual</option>
              <option value="annualToHourly">Annual to Hourly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500"
            >
              {Object.keys(currencySymbols).map((curr) => (
                <option key={curr} value={curr}>
                  {curr} ({currencySymbols[curr]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          {mode === "hourlyToAnnual" && (
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700 text-sm">Hourly Rate:</label>
              <input
                type="number"
                step="0.01"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-orange-500"
                placeholder={`e.g., 20 (${currencySymbols[currency]})`}
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700 text-sm">Hours/Week:</label>
            <input
              type="number"
              step="0.1"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(e.target.value)}
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., 40"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700 text-sm">Weeks/Year:</label>
            <input
              type="number"
              step="1"
              value={weeksPerYear}
              onChange={(e) => setWeeksPerYear(e.target.value)}
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., 52"
            />
          </div>
          {mode === "annualToHourly" && (
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700 text-sm">Annual Salary:</label>
              <input
                type="number"
                step="0.01"
                value={annualSalary}
                onChange={(e) => setAnnualSalary(e.target.value)}
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-orange-500"
                placeholder={`e.g., 41600 (${currencySymbols[currency]})`}
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700 text-sm">Annual Bonus:</label>
            <input
              type="number"
              step="0.01"
              value={bonus}
              onChange={(e) => setBonus(e.target.value)}
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-orange-500"
              placeholder={`e.g., 5000 (${currencySymbols[currency]}, optional)`}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700 text-sm">Tax Rate (%):</label>
            <input
              type="number"
              step="0.01"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., 20 (optional)"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={calculate}
            className="flex-1 bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Calculate
          </button>
          <button
            onClick={downloadResult}
            disabled={!result}
            className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download
          </button>
          <button
            onClick={reset}
            className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-orange-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-700 text-center">
              Salary Results ({currency})
            </h2>
            <div className="mt-2 space-y-2 text-center">
              <p>Hourly Rate: {currencySymbols[currency]}{result.hourlyRate}</p>
              <p>Weekly Gross: {currencySymbols[currency]}{result.weeklyGross}</p>
              <p>Monthly Gross: {currencySymbols[currency]}{result.monthlyGross}</p>
              <p>Annual Gross: {currencySymbols[currency]}{result.annualGross}</p>
              {result.bonus > 0 && (
                <p>Bonus: {currencySymbols[currency]}{result.bonus}</p>
              )}
              {result.taxRate > 0 && (
                <>
                  <p>Tax Amount: {currencySymbols[currency]}{result.taxAmount}</p>
                  <p>Monthly Net: {currencySymbols[currency]}{result.monthlyNet}</p>
                  <p>Annual Net: {currencySymbols[currency]}{result.annualNet}</p>
                </>
              )}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-2 text-sm text-orange-600 hover:underline"
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </button>
              {showDetails && (
                <div className="mt-2 text-sm space-y-2 text-left">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    <li>Hours/Week: {result.hoursPerWeek}</li>
                    <li>Weeks/Year: {result.weeksPerYear}</li>
                    {result.type === "hourlyToAnnual" && (
                      <>
                        <li>Hourly Rate: {currencySymbols[currency]}{result.hourlyRate}</li>
                        <li>
                          Weekly Gross = Hourly × Hours = {result.hourlyRate} ×{" "}
                          {result.hoursPerWeek} = {currencySymbols[currency]}
                          {result.weeklyGross}
                        </li>
                        <li>
                          Annual Gross = (Weekly × Weeks) + Bonus = ({result.weeklyGross} ×{" "}
                          {result.weeksPerYear}) + {result.bonus} = {currencySymbols[currency]}
                          {result.annualGross}
                        </li>
                        <li>
                          Monthly Gross = Annual / 12 = {result.annualGross} / 12 ={" "}
                          {currencySymbols[currency]}
                          {result.monthlyGross}
                        </li>
                      </>
                    )}
                    {result.type === "annualToHourly" && (
                      <>
                        <li>
                          Annual Gross = Salary + Bonus = {annualSalary} + {result.bonus} ={" "}
                          {currencySymbols[currency]}
                          {result.annualGross}
                        </li>
                        <li>
                          Weekly Gross = Annual / Weeks = {result.annualGross} /{" "}
                          {result.weeksPerYear} = {currencySymbols[currency]}
                          {result.weeklyGross}
                        </li>
                        <li>
                          Hourly Rate = Weekly / Hours = {result.weeklyGross} /{" "}
                          {result.hoursPerWeek} = {currencySymbols[currency]}
                          {result.hourlyRate}
                        </li>
                        <li>
                          Monthly Gross = Annual / 12 = {result.annualGross} / 12 ={" "}
                          {currencySymbols[currency]}
                          {result.monthlyGross}
                        </li>
                      </>
                    )}
                    {result.taxRate > 0 && (
                      <>
                        <li>Tax Rate: {result.taxRate}%</li>
                        <li>
                          Tax Amount = Annual Gross × (Tax Rate / 100) = {result.annualGross} × (
                          {result.taxRate} / 100) = {currencySymbols[currency]}
                          {result.taxAmount}
                        </li>
                        <li>
                          Annual Net = Annual Gross - Tax = {result.annualGross} -{" "}
                          {result.taxAmount} = {currencySymbols[currency]}
                          {result.annualNet}
                        </li>
                        <li>
                          Monthly Net = Annual Net / 12 = {result.annualNet} / 12 ={" "}
                          {currencySymbols[currency]}
                          {result.monthlyNet}
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between hourly and annual salary</li>
            <li>Customizable weeks per year</li>
            <li>Optional tax rate calculation</li>
            <li>Annual bonus inclusion</li>
            <li>Multiple currency support</li>
            <li>Detailed breakdown with toggle</li>
            <li>Download results as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SalaryCalculator;