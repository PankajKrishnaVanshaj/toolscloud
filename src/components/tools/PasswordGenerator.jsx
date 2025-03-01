"use client";

import React, { useState } from 'react';

const PasswordGenerator = () => {
  const [length, setLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let charSet = '';
    if (includeUppercase) charSet += uppercaseChars;
    if (includeLowercase) charSet += lowercaseChars;
    if (includeNumbers) charSet += numberChars;
    if (includeSymbols) charSet += symbolChars;

    if (charSet === '') {
      setPassword('Please select at least one character type');
      setCopied(false);
      return;
    }

    let generated = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charSet.length);
      generated += charSet[randomIndex];
    }

    // Ensure at least one character from each selected type
    if (includeUppercase) generated = replaceRandomChar(generated, uppercaseChars);
    if (includeLowercase) generated = replaceRandomChar(generated, lowercaseChars);
    if (includeNumbers) generated = replaceRandomChar(generated, numberChars);
    if (includeSymbols) generated = replaceRandomChar(generated, symbolChars);

    setPassword(generated);
    setCopied(false);
  };

  const replaceRandomChar = (str, charSet) => {
    const randomIndex = Math.floor(Math.random() * str.length);
    const randomChar = charSet[Math.floor(Math.random() * charSet.length)];
    return str.substring(0, randomIndex) + randomChar + str.substring(randomIndex + 1);
  };

  const handleCopy = () => {
    if (password && password !== 'Please select at least one character type') {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generatePassword();
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Password Generator</h2>

        {/* Options Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password Length: {length}
            </label>
            <input
              type="range"
              min="4"
              max="32"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeUppercase}
                onChange={(e) => setIncludeUppercase(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Uppercase (A-Z)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeLowercase}
                onChange={(e) => setIncludeLowercase(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Lowercase (a-z)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Numbers (0-9)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Symbols (!@#$%)</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Password
          </button>
        </form>

        {/* Generated Password */}
        {password && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Generated Password</h3>
              <button
                onClick={handleCopy}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-lg font-mono text-gray-800 break-all">{password}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!password && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Customize your password by selecting the options above and clicking "Generate Password".</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordGenerator;