"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaTrash, FaSync, FaLock, FaFileDownload } from "react-icons/fa";

const SecureFileShredder = () => {
  const [file, setFile] = useState(null);
  const [passes, setPasses] = useState(3);
  const [shredMethod, setShredMethod] = useState("random"); // random, zeros, ones
  const [shredStatus, setShredStatus] = useState("idle");
  const [progress, setProgress] = useState(0); // Progress percentage
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Simulate secure file shredding
  const shredFile = useCallback(async () => {
    if (!file) {
      setError("Please select a file to shred");
      return;
    }
    if (passes < 1 || passes > 35) {
      setError("Number of passes must be between 1 and 35");
      return;
    }

    setShredStatus("shredding");
    setError("");
    setProgress(0);

    try {
      const reader = new FileReader();
      const fileContent = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsArrayBuffer(file);
      });

      const fileSize = file.size;
      let shreddedData = new Uint8Array(fileContent);

      for (let pass = 1; pass <= passes; pass++) {
        let overwriteData;
        switch (shredMethod) {
          case "random":
            overwriteData = new Uint8Array(fileSize);
            window.crypto.getRandomValues(overwriteData);
            break;
          case "zeros":
            overwriteData = new Uint8Array(fileSize).fill(0);
            break;
          case "ones":
            overwriteData = new Uint8Array(fileSize).fill(255);
            break;
          default:
            overwriteData = new Uint8Array(fileSize);
            window.crypto.getRandomValues(overwriteData);
        }

        shreddedData = overwriteData;
        const progressPercentage = Math.round((pass / passes) * 100);
        setProgress(progressPercentage);
        await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
      }

      shreddedData.fill(0);
      setShredStatus("complete");
    } catch (err) {
      setError("Shredding simulation failed: " + err.message);
      setShredStatus("error");
    }
  }, [file, passes, shredMethod]);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setShredStatus("idle");
      setProgress(0);
      setError("");
    }
  };

  // Reset everything
  const reset = () => {
    setFile(null);
    setPasses(3);
    setShredMethod("random");
    setShredStatus("idle");
    setProgress(0);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Download shredded "proof" (simulated)
  const downloadProof = () => {
    if (shredStatus !== "complete") return;
    const proofText = `File: ${file.name}\nSize: ${file.size} bytes\nShredded on: ${new Date().toISOString()}\nPasses: ${passes}\nMethod: ${shredMethod}\nStatus: Shredded (simulated)`;
    const blob = new Blob([proofText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `shred-proof-${file.name}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Secure File Shredder Simulator
        </h1>

        {/* File Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select File
          </label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {file && (
            <p className="text-sm text-gray-600 mt-2">
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        {/* Shredding Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Passes (1-35)
            </label>
            <input
              type="number"
              value={passes}
              onChange={(e) => setPasses(Math.max(1, Math.min(35, parseInt(e.target.value))))}
              min={1}
              max={35}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={shredStatus === "shredding"}
            />
            <p className="text-xs text-gray-500 mt-1">
              Higher passes increase security (simulated).
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shredding Method
            </label>
            <select
              value={shredMethod}
              onChange={(e) => setShredMethod(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={shredStatus === "shredding"}
            >
              <option value="random">Random Data</option>
              <option value="zeros">Zeros</option>
              <option value="ones">Ones</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Choose overwrite pattern.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={shredFile}
            disabled={shredStatus === "shredding" || !file}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaLock className="mr-2" />
            {shredStatus === "shredding" ? "Shredding..." : "Shred File"}
          </button>
          <button
            onClick={downloadProof}
            disabled={shredStatus !== "complete"}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaFileDownload className="mr-2" /> Download Proof
          </button>
          <button
            onClick={reset}
            disabled={shredStatus === "shredding"}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Progress and Status */}
        {shredStatus !== "idle" && (
          <div className="mb-6">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Shredding Status</h2>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>File:</strong> {file ? file.name : "None"}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Method:</strong> {shredMethod}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Progress:</strong> {progress}%
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm">
                  <strong>Status:</strong>{" "}
                  {shredStatus === "shredding" && (
                    <span className="text-blue-600">Shredding in progress...</span>
                  )}
                  {shredStatus === "complete" && (
                    <span className="text-green-600">✓ Shredding completed</span>
                  )}
                  {shredStatus === "error" && (
                    <span className="text-red-600">Shredding failed</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Features */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Simulated secure file shredding</li>
            <li>Customizable passes (1-35)</li>
            <li>Multiple shredding methods: Random, Zeros, Ones</li>
            <li>Progress bar with real-time updates</li>
            <li>Download shredding proof</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default SecureFileShredder;