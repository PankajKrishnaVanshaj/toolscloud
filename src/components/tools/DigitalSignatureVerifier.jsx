"use client";
import React, { useState, useCallback } from "react";
import { FaCheck, FaTimes, FaSync, FaFileUpload } from "react-icons/fa";

const DigitalSignatureVerifier = () => {
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [algorithm, setAlgorithm] = useState("RSA-PSS"); // New: Algorithm selection
  const [hash, setHash] = useState("SHA-256"); // New: Hash function selection

  // Convert PEM to ArrayBuffer
  const pemToArrayBuffer = (pem) => {
    const base64 = pem
      .replace(/-----BEGIN PUBLIC KEY-----/, "")
      .replace(/-----END PUBLIC KEY-----/, "")
      .replace(/\s/g, "");
    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    return buffer.buffer;
  };

  // Verify signature
  const verifySignature = useCallback(async () => {
    setLoading(true);
    setError("");
    setResults(null);

    if (!message) {
      setError("Please enter a message");
      setLoading(false);
      return;
    }
    if (!signature) {
      setError("Please enter a signature");
      setLoading(false);
      return;
    }
    if (!publicKey) {
      setError("Please enter a public key");
      setLoading(false);
      return;
    }

    try {
      const publicKeyBuffer = pemToArrayBuffer(publicKey);
      let key, verifyParams;

      if (algorithm === "RSA-PSS") {
        key = await window.crypto.subtle.importKey(
          "spki",
          publicKeyBuffer,
          { name: "RSA-PSS", hash },
          false,
          ["verify"]
        );
        verifyParams = { name: "RSA-PSS", saltLength: 32 };
      } else if (algorithm === "RSASSA-PKCS1-v1_5") {
        key = await window.crypto.subtle.importKey(
          "spki",
          publicKeyBuffer,
          { name: "RSASSA-PKCS1-v1_5", hash },
          false,
          ["verify"]
        );
        verifyParams = { name: "RSASSA-PKCS1-v1_5" };
      } else {
        throw new Error("Unsupported algorithm");
      }

      // Convert signature from hex to ArrayBuffer
      const signatureBuffer = new Uint8Array(
        signature.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
      );

      if (signatureBuffer.length === 0) {
        throw new Error("Invalid signature format");
      }

      // Convert message to ArrayBuffer
      const encoder = new TextEncoder();
      const messageBuffer = encoder.encode(message);

      // Verify signature
      const isValid = await window.crypto.subtle.verify(
        verifyParams,
        key,
        signatureBuffer,
        messageBuffer
      );

      setResults({
        isValid,
        messageLength: message.length,
        signatureLength: signatureBuffer.length,
        algorithm,
        hash,
      });
    } catch (err) {
      setError("Verification failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [message, signature, publicKey, algorithm, hash]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    verifySignature();
  };

  // Clear all fields
  const clearAll = () => {
    setMessage("");
    setSignature("");
    setPublicKey("");
    setResults(null);
    setError("");
    setAlgorithm("RSA-PSS");
    setHash("SHA-256");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Digital Signature Verifier
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-28 resize-y"
              placeholder="Enter the signed message"
              disabled={loading}
            />
          </div>

          {/* Signature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Signature (Hex)
            </label>
            <textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-28 font-mono text-sm resize-y"
              placeholder="Enter the signature in hexadecimal format (e.g., 1a2b3c...)"
              disabled={loading}
            />
          </div>

          {/* Public Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Public Key (PEM)
            </label>
            <textarea
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-36 font-mono text-sm resize-y"
              placeholder="Paste RSA public key in PEM format (e.g., -----BEGIN PUBLIC KEY-----...)"
              disabled={loading}
            />
          </div>

          {/* Algorithm and Hash Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Algorithm
              </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="RSA-PSS">RSA-PSS</option>
                <option value="RSASSA-PKCS1-v1_5">RSASSA-PKCS1-v1_5</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hash Function
              </label>
              <select
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="SHA-256">SHA-256</option>
                <option value="SHA-384">SHA-384</option>
                <option value="SHA-512">SHA-512</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCheck className="mr-2" />
              {loading ? "Verifying..." : "Verify Signature"}
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" />
              Clear
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm">
            <FaTimes className="inline mr-2" />
            {error}
          </div>
        )}

        {/* Verification Results */}
        {results && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h2 className="text-lg font-semibold text-green-700 mb-2">
              Verification Results
            </h2>
            <div className="space-y-2 text-sm text-green-600">
              <p className={results.isValid ? "text-green-600" : "text-red-600"}>
                <strong>Signature:</strong>{" "}
                {results.isValid ? "✓ Valid" : "✗ Invalid"}
              </p>
              <p>
                <strong>Message Length:</strong> {results.messageLength} characters
              </p>
              <p>
                <strong>Signature Length:</strong> {results.signatureLength} bytes
              </p>
              <p>
                <strong>Algorithm:</strong> {results.algorithm}
              </p>
              <p>
                <strong>Hash Function:</strong> {results.hash}
              </p>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Verify RSA-PSS and RSASSA-PKCS1-v1_5 signatures</li>
            <li>Support for SHA-256, SHA-384, and SHA-512 hash functions</li>
            <li>Client-side verification using Web Crypto API</li>
            <li>Detailed verification results</li>
          </ul>
        </div>

       
      </div>
    </div>
  );
};

export default DigitalSignatureVerifier;