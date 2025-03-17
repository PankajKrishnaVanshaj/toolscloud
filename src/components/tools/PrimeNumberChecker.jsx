"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaCheck, FaTimes, FaInfoCircle, FaSync } from "react-icons/fa";

const PrimeNumberChecker = () => {
  const [number, setNumber] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showSteps, setShowSteps] = useState(false);
  const [checkRange, setCheckRange] = useState(false);
  const [rangeEnd, setRangeEnd] = useState("");
  const [primeList, setPrimeList] = useState([]);

  // Check if a number is prime
  const isPrime = useCallback((num) => {
    const n = parseInt(num);
    const steps = [`Checking if ${n} is prime:`];

    if (isNaN(n)) return { error: "Invalid number" };
    if (n <= 1) {
      steps.push(`${n} ≤ 1, so it’s not prime.`);
      return { isPrime: false, steps };
    }
    if (n === 2) {
      steps.push(`2 is the only even prime.`);
      return { isPrime: true, steps };
    }
    if (n % 2 === 0) {
      steps.push(`${n} is even and > 2, so it’s not prime.`);
      return { isPrime: false, steps };
    }

    const sqrt = Math.sqrt(n);
    steps.push(`Testing divisors up to √${n} ≈ ${sqrt.toFixed(2)}`);
    for (let i = 3; i <= sqrt; i += 2) {
      if (n % i === 0) {
        steps.push(`${n} ÷ ${i} = ${n / i}, so it’s not prime.`);
        return { isPrime: false, steps };
      }
    }
    steps.push(`No divisors found up to ${Math.floor(sqrt)}. ${n} is prime!`);
    return { isPrime: true, steps };
  }, []);

  // Generate prime numbers in range
  const generatePrimesInRange = useCallback((start, end) => {
    const primes = [];
    for (let i = Math.max(2, start); i <= end; i++) {
      if (isPrime(i).isPrime) primes.push(i);
    }
    return primes;
  }, [isPrime]);

  // Handle input change
  const handleInputChange = (e, isRangeEnd = false) => {
    const value = e.target.value;
    if (isRangeEnd) {
      setRangeEnd(value);
    } else {
      setNumber(value);
    }
    setError("");
    setResult(null);
    setPrimeList([]);
    if (value && (isNaN(value) || !Number.isInteger(parseFloat(value)))) {
      setError("Please enter a whole number");
    }
  };

  // Validate inputs
  const isValidSingle = useMemo(
    () => number && !isNaN(number) && Number.isInteger(parseFloat(number)) && !error,
    [number, error]
  );

  const isValidRange = useMemo(() => {
    return (
      checkRange &&
      number &&
      rangeEnd &&
      !isNaN(number) &&
      !isNaN(rangeEnd) &&
      Number.isInteger(parseFloat(number)) &&
      Number.isInteger(parseFloat(rangeEnd)) &&
      parseInt(number) <= parseInt(rangeEnd) &&
      !error
    );
  }, [checkRange, number, rangeEnd, error]);

  // Handle prime check
  const checkPrime = () => {
    setError("");
    setResult(null);
    setPrimeList([]);

    if (!number) {
      setError("Please enter a number");
      return;
    }

    if (checkRange) {
      const start = parseInt(number);
      const end = parseInt(rangeEnd);
      if (end < start) {
        setError("End of range must be greater than or equal to start");
        return;
      }
      const primes = generatePrimesInRange(start, end);
      setPrimeList(primes);
    } else {
      const calcResult = isPrime(number);
      if (calcResult.error) {
        setError(calcResult.error);
      } else {
        setResult(calcResult);
      }
    }
  };

  // Reset everything
  const reset = () => {
    setNumber("");
    setRangeEnd("");
    setResult(null);
    setError("");
    setShowSteps(false);
    setCheckRange(false);
    setPrimeList([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Prime Number Checker
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="w-32 text-gray-700 font-medium">
                {checkRange ? "Range Start:" : "Number:"}
              </label>
              <input
                type="number"
                step="1"
                value={number}
                onChange={(e) => handleInputChange(e)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={checkRange ? "e.g., 1" : "e.g., 17"}
                aria-label={checkRange ? "Range start" : "Number to check"}
              />
            </div>
            {checkRange && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label className="w-32 text-gray-700 font-medium">Range End:</label>
                <input
                  type="number"
                  step="1"
                  value={rangeEnd}
                  onChange={(e) => handleInputChange(e, true)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 100"
                  aria-label="Range end"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={checkRange}
              onChange={(e) => setCheckRange(e.target.checked)}
              className="accent-blue-500"
            />
            <label className="text-gray-700">Check range of numbers</label>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={checkPrime}
            disabled={!(isValidSingle || isValidRange)}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold flex items-center justify-center"
          >
            <FaCheck className="mr-2" /> Check
          </button>
          <button
            onClick={reset}
            className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all font-semibold flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Result Display */}
        {(result || primeList.length > 0) && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg transition-all">
            {result && !checkRange ? (
              <>
                <h2 className="text-lg font-semibold text-gray-700 text-center">Result:</h2>
                <p className="text-center text-xl flex items-center justify-center gap-2">
                  {result.isPrime ? (
                    <>
                      <FaCheck className="text-green-500" /> {number} is a prime number!
                    </>
                  ) : (
                    <>
                      <FaTimes className="text-red-500" /> {number} is not a prime number.
                    </>
                  )}
                </p>
                <button
                  onClick={() => setShowSteps(!showSteps)}
                  className="block mx-auto mt-2 text-sm text-blue-600 hover:underline"
                >
                  {showSteps ? "Hide Steps" : "Show Steps"}
                </button>
                {showSteps && (
                  <ul className="mt-2 text-sm list-disc list-inside transition-opacity">
                    {result.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              primeList.length > 0 && (
                <>
                  <h2 className="text-lg font-semibold text-gray-700 text-center">
                    Prime Numbers in Range:
                  </h2>
                  <p className="text-center text-sm text-gray-600">
                    From {number} to {rangeEnd}: Found {primeList.length} primes
                  </p>
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {primeList.map((prime) => (
                        <span
                          key={prime}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
                        >
                          {prime}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <FaInfoCircle /> Features
          </h3>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
            <li>Check if a single number is prime</li>
            <li>Find all primes in a range</li>
            <li>Detailed step-by-step explanation</li>
            <li>Real-time input validation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PrimeNumberChecker;