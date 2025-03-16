"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaKey } from "react-icons/fa";

const DigitalSignatureGenerator = () => {
  const [message, setMessage] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [signature, setSignature] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [keySize, setKeySize] = useState(2048); // Added key size option
  const [hashAlgorithm, setHashAlgorithm] = useState("SHA-256"); // Added hash algorithm option
  const [outputFormat, setOutputFormat] = useState("hex"); // Added output format option

  // Convert ArrayBuffer to PEM
  const arrayBufferToPem = (buffer, type) => {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    return `-----BEGIN ${type}-----\n${base64.match(/.{1,64}/g).join("\n")}\n-----END ${type}-----`;
  };

  // Convert PEM to ArrayBuffer
  const pemToArrayBuffer = (pem) => {
    const base64 = pem
      .replace(/-----BEGIN PRIVATE KEY-----/, "")
      .replace(/-----END PRIVATE KEY-----/, "")
      .replace(/\s/g, "");
    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    return buffer.buffer;
  };

  // Convert ArrayBuffer to desired format
  const arrayBufferToFormat = (buffer) => {
    const uint8Array = new Uint8Array(buffer);
    if (outputFormat === "hex") {
      return Array.from(uint8Array)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    } else if (outputFormat === "base64") {
      return btoa(String.fromCharCode(...uint8Array));
    }
    return uint8Array.join(",");
  };

  // Generate signature
  const generateSignature = useCallback(async () => {
    setLoading(true);
    setError("");
    setSignature("");

    if (!message) {
      setError("Please enter a message to sign");
      setLoading(false);
      return;
    }
    if (!privateKey) {
      setError("Please enter a private key or generate a key pair");
      setLoading(false);
      return;
    }

    try {
      const privateKeyBuffer = pemToArrayBuffer(privateKey);
      const key = await window.crypto.subtle.importKey(
        "pkcs8",
        privateKeyBuffer,
        { name: "RSA-PSS", hash: hashAlgorithm },
        true,
        ["sign"]
      );

      const encoder = new TextEncoder();
      const messageBuffer = encoder.encode(message);

      const signatureBuffer = await window.crypto.subtle.sign(
        { name: "RSA-PSS", saltLength: 32 },
        key,
        messageBuffer
      );

      const publicKeyExported = await window.crypto.subtle.exportKey("spki", key);
      const publicKeyPem = arrayBufferToPem(publicKeyExported, "PUBLIC KEY");

      setSignature(arrayBufferToFormat(signatureBuffer));
      setPublicKey(publicKeyPem);
    } catch (err) {
      setError("Signature generation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [message, privateKey, hashAlgorithm, outputFormat]);

  // Generate new RSA key pair
  const generateKeyPair = useCallback(async () => {
    setLoading(true);
    setError("");
    setSignature("");
    setPublicKey("");

    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-PSS",
          modulusLength: keySize,
          publicExponent: new Uint8Array([1, 0, 1]), // 65537
          hash: hashAlgorithm,
        },
        true,
        ["sign", "verify"]
      );

      const privateKeyExported = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
      const publicKeyExported = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);

      const privateKeyPem = arrayBufferToPem(privateKeyExported, "PRIVATE KEY");
      const publicKeyPem = arrayBufferToPem(publicKeyExported, "PUBLIC KEY");

      setPrivateKey(privateKeyPem);
      setPublicKey(publicKeyPem);
    } catch (err) {
      setError("Key pair generation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [keySize, hashAlgorithm]);

  // Download keys and signature
  const downloadText = (text, filename) => {
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    if (text) navigator.clipboard.writeText(text);
  };

  // Clear all
  const clearAll = () => {
    setMessage("");
    setPrivateKey("");
    setSignature("");
    setPublicKey("");
    setError("");
    setKeySize(2048);
    setHashAlgorithm("SHA-256");
    setOutputFormat("hex");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Digital Signature Generator
        </h1>

        <form onSubmit={(e) => { e.preventDefault(); generateSignature(); }} className="space-y-6">
          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 h-24"
              placeholder="Enter the message to sign"
              disabled={loading}
            />
          </div>

          {/* Private Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Private Key (PEM)
            </label>
            <textarea
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 h-32 font-mono text-sm"
              placeholder="Paste RSA private key in PEM format or generate one"
              disabled={loading}
            />
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key Size
              </label>
              <select
                value={keySize}
                onChange={(e) => setKeySize(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value={1024}>1024 bits</option>
                <option value={2048}>2048 bits</option>
                <option value={4096}>4096 bits</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hash Algorithm
              </label>
              <select
                value={hashAlgorithm}
                onChange={(e) => setHashAlgorithm(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="SHA-1">SHA-1</option>
                <option value="SHA-256">SHA-256</option>
                <option value="SHA-512">SHA-512</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Signature Format
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="hex">Hexadecimal</option>
                <option value="base64">Base64</option>
                <option value="decimal">Decimal</option>
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
              {loading ? "Signing..." : "Generate Signature"}
            </button>
            <button
              type="button"
              onClick={generateKeyPair}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaKey className="mr-2" />
              {loading ? "Generating..." : "Generate Key Pair"}
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        {/* Results */}
        {(signature || publicKey) && (
          <div className="mt-6 space-y-6">
            {signature && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Generated Signature ({outputFormat})</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(signature)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <FaCopy className="mr-1" /> Copy
                    </button>
                    <button
                      onClick={() => downloadText(signature, `signature-${outputFormat}.txt`)}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                    >
                      <FaDownload className="mr-1" /> Download
                    </button>
                  </div>
                </div>
                <textarea
                  value={signature}
                  readOnly
                  className="w-full p-3 border rounded-md bg-gray-50 h-24 font-mono text-sm"
                />
              </div>
            )}
            {publicKey && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Public Key (PEM)</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(publicKey)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <FaCopy className="mr-1" /> Copy
                    </button>
                    <button
                      onClick={() => downloadText(publicKey, "public-key.pem")}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                    >
                      <FaDownload className="mr-1" /> Download
                    </button>
                  </div>
                </div>
                <textarea
                  value={publicKey}
                  readOnly
                  className="w-full p-3 border rounded-md bg-gray-50 h-32 font-mono text-sm"
                />
              </div>
            )}
            {privateKey && !signature && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Private Key (PEM)</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(privateKey)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <FaCopy className="mr-1" /> Copy
                    </button>
                    <button
                      onClick={() => downloadText(privateKey, "private-key.pem")}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                    >
                      <FaDownload className="mr-1" /> Download
                    </button>
                  </div>
                </div>
                <textarea
                  value={privateKey}
                  readOnly
                  className="w-full p-3 border rounded-md bg-gray-50 h-32 font-mono text-sm"
                />
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Generate RSA-PSS signatures with customizable key sizes (1024, 2048, 4096)</li>
            <li>Support for SHA-1, SHA-256, and SHA-512 hash algorithms</li>
            <li>Output signature in Hex, Base64, or Decimal format</li>
            <li>Generate and export key pairs in PEM format</li>
            <li>Copy to clipboard and download options</li>
          </ul>
        </div>

       
      </div>
    </div>
  );
};

export default DigitalSignatureGenerator;