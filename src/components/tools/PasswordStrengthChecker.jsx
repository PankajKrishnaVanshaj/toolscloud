"use client";
import { useState, useCallback } from "react";
import { FaEye, FaEyeSlash, FaSync, FaCopy, FaCheck } from "react-icons/fa";

const PasswordStrengthChecker = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Enhanced strength calculation
  const getStrength = useCallback((password) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      variety: password.length > 12 && new Set(password).size >= 8, // Unique characters
    };

    score = Object.values(checks).filter(Boolean).length;
    const suggestionsList = [];
    if (!checks.length) suggestionsList.push("Make it at least 8 characters long");
    if (!checks.uppercase) suggestionsList.push("Add an uppercase letter");
    if (!checks.lowercase) suggestionsList.push("Add a lowercase letter");
    if (!checks.number) suggestionsList.push("Include a number");
    if (!checks.special) suggestionsList.push("Use a special character");
    if (!checks.variety) suggestionsList.push("Increase character variety");
    setSuggestions(suggestionsList);

    switch (score) {
      case 0:
      case 1:
        return { label: "Weak", color: "text-red-500", bgColor: "bg-red-500", progress: 25 };
      case 2:
      case 3:
        return { label: "Fair", color: "text-yellow-500", bgColor: "bg-yellow-500", progress: 50 };
      case 4:
      case 5:
        return { label: "Good", color: "text-blue-500", bgColor: "bg-blue-500", progress: 75 };
      case 6:
        return { label: "Strong", color: "text-green-500", bgColor: "bg-green-500", progress: 100 };
      default:
        return { label: "Weak", color: "text-red-500", bgColor: "bg-red-500", progress: 25 };
    }
  }, []);

  const strength = getStrength(password);

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Reset input
  const reset = () => {
    setPassword("");
    setShowPassword(false);
    setCopied(false);
    setSuggestions([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white shadow-lg rounded-xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Password Strength Checker
        </h2>

        {/* Password Input */}
        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
        </div>

        {/* Strength Indicator */}
        {password && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.bgColor} transition-all duration-300`}
                  style={{ width: `${strength.progress}%` }}
                ></div>
              </div>
              <span className={`font-semibold ${strength.color} whitespace-nowrap`}>
                {strength.label}
              </span>
            </div>

            {/* Requirements Checklist */}
            <ul className="text-sm text-gray-600 space-y-2">
              {[
                { check: password.length >= 8, text: "At least 8 characters" },
                { check: /[A-Z]/.test(password), text: "Uppercase letter" },
                { check: /[a-z]/.test(password), text: "Lowercase letter" },
                { check: /\d/.test(password), text: "Number" },
                { check: /[!@#$%^&*(),.?":{}|<>]/.test(password), text: "Special character" },
                {
                  check: password.length > 12 && new Set(password).size >= 8,
                  text: "High character variety",
                },
              ].map(({ check, text }, index) => (
                <li
                  key={index}
                  className={`flex items-center gap-2 ${
                    check ? "text-green-500" : "text-gray-400"
                  }`}
                >
                  {check ? <FaCheck size={12} /> : "○"} {text}
                </li>
              ))}
            </ul>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="text-sm font-semibold text-yellow-700 mb-1">
                  Suggestions:
                </h3>
                <ul className="text-sm text-yellow-600 list-disc list-inside">
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {password && (
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button
              onClick={copyToClipboard}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              {copied ? (
                <>
                  <FaCheck className="mr-2" /> Copied!
                </>
              ) : (
                <>
                  <FaCopy className="mr-2" /> Copy
                </>
              )}
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        )}

        {/* Placeholder */}
        {!password && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 italic">Enter a password to check its strength</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Real-time strength assessment</li>
            <li>Show/hide password toggle</li>
            <li>Detailed requirements checklist</li>
            <li>Improvement suggestions</li>
            <li>Copy to clipboard functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthChecker;