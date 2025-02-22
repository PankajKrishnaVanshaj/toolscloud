'use client'
import React, { useState } from 'react';

const ProbabilityCalculator = () => {
  const [mode, setMode] = useState('single'); // single, combined, perm_comb
  const [singleFavorable, setSingleFavorable] = useState('');
  const [singleTotal, setSingleTotal] = useState('');
  const [event1Favorable, setEvent1Favorable] = useState('');
  const [event1Total, setEvent1Total] = useState('');
  const [event2Favorable, setEvent2Favorable] = useState('');
  const [event2Total, setEvent2Total] = useState('');
  const [combinedType, setCombinedType] = useState('and'); // and, or
  const [n, setN] = useState(''); // Total items for perm_comb
  const [k, setK] = useState(''); // Items to choose for perm_comb
  const [permCombType, setPermCombType] = useState('permutation'); // permutation, combination
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Factorial function for permutations/combinations
  const factorial = (num) => {
    if (num < 0) return NaN;
    if (num === 0) return 1;
    let result = 1;
    for (let i = 2; i <= num; i++) result *= i;
    return result;
  };

  // Calculate probability
  const calculateProbability = () => {
    setError('');
    setResult(null);

    if (mode === 'single') {
      const favorable = parseInt(singleFavorable);
      const total = parseInt(singleTotal);
      if (isNaN(favorable) || isNaN(total) || favorable < 0 || total <= 0 || favorable > total) {
        return { error: 'Enter valid favorable and total outcomes (favorable ≤ total)' };
      }
      const probability = favorable / total;
      return {
        probability: probability.toFixed(4),
        percentage: (probability * 100).toFixed(2),
        favorable,
        total
      };
    } else if (mode === 'combined') {
      const e1Favorable = parseInt(event1Favorable);
      const e1Total = parseInt(event1Total);
      const e2Favorable = parseInt(event2Favorable);
      const e2Total = parseInt(event2Total);
      if (isNaN(e1Favorable) || isNaN(e1Total) || isNaN(e2Favorable) || isNaN(e2Total) ||
          e1Favorable < 0 || e1Total <= 0 || e1Favorable > e1Total ||
          e2Favorable < 0 || e2Total <= 0 || e2Favorable > e2Total) {
        return { error: 'Enter valid favorable and total outcomes for both events' };
      }
      const p1 = e1Favorable / e1Total;
      const p2 = e2Favorable / e2Total;
      let probability;
      if (combinedType === 'and') {
        probability = p1 * p2; // Independent events
      } else {
        probability = p1 + p2 - (p1 * p2); // P(A or B) = P(A) + P(B) - P(A and B)
      }
      return {
        probability: probability.toFixed(4),
        percentage: (probability * 100).toFixed(2),
        e1Favorable,
        e1Total,
        e2Favorable,
        e2Total,
        type: combinedType
      };
    } else if (mode === 'perm_comb') {
      const nVal = parseInt(n);
      const kVal = parseInt(k);
      if (isNaN(nVal) || isNaN(kVal) || nVal < 0 || kVal < 0 || kVal > nVal) {
        return { error: 'Enter valid total (n) and selection (k) values (k ≤ n)' };
      }
      let count;
      if (permCombType === 'permutation') {
        count = factorial(nVal) / factorial(nVal - kVal); // P(n,k) = n! / (n-k)!
      } else {
        count = factorial(nVal) / (factorial(kVal) * factorial(nVal - kVal)); // C(n,k) = n! / (k!(n-k)!)
      }
      return {
        count: Math.round(count),
        n: nVal,
        k: kVal,
        type: permCombType
      };
    }
    return null;
  };

  const calculate = () => {
    const calcResult = calculateProbability();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
  };

  const reset = () => {
    setMode('single');
    setSingleFavorable('');
    setSingleTotal('');
    setEvent1Favorable('');
    setEvent1Total('');
    setEvent2Favorable('');
    setEvent2Total('');
    setCombinedType('and');
    setN('');
    setK('');
    setPermCombType('permutation');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Probability Calculator
        </h1>

        {/* Mode Selection */}
        <div className="flex justify-center gap-2 mb-6">
          <button onClick={() => setMode('single')} className={`px-3 py-1 rounded-lg ${mode === 'single' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Single Event</button>
          <button onClick={() => setMode('combined')} className={`px-3 py-1 rounded-lg ${mode === 'combined' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Combined Events</button>
          <button onClick={() => setMode('perm_comb')} className={`px-3 py-1 rounded-lg ${mode === 'perm_comb' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Perm/Comb</button>
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          {mode === 'single' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Favorable Outcomes:</label>
                <input type="number" value={singleFavorable} onChange={(e) => setSingleFavorable(e.target.value)} className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 2" />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Total Outcomes:</label>
                <input type="number" value={singleTotal} onChange={(e) => setSingleTotal(e.target.value)} className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 6" />
              </div>
            </div>
          )}
          {mode === 'combined' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Event 1 Favorable:</label>
                <input type="number" value={event1Favorable} onChange={(e) => setEvent1Favorable(e.target.value)} className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 1" />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Event 1 Total:</label>
                <input type="number" value={event1Total} onChange={(e) => setEvent1Total(e.target.value)} className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 2" />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Event 2 Favorable:</label>
                <input type="number" value={event2Favorable} onChange={(e) => setEvent2Favorable(e.target.value)} className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 3" />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Event 2 Total:</label>
                <input type="number" value={event2Total} onChange={(e) => setEvent2Total(e.target.value)} className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 6" />
              </div>
              <div className="flex justify-center gap-4">
                <button onClick={() => setCombinedType('and')} className={`px-3 py-1 rounded-lg ${combinedType === 'and' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>AND</button>
                <button onClick={() => setCombinedType('or')} className={`px-3 py-1 rounded-lg ${combinedType === 'or' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>OR</button>
              </div>
            </div>
          )}
          {mode === 'perm_comb' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Total Items (n):</label>
                <input type="number" value={n} onChange={(e) => setN(e.target.value)} className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 5" />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Items to Choose (k):</label>
                <input type="number" value={k} onChange={(e) => setK(e.target.value)} className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 2" />
              </div>
              <div className="flex justify-center gap-4">
                <button onClick={() => setPermCombType('permutation')} className={`px-3 py-1 rounded-lg ${permCombType === 'permutation' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Permutation</button>
                <button onClick={() => setPermCombType('combination')} className={`px-3 py-1 rounded-lg ${permCombType === 'combination' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Combination</button>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-4">
            <button onClick={calculate} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all font-semibold">Calculate</button>
            <button onClick={reset} className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all font-semibold">Reset</button>
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
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Result:</h2>
            <div className="mt-2 space-y-2">
              {result.probability && mode === 'single' && (
                <p className="text-center text-xl">Probability: {result.probability} ({result.percentage}%)</p>
              )}
              {result.probability && mode === 'combined' && (
                <p className="text-center text-xl">Probability of {result.type ? result.type.toUpperCase() : ''}: {result.probability} ({result.percentage}%)</p>
              )}
              {result.count !== undefined && mode === 'perm_comb' && (
                <p className="text-center text-xl">{result.type === 'permutation' ? 'Permutations' : 'Combinations'}: {result.count}</p>
              )}
              
              <div className="text-center">
                <button onClick={() => setShowDetails(!showDetails)} className="text-sm text-blue-600 hover:underline">
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
              
              {showDetails && result && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    {mode === 'single' && (
                      <>
                        <li>P = Favorable Outcomes / Total Outcomes</li>
                        <li>P = {result.favorable} / {result.total} = {result.probability}</li>
                        <li>Percentage = {result.probability} × 100 = {result.percentage}%</li>
                      </>
                    )}
                    {mode === 'combined' && (
                      <>
                        <li>P(Event 1) = {result.e1Favorable} / {result.e1Total} = {(result.e1Favorable / result.e1Total).toFixed(4)}</li>
                        <li>P(Event 2) = {result.e2Favorable} / {result.e2Total} = {(result.e2Favorable / result.e2Total).toFixed(4)}</li>
                        {result.type === 'and' ? (
                          <li>P(A and B) = P(A) × P(B) = {(result.e1Favorable / result.e1Total).toFixed(4)} × {(result.e2Favorable / result.e2Total).toFixed(4)} = {result.probability}</li>
                        ) : (
                          <li>P(A or B) = P(A) + P(B) - P(A and B) = {(result.e1Favorable / result.e1Total).toFixed(4)} + {(result.e2Favorable / result.e2Total).toFixed(4)} - {((result.e1Favorable / result.e1Total) * (result.e2Favorable / result.e2Total)).toFixed(4)} = {result.probability}</li>
                        )}
                        <li>Percentage = {result.probability} × 100 = {result.percentage}%</li>
                      </>
                    )}
                    {mode === 'perm_comb' && (
                      <>
                        {result.type === 'permutation' ? (
                          <>
                            <li>P(n,k) = n! / (n-k)!</li>
                            <li>P({result.n},{result.k}) = {result.n}! / ({result.n}-{result.k})! = {factorial(result.n)} / {factorial(result.n - result.k)} = {result.count}</li>
                          </>
                        ) : (
                          <>
                            <li>C(n,k) = n! / (k!(n-k)!)</li>
                            <li>C({result.n},{result.k}) = {result.n}! / ({result.k}! × ({result.n}-{result.k})!) = {factorial(result.n)} / ({factorial(result.k)} × {factorial(result.n - result.k)}) = {result.count}</li>
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
      </div>
    </div>
  );
};

export default ProbabilityCalculator;