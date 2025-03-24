"use client";
import React, { useState, useCallback } from "react";
import { generate } from "randomstring";
import { FaCopy, FaDownload, FaSync, FaLock } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading as image

const SecureBackupCodeGenerator = () => {
  const [codeLength, setCodeLength] = useState(8);
  const [codeCount, setCodeCount] = useState(10);
  const [format, setFormat] = useState("alphanumeric");
  const [separator, setSeparator] = useState("");
  const [caseOption, setCaseOption] = useState("mixed"); // mixed, upper, lower
  const [includeSpecial, setIncludeSpecial] = useState(false);
  const [codes, setCodes] = useState([]);
  const [error, setError] = useState("");
  const codesRef = React.useRef(null);

  // Generate secure backup codes
  const generateCodes = useCallback(() => {
    setError("");
    setCodes([]);

    if (codeLength < 6 || codeLength > 32) {
      setError("Code length must be between 6 and 32 characters");
      return;
    }
    if (codeCount < 1 || codeCount > 100) {
      setError("Number of codes must be between 1 and 100");
      return;
    }

    const charset =
      format === "numeric"
        ? "numeric"
        : format === "alphabetic"
        ? "alphabetic"
        : includeSpecial
        ? "alphanumeric!@#$%^&*"
        : "alphanumeric";

    const newCodes = Array.from({ length: codeCount }, () => {
      let code = generate({
        length: codeLength,
        charset,
        capitalization:
          format === "alphabetic" || format === "alphanumeric"
            ? caseOption === "upper"
              ? "uppercase"
              : caseOption === "lower"
              ? "lowercase"
              : undefined
            : undefined,
      });

      // Add separator if specified and length allows
      if (separator && codeLength >= 4) {
        const mid = Math.floor(codeLength / 2);
        code = `${code.slice(0, mid)}${separator}${code.slice(mid)}`;
      }

      return code;
    });

    setCodes(newCodes);
  }, [codeLength, codeCount, format, separator, caseOption, includeSpecial]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    generateCodes();
  };

  // Copy codes to clipboard
  const copyToClipboard = () => {
    if (codes.length > 0) {
      const text = codes.join("\n");
      navigator.clipboard.writeText(text);
    }
  };

  // Download codes as PNG
  const downloadCodes = () => {
    if (codesRef.current && codes.length > 0) {
      html2canvas(codesRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `backup-codes-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Clear all
  const clearAll = () => {
    setCodeLength(8);
    setCodeCount(10);
    setFormat("alphanumeric");
    setSeparator("");
    setCaseOption("mixed");
    setIncludeSpecial(false);
    setCodes([]);
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Secure Backup Code Generator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid Layout for Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Code Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code Length (6-32)
              </label>
              <input
                type="number"
                value={codeLength}
                onChange={(e) => setCodeLength(parseInt(e.target.value))}
                min={6}
                max={32}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Number of Codes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Codes (1-100)
              </label>
              <input
                type="number"
                value={codeCount}
                onChange={(e) => setCodeCount(parseInt(e.target.value))}
                min={1}
                max={100}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="alphanumeric">Alphanumeric</option>
                <option value="numeric">Numeric</option>
                <option value="alphabetic">Alphabetic</option>
              </select>
            </div>

            {/* Separator Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Separator
              </label>
              <select
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                <option value="-">Dash (-)</option>
                <option value=" ">Space</option>
                <option value=".">Dot (.)</option>
              </select>
            </div>

            {/* Case Option */}
            {(format === "alphabetic" || format === "alphanumeric") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Case
                </label>
                <select
                  value={caseOption}
                  onChange={(e) => setCaseOption(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mixed">Mixed</option>
                  <option value="upper">Uppercase</option>
                  <option value="lower">Lowercase</option>
                </select>
              </div>
            )}

            {/* Special Characters */}
            {format === "alphanumeric" && (
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeSpecial}
                    onChange={(e) => setIncludeSpecial(e.target.checked)}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Include Special (!@#$%^&*)</span>
                </label>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaLock className="mr-2" /> Generate Codes
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear All
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-2 bg-red-50 text-red-700 text-sm text-center rounded-md">
            {error}
          </div>
        )}

        {/* Generated Codes */}
        {codes.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Generated Backup Codes</h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="py-1 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FaCopy className="mr-1" /> Copy
                </button>
                <button
                  onClick={downloadCodes}
                  className="py-1 px-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-1" /> Download
                </button>
              </div>
            </div>
            <div
              ref={codesRef}
              className="bg-gray-50 p-4 rounded-lg border max-h-64 overflow-y-auto"
            >
              <ul className="list-disc pl-5 font-mono text-gray-700">
                {codes.map((code, index) => (
                  <li key={index} className="py-1">{code}</li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Store these codes securely. Each code can typically be used only once.
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable code length (6-32) and count (1-100)</li>
            <li>Formats: Alphanumeric, Numeric, Alphabetic</li>
            <li>Case options: Mixed, Uppercase, Lowercase</li>
            <li>Optional special characters for alphanumeric</li>
            <li>Separators: None, Dash, Space, Dot</li>
            <li>Copy to clipboard and download as PNG</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SecureBackupCodeGenerator;