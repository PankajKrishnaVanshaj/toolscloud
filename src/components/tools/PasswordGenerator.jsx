"use client";

import React, { useState, useCallback, useEffect } from "react";
import { FaCopy, FaSync, FaEye, FaEyeSlash, FaDownload } from "react-icons/fa";

const PasswordGenerator = () => {
  const [length, setLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [history, setHistory] = useState([]);

  const generatePassword = useCallback(() => {
    const uppercaseChars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijkmnpqrstuvwxyz";
    const numberChars = "23456789";
    const symbolChars = "!@#$%^&*+-=[]{}|;:,.?";
    const similarChars = "Il1O0";
    const ambiguousChars = "{}[]()/\\'\"`,;:.<>";

    let charSet = "";
    if (includeUppercase) charSet += uppercaseChars;
    if (includeLowercase) charSet += lowercaseChars;
    if (includeNumbers) charSet += numberChars;
    if (includeSymbols) charSet += symbolChars;

    if (excludeSimilar) charSet = charSet.split("").filter(c => !similarChars.includes(c)).join("");
    if (excludeAmbiguous) charSet = charSet.split("").filter(c => !ambiguousChars.includes(c)).join("");

    if (!charSet) {
      setPassword("Please select at least one character type");
      setStrength("");
      setCopied(false);
      return;
    }

    let generated = "";
    for (let i = 0; i < length; i++) {
      generated += charSet[Math.floor(Math.random() * charSet.length)];
    }

    // Ensure at least one character from each selected type
    if (includeUppercase) generated = replaceRandomChar(generated, uppercaseChars);
    if (includeLowercase) generated = replaceRandomChar(generated, lowercaseChars);
    if (includeNumbers) generated = replaceRandomChar(generated, numberChars);
    if (includeSymbols) generated = replaceRandomChar(generated, symbolChars);

    setPassword(generated);
    setHistory(prev => [generated, ...prev].slice(0, 5));
    setStrength(calculateStrength(generated));
    setCopied(false);
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar, excludeAmbiguous]);

  const replaceRandomChar = (str, charSet) => {
    const randomIndex = Math.floor(Math.random() * str.length);
    const randomChar = charSet[Math.floor(Math.random() * charSet.length)];
    return str.substring(0, randomIndex) + randomChar + str.substring(randomIndex + 1);
  };

  const calculateStrength = (pwd) => {
    let score = 0;
    if (pwd.length > 8) score += 1;
    if (pwd.length > 12) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[!@#$%^&*+\-=\[\]{}|;:,.?]/.test(pwd)) score += 1;

    if (score <= 2) return "Weak";
    if (score <= 4) return "Medium";
    return "Strong";
  };

  const handleCopy = () => {
    if (password && password !== "Please select at least one character type") {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([password], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `password-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setLength(12);
    setIncludeUppercase(true);
    setIncludeLowercase(true);
    setIncludeNumbers(true);
    setIncludeSymbols(true);
    setExcludeSimilar(false);
    setExcludeAmbiguous(false);
    setPassword("");
    setStrength("");
    setCopied(false);
  };

  useEffect(() => {
    generatePassword();
  }, []);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Password Generator</h2>

        {/* Options Form */}
        <form onSubmit={(e) => { e.preventDefault(); generatePassword(); }} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Length: {length}
            </label>
            <input
              type="range"
              min="4"
              max="32"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Uppercase (A-Z)", state: includeUppercase, setter: setIncludeUppercase },
              { label: "Lowercase (a-z)", state: includeLowercase, setter: setIncludeLowercase },
              { label: "Numbers (0-9)", state: includeNumbers, setter: setIncludeNumbers },
              { label: "Symbols (!@#$%)", state: includeSymbols, setter: setIncludeSymbols },
              { label: "Exclude Similar (Il1O0)", state: excludeSimilar, setter: setExcludeSimilar },
              { label: "Exclude Ambiguous ({})", state: excludeAmbiguous, setter: setExcludeAmbiguous },
            ].map((option) => (
              <label key={option.label} className="flex items-center">
                <input
                  type="checkbox"
                  checked={option.state}
                  onChange={(e) => option.setter(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate Password
          </button>
        </form>

        {/* Generated Password */}
        {password && (
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">Generated Password</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-gray-600 hover:text-gray-800"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                <button
                  onClick={handleCopy}
                  className={`px-3 py-1 text-sm rounded transition-colors ${copied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  <FaCopy className="inline mr-1" /> {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  <FaDownload className="inline mr-1" /> Download
                </button>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
              <p className="text-lg font-mono text-gray-800 break-all">
                {showPassword ? password : "••••••••••••"}
              </p>
              <span className={`text-sm px-2 py-1 rounded ${strength === "Strong" ? "bg-green-100 text-green-700" : strength === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                {strength}
              </span>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Recent Passwords (Last 5)</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.map((pwd, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="font-mono">{pwd.slice(0, 20)}{pwd.length > 20 ? "..." : ""}</span>
                  <button
                    onClick={() => { setPassword(pwd); setStrength(calculateStrength(pwd)); }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Reuse
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable length (4-32 characters)</li>
            <li>Multiple character type options</li>
            <li>Exclude similar/ambiguous characters</li>
            <li>Password strength indicator</li>
            <li>Copy and download functionality</li>
            <li>Password history tracking</li>
            <li>Show/hide password toggle</li>
          </ul>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="mt-4 w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
        >
          <FaSync className="mr-2" /> Reset All
        </button>
      </div>
    </div>
  );
};

export default PasswordGenerator;