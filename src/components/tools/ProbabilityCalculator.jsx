"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCalculator } from "react-icons/fa";

const ProbabilityCalculator = () => {
  const [mode, setMode] = useState("single");
  const [singleFavorable, setSingleFavorable] = useState("");
  const [singleTotal, setSingleTotal] = useState("");
  const [event1Favorable, setEvent1Favorable] = useState("");
  const [event1Total, setEvent1Total] = useState("");
  const [event2Favorable, setEvent2Favorable] = useState("");
  const [event2Total, setEvent2Total] = useState("");
  const [combinedType, setCombinedType] = useState("and");
  const [isDependent, setIsDependent] = useState(false);
  const [n, setN] = useState("");
  const [k, setK] = useState("");
  const [permCombType, setPermCombType] = useState("permutation");
  const [withReplacement, setWithReplacement] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [history, setHistory] = useState([]);

  // Factorial function
  const factorial = useCallback((num) => {
    if (num < 0) return NaN;
    if (num === 0) return 1;
    let result = 1;
    for (let i = 2; i <= num; i++) result *= i;
    return result;
  }, []);

  // Calculate probability
  const calculateProbability = useCallback(() => {
    setError("");
    setResult(null);

    if (mode === "single") {
      const favorable = parseInt(singleFavorable);
      const total = parseInt(singleTotal);
      if (isNaN(favorable) || isNaN(total) || favorable < 0 || total <= 0 || favorable > total) {
        return { error: "Enter valid favorable and total outcomes (favorable ≤ total)" };
      }
      const probability = favorable / total;
      return {
        probability: probability.toFixed(4),
        percentage: (probability * 100).toFixed(2),
        favorable,
        total,
      };
    } else if (mode === "combined") {
      const e1Favorable = parseInt(event1Favorable);
      const e1Total = parseInt(event1Total);
      const e2Favorable = parseInt(event2Favorable);
      const e2Total = parseInt(event2Total);
      if (
        isNaN(e1Favorable) ||
        isNaN(e1Total) ||
        isNaN(e2Favorable) ||
        isNaN(e2Total) ||
        e1Favorable < 0 ||
        e1Total <= 0 ||
        e1Favorable > e1Total ||
        e2Favorable < 0 ||
        e2Total <= 0 ||
        e2Favorable > e2Total
      ) {
        return { error: "Enter valid favorable and total outcomes for both events" };
      }
      const p1 = e1Favorable / e1Total;
      const p2 = isDependent ? e2Favorable / (e1Total - e1Favorable) : e2Favorable / e2Total;
      let probability;
      if (combinedType === "and") {
        probability = isDependent ? p1 * p2 : p1 * p2;
      } else {
        probability = p1 + p2 - (p1 * p2);
      }
      return {
        probability: probability.toFixed(4),
        percentage: (probability * 100).toFixed(2),
        e1Favorable,
        e1Total,
        e2Favorable,
        e2Total,
        type: combinedType,
        dependent: isDependent,
      };
    } else if (mode === "perm_comb") {
      const nVal = parseInt(n);
      const kVal = parseInt(k);
      if (
        isNaN(nVal) ||
        isNaN(kVal) ||
        nVal < 0 ||
        kVal < 0 ||
        (!withReplacement && kVal > nVal) ||
        (withReplacement && permCombType === "combination" && nVal === 0 && kVal > 0)
      ) {
        return { error: "Enter valid total (n) and selection (k) values (n ≥ 1 for combinations with replacement)" };
      }
      let count;
      if (permCombType === "permutation") {
        if (withReplacement) {
          count = Math.pow(nVal, kVal);
        } else {
          count = factorial(nVal) / factorial(nVal - kVal);
        }
      } else {
        if (withReplacement) {
          count = factorial(nVal + kVal - 1) / (factorial(kVal) * factorial(nVal - 1));
        } else {
          count = factorial(nVal) / (factorial(kVal) * factorial(nVal - kVal));
        }
      }
      if (isNaN(count) || !isFinite(count)) {
        return { error: "Calculation resulted in an invalid number (e.g., overflow or division by zero)" };
      }
      return {
        count: Math.round(count),
        n: nVal,
        k: kVal,
        type: permCombType,
        replacement: withReplacement,
      };
    }
    return null;
  }, [
    mode,
    singleFavorable,
    singleTotal,
    event1Favorable,
    event1Total,
    event2Favorable,
    event2Total,
    combinedType,
    isDependent,
    n,
    k,
    permCombType,
    withReplacement,
  ]);

  const calculate = () => {
    const calcResult = calculateProbability();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
    setHistory((prev) => [...prev, { ...calcResult, mode, timestamp: new Date().toLocaleString() }].slice(-5));
  };

  const reset = () => {
    setMode("single");
    setSingleFavorable("");
    setSingleTotal("");
    setEvent1Favorable("");
    setEvent1Total("");
    setEvent2Favorable("");
    setEvent2Total("");
    setCombinedType("and");
    setIsDependent(false);
    setN("");
    setK("");
    setPermCombType("permutation");
    setWithReplacement(false);
    setResult(null);
    setError("");
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Probability Calculator
        </h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {["single", "combined", "perm_comb"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === m ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {m === "single" ? "Single Event" : m === "combined" ? "Combined Events" : "Perm/Comb"}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          {mode === "single" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="w-36 text-gray-700 text-sm">Favorable Outcomes:</label>
                <input
                  type="number"
                  value={singleFavorable}
                  onChange={(e) => setSingleFavorable(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="w-36 text-gray-700 text-sm">Total Outcomes:</label>
                <input
                  type="number"
                  value={singleTotal}
                  onChange={(e) => setSingleTotal(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 6"
                />
              </div>
            </div>
          )}
          {mode === "combined" && (
            <div className="space-y-4">
              {[
                { label: "Event 1 Favorable", value: event1Favorable, setter: setEvent1Favorable },
                { label: "Event 1 Total", value: event1Total, setter: setEvent1Total },
                { label: "Event 2 Favorable", value: event2Favorable, setter: setEvent2Favorable },
                { label: "Event 2 Total", value: event2Total, setter: setEvent2Total },
              ].map(({ label, value, setter }) => (
                <div key={label} className="flex flex-col sm:flex-row items-center gap-2">
                  <label className="w-36 text-gray-700 text-sm">{label}:</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder={`e.g., ${label.includes("Favorable") ? "1" : "6"}`}
                  />
                </div>
              ))}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCombinedType("and")}
                    className={`px-3 py-1 rounded-md ${
                      combinedType === "and" ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    AND
                  </button>
                  <button
                    onClick={() => setCombinedType("or")}
                    className={`px-3 py-1 rounded-md ${
                      combinedType === "or" ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    OR
                  </button>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={isDependent}
                    onChange={(e) => setIsDependent(e.target.checked)}
                    className="accent-blue-500"
                  />
                  Dependent Events
                </label>
              </div>
            </div>
          )}
          {mode === "perm_comb" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="w-36 text-gray-700 text-sm">Total Items (n):</label>
                <input
                  type="number"
                  value={n}
                  onChange={(e) => setN(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="w-36 text-gray-700 text-sm">Items to Choose (k):</label>
                <input
                  type="number"
                  value={k}
                  onChange={(e) => setK(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => setPermCombType("permutation")}
                    className={`px-3 py-1 rounded-md ${
                      permCombType === "permutation"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    Permutation
                  </button>
                  <button
                    onClick={() => setPermCombType("combination")}
                    className={`px-3 py-1 rounded-md ${
                      permCombType === "combination"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    Combination
                  </button>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-phenomenal700">
                  <input
                    type="checkbox"
                    checked={withReplacement}
                    onChange={(e) => setWithReplacement(e.target.checked)}
                    className="accent-blue-500"
                  />
                  With Replacement
                </label>
              </div>
            </div>
          )}

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
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200 text-center">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold text-blue-700 mb-2 text-center">Result</h2>
            <div className="space-y-2">
              {mode === "single" && result.probability && (
                <p className="text-center text-xl text-blue-600">
                  Probability: {result.probability} ({result.percentage}%)
                </p>
              )}
              {mode === "combined" && result.probability && result.type && (
                <p className="text-center text-xl text-blue-600">
                  Probability of {result.type.toUpperCase()}: {result.probability} (
                  {result.percentage}%)
                </p>
              )}
              {mode === "perm_comb" && result.count !== undefined && (
                <p className="text-center text-xl text-blue-600">
                  {result.type === "permutation" ? "Permutations" : "Combinations"}:{" "}
                  {Number.isFinite(result.count) ? result.count.toLocaleString() : "Invalid"}
                </p>
              )}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showDetails ? "Hide Details" : "Show Details"}
                </button>
              </div>
              {showDetails && (
                <div className="text-sm text-gray-700 space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    {mode === "single" && (
                      <>
                        <li>P = Favorable / Total</li>
                        <li>
                          P = {result.favorable} / {result.total} = {result.probability}
                        </li>
                        <li>Percentage = {result.probability} × 100 = {result.percentage}%</li>
                      </>
                    )}
                    {mode === "combined" && (
                      <>
                        <li>
                          P(Event 1) = {result.e1Favorable} / {result.e1Total} ={" "}
                          {(result.e1Favorable / result.e1Total).toFixed(4)}
                        </li>
                        <li>
                          P(Event 2) = {result.e2Favorable} /{" "}
                          {result.dependent ? result.e1Total - result.e1Favorable : result.e2Total}{" "}
                          ={" "}
                          {(result.e2Favorable / (result.dependent ? result.e1Total - result.e1Favorable : result.e2Total)).toFixed(4)}
                        </li>
                        {result.type === "and" ? (
                          <li>
                            P(A and B) = P(A) × P(B) = {(result.e1Favorable / result.e1Total).toFixed(4)} ×{" "}
                            {(result.e2Favorable / (result.dependent ? result.e1Total - result.e1Favorable : result.e2Total)).toFixed(4)} ={" "}
                            {result.probability}
                          </li>
                        ) : (
                          <li>
                            P(A or B) = P(A) + P(B) - P(A and B) ={" "}
                            {(result.e1Favorable / result.e1Total).toFixed(4)} +{" "}
                            {(result.e2Favorable / (result.dependent ? result.e1Total - result.e1Favorable : result.e2Total)).toFixed(4)} -{" "}
                            {((result.e1Favorable / result.e1Total) * (result.e2Favorable / (result.dependent ? result.e1Total - result.e1Favorable : result.e2Total))).toFixed(4)} ={" "}
                            {result.probability}
                          </li>
                        )}
                        <li>Percentage = {result.probability} × 100 = {result.percentage}%</li>
                      </>
                    )}
                    {mode === "perm_comb" && (
                      <>
                        {result.type === "permutation" ? (
                          result.replacement ? (
                            <>
                              <li>With Replacement: P(n,k) = nᵏ</li>
                              <li>
                                P({result.n},{result.k}) = {result.n}⁽{result.k}⁾ ={" "}
                                {Number.isFinite(result.count) ? result.count.toLocaleString() : "Invalid"}
                              </li>
                            </>
                          ) : (
                            <>
                              <li>Without Replacement: P(n,k) = n! / (n-k)!</li>
                              <li>
                                P({result.n},{result.k}) = {result.n}! / ({result.n}-{result.k})! ={" "}
                                {Number.isFinite(factorial(result.n)) ? factorial(result.n).toLocaleString() : "Invalid"} /{" "}
                                {Number.isFinite(factorial(result.n - result.k)) ? factorial(result.n - result.k).toLocaleString() : "Invalid"} ={" "}
                                {Number.isFinite(result.count) ? result.count.toLocaleString() : "Invalid"}
                              </li>
                            </>
                          )
                        ) : result.replacement ? (
                          <>
                            <li>With Replacement: C(n+k-1,k) = (n+k-1)! / (k!(n-1)!)</li>
                            <li>
                              C({result.n},{result.k}) = ({result.n}+{result.k}-1)! / ({result.k}! ×{" "}
                              ({result.n}-1)!) ={" "}
                              {Number.isFinite(factorial(result.n + result.k - 1)) ? factorial(result.n + result.k - 1).toLocaleString() : "Invalid"} / (
                              {Number.isFinite(factorial(result.k)) ? factorial(result.k).toLocaleString() : "Invalid"} ×{" "}
                              {Number.isFinite(factorial(result.n - 1)) ? factorial(result.n - 1).toLocaleString() : "Invalid"}) ={" "}
                              {Number.isFinite(result.count) ? result.count.toLocaleString() : "Invalid"}
                            </li>
                          </>
                        ) : (
                          <>
                            <li>Without Replacement: C(n,k) = n! / (k!(n-k)!)</li>
                            <li>
                              C({result.n},{result.k}) = {result.n}! / ({result.k}! × ({result.n}-
                              {result.k})!) = {Number.isFinite(factorial(result.n)) ? factorial(result.n).toLocaleString() : "Invalid"} / (
                              {Number.isFinite(factorial(result.k)) ? factorial(result.k).toLocaleString() : "Invalid"} ×{" "}
                              {Number.isFinite(factorial(result.n - result.k)) ? factorial(result.n - result.k).toLocaleString() : "Invalid"}) ={" "}
                              {Number.isFinite(result.count) ? result.count.toLocaleString() : "Invalid"}
                            </li>
                          </>
                        )}
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-2">Calculation History</h3>
            <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
              {history.slice().reverse().map((entry, index) => (
                <li key={index}>
                  {entry.timestamp}:{" "}
                  {entry.mode === "single"
                    ? `P = ${entry.probability} (${entry.percentage}%)`
                    : entry.mode === "combined"
                    ? `P(${entry.type.toUpperCase()}) = ${entry.probability} (${entry.percentage}%)`
                    : `${entry.type} = ${Number.isFinite(entry.count) ? entry.count.toLocaleString() : "Invalid"}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Single event probability</li>
            <li>Combined events (AND/OR) with dependent/independent options</li>
            <li>Permutations and combinations with/without replacement</li>
            <li>Detailed calculation breakdown</li>
            <li>Calculation history (last 5)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProbabilityCalculator;