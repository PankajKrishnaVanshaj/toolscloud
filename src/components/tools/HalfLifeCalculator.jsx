"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaQuestionCircle } from "react-icons/fa";

const HalfLifeCalculator = () => {
  const [mode, setMode] = useState("halfLife");
  const [halfLife, setHalfLife] = useState("");
  const [decayConstant, setDecayConstant] = useState("");
  const [initialAmount, setInitialAmount] = useState("");
  const [time, setTime] = useState("");
  const [finalAmount, setFinalAmount] = useState("");
  const [unit, setUnit] = useState("s");
  const [amountUnit, setAmountUnit] = useState("g"); // New: unit for amount (e.g., grams, moles)
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]); // New: calculation history

  // Time unit conversion factors to seconds
  const timeUnits = {
    s: 1,
    min: 60,
    h: 3600,
    d: 86400,
    y: 31557600, // 365.25 days
  };

  // Amount units (arbitrary, for display purposes)
  const amountUnits = ["g", "kg", "mg", "mol", "Bq", "Ci"];

  const calculate = useCallback(() => {
    setError("");
    setResult(null);

    const toSeconds = (value) => parseFloat(value) * timeUnits[unit];
    const fromSeconds = (value) => value / timeUnits[unit];

    try {
      let calcResult;
      if (mode === "halfLife") {
        if (!decayConstant || isNaN(decayConstant) || decayConstant <= 0) {
          throw new Error("Please enter a valid decay constant");
        }
        const lambda = parseFloat(decayConstant) / timeUnits[unit];
        const t12 = Math.log(2) / lambda;
        calcResult = {
          halfLife: fromSeconds(t12),
          decayConstant: lambda * timeUnits[unit],
        };
      } else if (mode === "decayConstant") {
        if (!halfLife || isNaN(halfLife) || halfLife <= 0) {
          throw new Error("Please enter a valid half-life");
        }
        const t12 = toSeconds(halfLife);
        const lambda = Math.log(2) / t12;
        calcResult = {
          halfLife: fromSeconds(t12),
          decayConstant: lambda * timeUnits[unit],
        };
      } else if (mode === "remaining") {
        if (
          !halfLife ||
          !initialAmount ||
          !time ||
          isNaN(halfLife) ||
          isNaN(initialAmount) ||
          isNaN(time) ||
          halfLife <= 0 ||
          initialAmount <= 0 ||
          time < 0
        ) {
          throw new Error("Please enter valid half-life, initial amount, and time");
        }
        const t12 = toSeconds(halfLife);
        const t = toSeconds(time);
        const N0 = parseFloat(initialAmount);
        const lambda = Math.log(2) / t12;
        const N = N0 * Math.exp(-lambda * t);
        calcResult = {
          remaining: N,
          halfLife: fromSeconds(t12),
          time: fromSeconds(t),
          initialAmount: N0,
        };
      } else if (mode === "time") {
        if (
          !halfLife ||
          !initialAmount ||
          !finalAmount ||
          isNaN(halfLife) ||
          isNaN(initialAmount) ||
          isNaN(finalAmount) ||
          halfLife <= 0 ||
          initialAmount <= 0 ||
          finalAmount <= 0 ||
          finalAmount > initialAmount
        ) {
          throw new Error(
            "Please enter valid half-life, initial amount, and final amount (final ≤ initial)"
          );
        }
        const t12 = toSeconds(halfLife);
        const N0 = parseFloat(initialAmount);
        const N = parseFloat(finalAmount);
        const lambda = Math.log(2) / t12;
        const t = -Math.log(N / N0) / lambda;
        calcResult = {
          time: fromSeconds(t),
          halfLife: fromSeconds(t12),
          initialAmount: N0,
          finalAmount: N,
        };
      }

      setResult(calcResult);
      setHistory((prev) => [
        { mode, ...calcResult, unit, amountUnit, timestamp: new Date().toLocaleString() },
        ...prev.slice(0, 9), // Keep last 10 calculations
      ]);
    } catch (err) {
      setError(err.message);
    }
  }, [mode, halfLife, decayConstant, initialAmount, time, finalAmount, unit, amountUnit]);

  const formatNumber = (num, digits = 4) =>
    num < 1e-6 || num > 1e6
      ? num.toExponential(digits)
      : num.toLocaleString("en-US", { maximumFractionDigits: digits });

  const reset = () => {
    setHalfLife("");
    setDecayConstant("");
    setInitialAmount("");
    setTime("");
    setFinalAmount("");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Half-Life Calculator
        </h1>

        <div className="space-y-6">
          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calculation Mode
            </label>
            <select
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                reset();
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="halfLife">Half-Life from Decay Constant</option>
              <option value="decayConstant">Decay Constant from Half-Life</option>
              <option value="remaining">Remaining Amount</option>
              <option value="time">Time to Reach Amount</option>
            </select>
          </div>

          {/* Units Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(timeUnits).map((u) => (
                  <option key={u} value={u}>
                    {u === "s"
                      ? "Seconds"
                      : u === "min"
                      ? "Minutes"
                      : u === "h"
                      ? "Hours"
                      : u === "d"
                      ? "Days"
                      : "Years"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount Unit
              </label>
              <select
                value={amountUnit}
                onChange={(e) => setAmountUnit(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {amountUnits.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            {mode === "halfLife" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Decay Constant (1/{unit})
                </label>
                <input
                  type="number"
                  value={decayConstant}
                  onChange={(e) => setDecayConstant(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  step="any"
                />
              </div>
            )}
            {mode === "decayConstant" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Half-Life ({unit})
                </label>
                <input
                  type="number"
                  value={halfLife}
                  onChange={(e) => setHalfLife(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  step="any"
                />
              </div>
            )}
            {mode === "remaining" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Half-Life ({unit})
                  </label>
                  <input
                    type="number"
                    value={halfLife}
                    onChange={(e) => setHalfLife(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    step="any"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Amount ({amountUnit})
                  </label>
                  <input
                    type="number"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    step="any"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time ({unit})
                  </label>
                  <input
                    type="number"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    step="any"
                  />
                </div>
              </>
            )}
            {mode === "time" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Half-Life ({unit})
                  </label>
                  <input
                    type="number"
                    value={halfLife}
                    onChange={(e) => setHalfLife(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    step="any"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Amount ({amountUnit})
                  </label>
                  <input
                    type="number"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    step="any"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Final Amount ({amountUnit})
                  </label>
                  <input
                    type="number"
                    value={finalAmount}
                    onChange={(e) => setFinalAmount(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    step="any"
                  />
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
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

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Results:</h2>
              {mode === "halfLife" && (
                <>
                  <p>Half-Life: {formatNumber(result.halfLife)} {unit}</p>
                  <p>Decay Constant: {formatNumber(result.decayConstant)} 1/{unit}</p>
                </>
              )}
              {mode === "decayConstant" && (
                <>
                  <p>Half-Life: {formatNumber(result.halfLife)} {unit}</p>
                  <p>Decay Constant: {formatNumber(result.decayConstant)} 1/{unit}</p>
                </>
              )}
              {mode === "remaining" && (
                <>
                  <p>Remaining Amount: {formatNumber(result.remaining)} {amountUnit}</p>
                  <p>Initial Amount: {formatNumber(result.initialAmount)} {amountUnit}</p>
                  <p>Time: {formatNumber(result.time)} {unit}</p>
                  <p>Half-Life: {formatNumber(result.halfLife)} {unit}</p>
                </>
              )}
              {mode === "time" && (
                <>
                  <p>Time: {formatNumber(result.time)} {unit}</p>
                  <p>Initial Amount: {formatNumber(result.initialAmount)} {amountUnit}</p>
                  <p>Final Amount: {formatNumber(result.finalAmount)} {amountUnit}</p>
                  <p>Half-Life: {formatNumber(result.halfLife)} {unit}</p>
                </>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-2">Calculation History</h3>
              <ul className="text-sm text-blue-600 space-y-2 max-h-40 overflow-y-auto">
                {history.map((entry, index) => (
                  <li key={index}>
                    {entry.timestamp} - {entry.mode.replace(/([A-Z])/g, " $1").trim()}:{" "}
                    {entry.mode === "halfLife" || entry.mode === "decayConstant"
                      ? `Half-Life: ${formatNumber(entry.halfLife)} ${entry.unit}, Decay Constant: ${formatNumber(entry.decayConstant)} 1/${entry.unit}`
                      : entry.mode === "remaining"
                      ? `Remaining: ${formatNumber(entry.remaining)} ${entry.amountUnit}`
                      : `Time: ${formatNumber(entry.time)} ${entry.unit}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* About */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <details>
              <summary className="cursor-pointer font-medium text-gray-700 flex items-center">
                <FaQuestionCircle className="mr-2" /> About
              </summary>
              <div className="mt-2 text-sm text-gray-600 space-y-2">
                <p>Calculates radioactive decay properties:</p>
                <ul className="list-disc list-inside">
                  <li>t₁/₂ = ln(2)/λ (Half-Life)</li>
                  <li>λ = ln(2)/t₁/₂ (Decay Constant)</li>
                  <li>N = N₀e^(-λt) (Remaining Amount)</li>
                  <li>t = -ln(N/N₀)/λ (Time)</li>
                </ul>
                <p>Supports multiple time and amount units with calculation history.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HalfLifeCalculator;