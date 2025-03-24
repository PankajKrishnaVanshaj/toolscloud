"use client";
import React, { useState, useCallback } from "react";
import { FaCheck, FaTimes, FaSync, FaClipboard } from "react-icons/fa";

const EmailValidator = () => {
  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState(null);
  const [validationDetails, setValidationDetails] = useState(null);
  const [strictMode, setStrictMode] = useState(false);
  const [history, setHistory] = useState([]);

  // Enhanced email validation
  const validateEmail = useCallback(() => {
    // Basic regex for general email format
    const basicRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Stricter regex (disallows certain special characters and enforces stricter domain rules)
    const strictRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;

    const isBasicValid = basicRegex.test(email);
    const isStrictValid = strictMode ? strictRegex.test(email) : true;

    const details = {
      hasAtSymbol: email.includes("@"),
      hasDomain: email.split("@")[1]?.includes("."),
      lengthValid: email.length <= 254,
      localPartValid: email.split("@")[0]?.length <= 64,
      domainPartValid: email.split("@")[1]?.length <= 255,
    };

    const finalValid = isBasicValid && isStrictValid && Object.values(details).every(Boolean);

    setIsValid(finalValid);
    setValidationDetails(details);

    if (email) {
      setHistory((prev) => [
        { email, isValid: finalValid, timestamp: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9), // Keep last 10 entries
      ]);
    }
  }, [email, strictMode]);

  // Copy email to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(email);
    alert("Email copied to clipboard!");
  };

  // Reset form
  const reset = () => {
    setEmail("");
    setIsValid(null);
    setValidationDetails(null);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Email Validator</h2>

        {/* Input Section */}
        <div className="space-y-4">
          <input
            type="text"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-400"
            placeholder="Enter email (e.g., user@example.com)"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            onKeyPress={(e) => e.key === "Enter" && validateEmail()}
          />

          {/* Settings */}
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={strictMode}
                onChange={(e) => setStrictMode(e.target.checked)}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Strict Mode</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={validateEmail}
              disabled={!email}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCheck className="mr-2" /> Validate
            </button>
            <button
              onClick={copyToClipboard}
              disabled={!email}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaClipboard className="mr-2" /> Copy
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Validation Result */}
        {isValid !== null && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p
              className={`text-center font-medium flex items-center justify-center gap-2 ${
                isValid ? "text-green-600" : "text-red-600"
              }`}
            >
              {isValid ? <FaCheck /> : <FaTimes />}
              {isValid ? "Valid Email Address" : "Invalid Email Address"}
            </p>
            {validationDetails && (
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>Has @ symbol: {validationDetails.hasAtSymbol ? "✅ Yes" : "❌ No"}</li>
                <li>Has domain: {validationDetails.hasDomain ? "✅ Yes" : "❌ No"}</li>
                <li>Length ≤ 254: {validationDetails.lengthValid ? "✅ Yes" : "❌ No"}</li>
                <li>Local part ≤ 64: {validationDetails.localPartValid ? "✅ Yes" : "❌ No"}</li>
                <li>Domain part ≤ 255: {validationDetails.domainPartValid ? "✅ Yes" : "❌ No"}</li>
              </ul>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-700 mb-2">Validation History</h3>
            <ul className="text-sm text-blue-600 space-y-1 max-h-40 overflow-y-auto">
              {history.map((entry, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span>{entry.timestamp}</span> -{" "}
                  <span
                    className={entry.isValid ? "text-green-600" : "text-red-600"}
                    onClick={() => setEmail(entry.email)}
                    title="Click to reuse"
                    style={{ cursor: "pointer" }}
                  >
                    {entry.email}
                  </span>
                  {entry.isValid ? "✅" : "❌"}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Basic and strict email validation modes</li>
            <li>Detailed validation breakdown</li>
            <li>Copy to clipboard functionality</li>
            <li>Validation history (last 10 entries)</li>
            <li>Enter key support for validation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmailValidator;