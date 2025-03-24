"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaSync, FaInfoCircle } from "react-icons/fa";

const BitArrayToBinary = () => {
  const [bitLength, setBitLength] = useState(8);
  const [bits, setBits] = useState(new Array(8).fill(false));
  const [binary, setBinary] = useState("");
  const [decimal, setDecimal] = useState(0);
  const [hex, setHex] = useState("");
  const [octal, setOctal] = useState(""); // New: Octal representation
  const [error, setError] = useState("");
  const [endianness, setEndianness] = useState("big"); // New: Big or Little Endian
  const [signed, setSigned] = useState(false); // New: Signed/Unsigned toggle

  // Update all values based on bits
  const updateValues = useCallback(
    (newBits) => {
      const binaryStr = newBits.map((bit) => (bit ? "1" : "0")).join("");
      let decimalVal = parseInt(binaryStr, 2);

      // Handle signed numbers
      if (signed && newBits[0]) {
        decimalVal = decimalVal - Math.pow(2, bitLength);
      }

      const hexVal = decimalVal.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), "0");
      const octalVal = decimalVal.toString(8).padStart(Math.ceil(bitLength / 3), "0");

      setBinary(binaryStr);
      setDecimal(decimalVal);
      setHex(hexVal);
      setOctal(octalVal);
    },
    [bitLength, signed]
  );

  // Toggle individual bit
  const handleBitChange = (index) => {
    setError("");
    const newBits = [...bits];
    newBits[index] = !newBits[index];
    setBits(newBits);
    updateValues(newBits);
  };

  // Change bit length
  const handleBitLengthChange = (newLength) => {
    setError("");
    const newBits = new Array(newLength).fill(false);
    for (let i = 0; i < Math.min(bits.length, newLength); i++) {
      newBits[endianness === "big" ? i : newLength - 1 - i] =
        bits[endianness === "big" ? i : bits.length - 1 - i];
    }
    setBitLength(newLength);
    setBits(newBits);
    updateValues(newBits);
  };

  // Handle binary input
  const handleBinaryInput = (value) => {
    setError("");
    if (/^[01]*$/.test(value) && value.length <= bitLength) {
      const newBits = new Array(bitLength).fill(false);
      for (let i = 0; i < value.length; i++) {
        newBits[bitLength - value.length + i] = value[i] === "1";
      }
      setBits(newBits);
      updateValues(newBits);
    } else {
      setError(`Invalid binary input or exceeds ${bitLength} bits`);
    }
  };

  // Clear all bits
  const clearBits = () => {
    const newBits = new Array(bitLength).fill(false);
    setBits(newBits);
    updateValues(newBits);
    setError("");
  };

  // Export values as JSON
  const exportValues = () => {
    const data = {
      bits,
      binary,
      decimal,
      hex,
      octal,
      bitLength,
      endianness,
      signed,
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bit_array_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Toggle all bits
  const toggleAllBits = () => {
    const newBits = bits.map((bit) => !bit);
    setBits(newBits);
    updateValues(newBits);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Bit Array to Binary Converter
        </h1>

        <div className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bit Length
              </label>
              <select
                value={bitLength}
                onChange={(e) => handleBitLengthChange(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {[4, 8, 16, 32, 64].map((len) => (
                  <option key={len} value={len}>
                    {len}-bit
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endianness
              </label>
              <select
                value={endianness}
                onChange={(e) => setEndianness(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="big">Big Endian (MSB first)</option>
                <option value="little">Little Endian (LSB first)</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={signed}
                  onChange={(e) => setSigned(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Signed Integer</span>
              </label>
            </div>
          </div>

          {/* Bit Array Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bit Array ({endianness === "big" ? "MSB to LSB" : "LSB to MSB"})
            </label>
            <div
              className={`grid gap-2`}
              style={{ gridTemplateColumns: `repeat(${bitLength}, minmax(0, 1fr))` }}
            >
              {bits.map((bit, index) => (
                <div key={index} className="flex flex-col items-center">
                  <input
                    type="checkbox"
                    checked={bit}
                    onChange={() => handleBitChange(index)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-xs mt-1">
                    {endianness === "big" ? bitLength - 1 - index : index}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Binary Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Binary Input (optional)
            </label>
            <input
              type="text"
              value={binary}
              onChange={(e) => handleBinaryInput(e.target.value)}
              placeholder={`Enter up to ${bitLength} bits (e.g., 1010)`}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={clearBits}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear
            </button>
            <button
              onClick={toggleAllBits}
              className="flex-1 py-2 px-4 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Toggle All
            </button>
            <button
              onClick={exportValues}
              className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Export
            </button>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Results Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <p>
                <span className="font-medium">Binary:</span> {binary}
              </p>
              <p>
                <span className="font-medium">Decimal:</span> {decimal}
              </p>
              <p>
                <span className="font-medium">Hex:</span> {hex}
              </p>
              <p>
                <span className="font-medium">Octal:</span> {octal}
              </p>
              <div className="col-span-2">
                <p className="font-medium">Bit Representation:</p>
                <div className="font-mono text-xs break-all">
                  {bits.map((bit, index) => (
                    <span
                      key={index}
                      className={bit ? "text-blue-600" : "text-gray-400"}
                    >
                      {bit ? "1" : "0"}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Features & Usage */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <details>
              <summary className="cursor-pointer font-semibold text-blue-700 flex items-center">
                <FaInfoCircle className="mr-2" /> Features & Usage
              </summary>
              <ul className="list-disc list-inside mt-2 text-blue-600 text-sm space-y-1">
                <li>Convert bits to binary, decimal, hex, and octal</li>
                <li>Adjustable bit length (4, 8, 16, 32, 64)</li>
                <li>Big/Little Endian support</li>
                <li>Signed/Unsigned integer toggle</li>
                <li>Toggle bits or enter binary directly</li>
                <li>Export results as JSON</li>
                <li>
                  Example (8-bit, Signed): [1,0,1,0,0,0,0,0] = 10100000 = -96 = A0 = 240
                </li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BitArrayToBinary;