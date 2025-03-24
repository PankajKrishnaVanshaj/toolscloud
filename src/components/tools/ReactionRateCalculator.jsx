"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";

const ReactionRateCalculator = () => {
  const [reactionType, setReactionType] = useState("rate");
  const [order, setOrder] = useState(0);
  const [initialConc, setInitialConc] = useState("");
  const [finalConc, setFinalConc] = useState("");
  const [time, setTime] = useState("");
  const [temperature, setTemperature] = useState("");
  const [activationEnergy, setActivationEnergy] = useState("");
  const [preExpFactor, setPreExpFactor] = useState("");
  const [units, setUnits] = useState({ conc: "mol/L", time: "s", energy: "kJ/mol" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const R = 8.314; // Gas constant (J/(mol·K))

  const calculateRate = useCallback(() => {
    setError("");
    setResult(null);

    const c0 = parseFloat(initialConc);
    const cf = parseFloat(finalConc);
    const t = parseFloat(time);

    if (isNaN(c0) || isNaN(cf) || isNaN(t) || t <= 0 || c0 < cf) {
      setError("Please enter valid concentration and time values (c0 > cf, t > 0)");
      return;
    }

    try {
      let rate, rateConstant;
      let rateUnit = `${units.conc}/${units.time}`;
      let kUnit = order === 0 ? rateUnit : order === 1 ? `${units.time}⁻¹` : `${units.conc}⁻¹·${units.time}⁻¹`;

      switch (order) {
        case 0:
          rate = (c0 - cf) / t;
          rateConstant = rate;
          break;
        case 1:
          rateConstant = (1 / t) * Math.log(c0 / cf);
          rate = rateConstant * cf;
          break;
        case 2:
          rateConstant = (1 / t) * ((1 / cf) - (1 / c0));
          rate = rateConstant * cf * cf;
          break;
        default:
          throw new Error("Unsupported reaction order");
      }

      const resultData = {
        rate: rate > 0 ? rate : 0,
        rateConstant: rateConstant > 0 ? rateConstant : 0,
        order,
        rateUnit,
        kUnit,
      };
      setResult(resultData);
      setHistory((prev) => [...prev, resultData].slice(-5)); // Keep last 5 calculations
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [initialConc, finalConc, time, order, units]);

  const calculateRateConstant = useCallback(() => {
    setError("");
    setResult(null);

    const T = parseFloat(temperature);
    const Ea = parseFloat(activationEnergy) * (units.energy === "kJ/mol" ? 1000 : 1); // Convert to J/mol if needed
    const A = parseFloat(preExpFactor);

    if (isNaN(T) || isNaN(Ea) || isNaN(A) || T <= 0 || A <= 0) {
      setError("Please enter valid temperature, activation energy, and pre-exponential factor");
      return;
    }

    try {
      const k = A * Math.exp(-Ea / (R * T));
      const resultData = {
        rateConstant: k,
        temperature: T,
        activationEnergy: Ea / (units.energy === "kJ/mol" ? 1000 : 1),
        preExpFactor: A,
        kUnit: `${units.time}⁻¹`,
      };
      setResult(resultData);
      setHistory((prev) => [...prev, resultData].slice(-5));
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [temperature, activationEnergy, preExpFactor, units]);

  const handleCalculate = () => {
    reactionType === "rate" ? calculateRate() : calculateRateConstant();
  };

  const reset = () => {
    setInitialConc("");
    setFinalConc("");
    setTime("");
    setTemperature("");
    setActivationEnergy("");
    setPreExpFactor("");
    setResult(null);
    setError("");
    setOrder(0);
    setUnits({ conc: "mol/L", time: "s", energy: "kJ/mol" });
  };

  const downloadResults = () => {
    if (!result) return;
    const text = reactionType === "rate"
      ? `Reaction Rate Calculation\nRate: ${formatNumber(result.rate)} ${result.rateUnit}\nRate Constant (k): ${formatNumber(result.rateConstant)} ${result.kUnit}\nOrder: ${result.order}`
      : `Rate Constant Calculation (Arrhenius)\nRate Constant (k): ${formatNumber(result.rateConstant)} ${result.kUnit}\nTemperature: ${formatNumber(result.temperature)} K\nActivation Energy: ${formatNumber(result.activationEnergy)} ${units.energy}\nPre-exponential Factor: ${formatNumber(result.preExpFactor)} ${result.kUnit}`;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `reaction-rate-${Date.now()}.txt`;
    link.click();
  };

  const formatNumber = (num, digits = 4) =>
    num < 1e-6 || num > 1e6
      ? num.toExponential(digits)
      : num.toLocaleString("en-US", { maximumFractionDigits: digits });

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Reaction Rate Calculator
        </h1>

        <div className="space-y-6">
          {/* Calculation Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calculation Type
            </label>
            <select
              value={reactionType}
              onChange={(e) => {
                setReactionType(e.target.value);
                reset();
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="rate">Reaction Rate</option>
              <option value="constant">Rate Constant (Arrhenius)</option>
            </select>
          </div>

          {/* Unit Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Concentration Unit
              </label>
              <select
                value={units.conc}
                onChange={(e) => setUnits((prev) => ({ ...prev, conc: e.target.value }))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={reactionType === "constant"}
              >
                <option value="mol/L">mol/L</option>
                <option value="mmol/L">mmol/L</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Unit
              </label>
              <select
                value={units.time}
                onChange={(e) => setUnits((prev) => ({ ...prev, time: e.target.value }))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="s">s</option>
                <option value="min">min</option>
                <option value="h">h</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Energy Unit
              </label>
              <select
                value={units.energy}
                onChange={(e) => setUnits((prev) => ({ ...prev, energy: e.target.value }))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={reactionType === "rate"}
              >
                <option value="kJ/mol">kJ/mol</option>
                <option value="J/mol">J/mol</option>
              </select>
            </div>
          </div>

          {/* Inputs */}
          {reactionType === "rate" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reaction Order
                </label>
                <select
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Zero Order</option>
                  <option value={1}>First Order</option>
                  <option value={2}>Second Order</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Concentration ({units.conc})
                </label>
                <input
                  type="number"
                  value={initialConc}
                  onChange={(e) => setInitialConc(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  step="any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Final Concentration ({units.conc})
                </label>
                <input
                  type="number"
                  value={finalConc}
                  onChange={(e) => setFinalConc(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  step="any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time ({units.time})
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
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature (K)
                </label>
                <input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  step="any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activation Energy ({units.energy})
                </label>
                <input
                  type="number"
                  value={activationEnergy}
                  onChange={(e) => setActivationEnergy(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  step="any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pre-exponential Factor (A, {units.time}⁻¹)
                </label>
                <input
                  type="number"
                  value={preExpFactor}
                  onChange={(e) => setPreExpFactor(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  step="any"
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleCalculate}
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
            <button
              onClick={downloadResults}
              disabled={!result}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Results:</h2>
              {reactionType === "rate" ? (
                <>
                  <p>
                    Rate: {formatNumber(result.rate)} {result.rateUnit}
                  </p>
                  <p>
                    Rate Constant (k): {formatNumber(result.rateConstant)} {result.kUnit}
                  </p>
                  <p>Order: {result.order}</p>
                </>
              ) : (
                <>
                  <p>
                    Rate Constant (k): {formatNumber(result.rateConstant)} {result.kUnit}
                  </p>
                  <p>Temperature: {formatNumber(result.temperature)} K</p>
                  <p>
                    Activation Energy: {formatNumber(result.activationEnergy)} {units.energy}
                  </p>
                  <p>
                    Pre-exponential Factor: {formatNumber(result.preExpFactor)} {result.kUnit}
                  </p>
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
              <ul className="text-sm text-blue-600 space-y-1 max-h-32 overflow-y-auto">
                {history.slice().reverse().map((item, index) => (
                  <li key={index}>
                    {reactionType === "rate"
                      ? `Rate: ${formatNumber(item.rate)} ${item.rateUnit}, k: ${formatNumber(item.rateConstant)} ${item.kUnit}, Order: ${item.order}`
                      : `k: ${formatNumber(item.rateConstant)} ${item.kUnit}, T: ${formatNumber(item.temperature)} K`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Info */}
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <details>
              <summary className="cursor-pointer font-medium text-yellow-700">
                About This Calculator
              </summary>
              <div className="mt-2 text-sm text-yellow-600 space-y-2">
                <p>Calculates reaction rates and constants:</p>
                <ul className="list-disc list-inside">
                  <li>Zero Order: Rate = k</li>
                  <li>First Order: Rate = k[A]</li>
                  <li>Second Order: Rate = k[A]²</li>
                  <li>Arrhenius: k = A * e^(-Ea/(RT))</li>
                </ul>
                <p>Supports customizable units and keeps a history of the last 5 calculations.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactionRateCalculator;