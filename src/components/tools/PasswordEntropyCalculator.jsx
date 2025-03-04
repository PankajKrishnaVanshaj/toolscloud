// components/PasswordEntropyCalculator.js
'use client';

import React, { useState } from 'react';

const PasswordEntropyCalculator = () => {
  const [password, setPassword] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSpecial, setUseSpecial] = useState(true);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Character set sizes
  const charSets = {
    lowercase: 26, // a-z
    uppercase: 26, // A-Z
    numbers: 10,   // 0-9
    special: 32    // !@#$%^&*()_+-=[]{}|;:,.<>? etc.
  };

  // Calculate entropy
  const calculateEntropy = () => {
    setError('');
    setResults(null);

    if (!password && !useCustom) {
      setError('Please enter a password or use custom settings');
      return;
    }

    let poolSize = 0;

    if (useCustom) {
      // Custom mode: Assume character pool based on selected sets
      if (!useLowercase && !useUppercase && !useNumbers && !useSpecial) {
        setError('At least one character type must be selected in custom mode');
        return;
      }
      if (useLowercase) poolSize += charSets.lowercase;
      if (useUppercase) poolSize += charSets.uppercase;
      if (useNumbers) poolSize += charSets.numbers;
      if (useSpecial) poolSize += charSets.special;
    } else {
      // Analyze actual password character usage
      const hasLowercase = /[a-z]/.test(password);
      const hasUppercase = /[A-Z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

      if (!hasLowercase && !hasUppercase && !hasNumbers && !hasSpecial) {
        setError('Password must contain at least one character type');
        return;
      }

      if (hasLowercase) poolSize += charSets.lowercase;
      if (hasUppercase) poolSize += charSets.uppercase;
      if (hasNumbers) poolSize += charSets.numbers;
      if (hasSpecial) poolSize += charSets.special;
    }

    const length = useCustom ? password.length || 1 : password.length;
    const entropy = Math.log2(poolSize) * length; // Entropy in bits
    const combinations = Math.pow(poolSize, length);

    // Strength classification
    let strength = '';
    if (entropy < 28) strength = 'Very Weak';
    else if (entropy < 36) strength = 'Weak';
    else if (entropy < 60) strength = 'Moderate';
    else if (entropy < 128) strength = 'Strong';
    else strength = 'Very Strong';

    setResults({
      entropy: entropy.toFixed(2),
      combinations: combinations.toLocaleString(),
      poolSize,
      length,
      strength
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    calculateEntropy();
  };

  // Copy results to clipboard
  const copyToClipboard = () => {
    if (results) {
      const text = `Entropy: ${results.entropy} bits\nCombinations: ${results.combinations}\nStrength: ${results.strength}`;
      navigator.clipboard.writeText(text);
    }
  };

  // Clear all
  const clearAll = () => {
    setPassword('');
    setUseCustom(false);
    setUseLowercase(true);
    setUseUppercase(true);
    setUseNumbers(true);
    setUseSpecial(true);
    setResults(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">Password Entropy Calculator</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password (or length for custom mode)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
                placeholder={useCustom ? 'Enter length (optional)' : 'Enter password'}
              />
              {!useCustom && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              )}
            </div>
          </div>

          {/* Custom Mode Toggle */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={useCustom}
                onChange={(e) => setUseCustom(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-200"
              />
              Use Custom Character Sets
            </label>
            <p className="text-xs text-gray-500 mt-1">
              {useCustom
                ? 'Calculate based on selected character sets and length'
                : 'Calculate based on actual password characters'}
            </p>
          </div>

          {/* Character Sets (Custom Mode Only) */}
          {useCustom && (
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">Character Sets</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={useLowercase}
                    onChange={(e) => setUseLowercase(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-200"
                  />
                  Lowercase (a-z, 26)
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={useUppercase}
                    onChange={(e) => setUseUppercase(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-200"
                  />
                  Uppercase (A-Z, 26)
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={useNumbers}
                    onChange={(e) => setUseNumbers(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-200"
                  />
                  Numbers (0-9, 10)
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={useSpecial}
                    onChange={(e) => setUseSpecial(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-200"
                  />
                  Special (~32)
                </label>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Calculate Entropy
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm text-center mt-4">{error}</div>
        )}

        {/* Results */}
        {results && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Entropy Results</h2>
              <button
                onClick={copyToClipboard}
                className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Copy Results
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded border space-y-2">
              <p className="text-sm">
                <strong>Entropy:</strong> {results.entropy} bits
              </p>
              <p className="text-sm">
                <strong>Character Pool Size:</strong> {results.poolSize}
              </p>
              <p className="text-sm">
                <strong>Length:</strong> {results.length} characters
              </p>
              <p className="text-sm">
                <strong>Possible Combinations:</strong> {results.combinations}
              </p>
              <p className={`text-sm font-medium ${
                results.strength === 'Very Strong' ? 'text-green-600' :
                results.strength === 'Strong' ? 'text-green-500' :
                results.strength === 'Moderate' ? 'text-yellow-600' :
                results.strength === 'Weak' ? 'text-orange-600' : 'text-red-600'
              }`}>
                <strong>Strength:</strong> {results.strength}
              </p>
            </div>
          </div>
        )}

        {/* Note */}
        <p className="text-sm text-gray-600 mt-4">
          <strong>Note:</strong> Entropy measures randomness (bits). Higher is better. Guidelines: &lt;28 (Very Weak), 28-35 (Weak), 36-59 (Moderate), 60-127 (Strong), 128+ (Very Strong).
        </p>
      </div>
    </div>
  );
};

export default PasswordEntropyCalculator;