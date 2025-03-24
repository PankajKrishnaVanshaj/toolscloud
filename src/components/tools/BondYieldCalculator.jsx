"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaCalculator, FaInfoCircle } from "react-icons/fa";

const BondYieldCalculator = () => {
  const [faceValue, setFaceValue] = useState(1000);
  const [couponRate, setCouponRate] = useState(5);
  const [currentPrice, setCurrentPrice] = useState(950);
  const [yearsToMaturity, setYearsToMaturity] = useState(10);
  const [paymentFrequency, setPaymentFrequency] = useState(2); // 1: Annual, 2: Semi-annual, 4: Quarterly
  const [yieldToMaturity, setYieldToMaturity] = useState(null);
  const [calculationMethod, setCalculationMethod] = useState("approximation"); // "approximation" or "newton"
  const [showDetails, setShowDetails] = useState(false);

  // More accurate YTM calculation using Newton's method
  const calculateYTMNewton = useCallback(() => {
    const couponPayment = (faceValue * (couponRate / 100)) / paymentFrequency;
    const periods = yearsToMaturity * paymentFrequency;
    let ytmGuess = (couponRate / 100 + (faceValue - currentPrice) / (currentPrice * yearsToMaturity)) || 0.05;
    const maxIterations = 100;
    const tolerance = 0.0001;

    for (let i = 0; i < maxIterations; i++) {
      let pv = 0;
      let pvDerivative = 0;

      for (let t = 1; t <= periods; t++) {
        const discountFactor = Math.pow(1 + ytmGuess / paymentFrequency, t);
        pv += couponPayment / discountFactor;
        pvDerivative += (-t * couponPayment) / Math.pow(1 + ytmGuess / paymentFrequency, t + 1);
      }
      pv += faceValue / Math.pow(1 + ytmGuess / paymentFrequency, periods);

      const difference = pv - currentPrice;
      if (Math.abs(difference) < tolerance) break;

      ytmGuess -= difference / pvDerivative;
    }

    return (ytmGuess * 100).toFixed(2);
  }, [faceValue, couponRate, currentPrice, yearsToMaturity, paymentFrequency]);

  // Approximation formula for YTM
  const calculateYTMAproximation = useCallback(() => {
    const couponPayment = (faceValue * (couponRate / 100)) / paymentFrequency;
    const avgPrice = (faceValue + currentPrice) / 2;
    const periods = yearsToMaturity * paymentFrequency;
    const ytm = ((couponPayment + (faceValue - currentPrice) / periods) / avgPrice) * paymentFrequency * 100;
    return ytm.toFixed(2);
  }, [faceValue, couponRate, currentPrice, yearsToMaturity, paymentFrequency]);

  // Calculate YTM based on selected method
  const calculateYTM = useCallback(() => {
    if (!faceValue || !couponRate || !currentPrice || !yearsToMaturity || !paymentFrequency) {
      setYieldToMaturity(null);
      return;
    }
    const ytm =
      calculationMethod === "newton" ? calculateYTMNewton() : calculateYTMAproximation();
    setYieldToMaturity(ytm);
  }, [
    faceValue,
    couponRate,
    currentPrice,
    yearsToMaturity,
    paymentFrequency,
    calculationMethod,
    calculateYTMNewton,
    calculateYTMAproximation,
  ]);

  useEffect(() => {
    calculateYTM();
  }, [calculateYTM]);

  // Reset all inputs
  const reset = () => {
    setFaceValue(1000);
    setCouponRate(5);
    setCurrentPrice(950);
    setYearsToMaturity(10);
    setPaymentFrequency(2);
    setCalculationMethod("approximation");
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Bond Yield Calculator
        </h1>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Face Value ($)", value: faceValue, setter: setFaceValue, min: 1, step: 1 },
            { label: "Coupon Rate (%)", value: couponRate, setter: setCouponRate, min: 0, max: 100, step: 0.1 },
            { label: "Current Price ($)", value: currentPrice, setter: setCurrentPrice, min: 1, step: 1 },
            { label: "Years to Maturity", value: yearsToMaturity, setter: setYearsToMaturity, min: 1, step: 1 },
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Frequency</label>
            <select
              value={paymentFrequency}
              onChange={(e) => setPaymentFrequency(Number(e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Annual</option>
              <option value={2}>Semi-Annual</option>
              <option value={4}>Quarterly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Calculation Method</label>
            <select
              value={calculationMethod}
              onChange={(e) => setCalculationMethod(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="approximation">Approximation</option>
              <option value="newton">Newton's Method</option>
            </select>
          </div>
        </div>

        {/* Result Display */}
        {yieldToMaturity ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h2 className="text-lg font-semibold mb-2">Yield to Maturity (YTM)</h2>
            <p className="text-3xl font-bold text-green-600">{yieldToMaturity}%</p>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-2 text-sm text-blue-600 hover:underline flex items-center justify-center mx-auto"
            >
              <FaInfoCircle className="mr-1" /> {showDetails ? "Hide" : "Show"} Details
            </button>
            {showDetails && (
              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <p>Annual Coupon Payment: ${(faceValue * (couponRate / 100)).toFixed(2)}</p>
                <p>
                  Periodic Payment: ${((faceValue * (couponRate / 100)) / paymentFrequency).toFixed(2)} ({paymentFrequency} times/year)
                </p>
                <p>Total Periods: {yearsToMaturity * paymentFrequency}</p>
                <p>Method: {calculationMethod === "newton" ? "Newton's Method" : "Approximation"}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            Please enter valid values to calculate the yield
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={calculateYTM}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Recalculate
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Notes */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Notes</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports Annual, Semi-Annual, and Quarterly payments</li>
            <li>Two calculation methods: Approximation and Newton's Method</li>
            <li>Detailed breakdown of calculations</li>
            <li>
              Note: Newton's Method is more accurate but assumes continuous compounding; real-world YTM may vary slightly
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BondYieldCalculator;