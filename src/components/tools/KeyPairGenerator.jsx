"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync } from "react-icons/fa";

const KeyPairGenerator = () => {
  const [keySize, setKeySize] = useState(2048);
  const [keyType, setKeyType] = useState("RSA-OAEP"); // RSA-OAEP or RSASSA-PKCS1-v1_5
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [format, setFormat] = useState("PEM"); // PEM or JWK
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Generate key pair
  const generateKeyPair = useCallback(async () => {
    setLoading(true);
    setError("");
    setPublicKey("");
    setPrivateKey("");

    try {
      const algorithm = {
        name: keyType,
        modulusLength: keySize,
        publicExponent: new Uint8Array([1, 0, 1]), // 65537
        hash: "SHA-256",
      };

      const keyPair = await window.crypto.subtle.generateKey(
        algorithm,
        true,
        keyType === "RSA-OAEP" ? ["encrypt", "decrypt"] : ["sign", "verify"]
      );

      // Export keys
      const publicFormat = format === "PEM" ? "spki" : "jwk";
      const privateFormat = format === "PEM" ? "pkcs8" : "jwk";

      const publicKeyExported = await window.crypto.subtle.exportKey(publicFormat, keyPair.publicKey);
      const privateKeyExported = await window.crypto.subtle.exportKey(privateFormat, keyPair.privateKey);

      if (format === "PEM") {
        setPublicKey(formatToPem(publicKeyExported, "PUBLIC KEY"));
        setPrivateKey(formatToPem(privateKeyExported, "PRIVATE KEY"));
      } else {
        setPublicKey(JSON.stringify(publicKeyExported, null, 2));
        setPrivateKey(JSON.stringify(privateKeyExported, null, 2));
      }
    } catch (err) {
      setError("Key pair generation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [keySize, keyType, format]);

  // Convert ArrayBuffer to PEM format
  const formatToPem = (keyData, type) => {
    const base64 = window.btoa(String.fromCharCode(...new Uint8Array(keyData)));
    return `-----BEGIN ${type}-----\n${base64.match(/.{1,64}/g).join("\n")}\n-----END ${type}-----`;
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    if (text) navigator.clipboard.writeText(text);
  };

  // Download key as file
  const downloadKey = (key, type) => {
    if (!key) return;
    const blob = new Blob([key], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${type.toLowerCase()}-key-${Date.now()}.${format.toLowerCase()}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Clear all
  const clearAll = () => {
    setPublicKey("");
    setPrivateKey("");
    setError("");
    setKeySize(2048);
    setKeyType("RSA-OAEP");
    setFormat("PEM");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          RSA Key Pair Generator
        </h1>

        {/* Form */}
        <form onSubmit={(e) => { e.preventDefault(); generateKeyPair(); }} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Key Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Size</label>
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
              <p className="text-xs text-gray-500 mt-1">
                Larger keys are more secure but slower.
              </p>
            </div>

            {/* Key Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Type</label>
              <select
                value={keyType}
                onChange={(e) => setKeyType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="RSA-OAEP">RSA-OAEP (Encryption)</option>
                <option value="RSASSA-PKCS1-v1_5">RSASSA-PKCS1-v1_5 (Signing)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose based on use case: encryption or signing.
              </p>
            </div>

            {/* Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="PEM">PEM</option>
                <option value="JWK">JWK (JSON Web Key)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                PEM is traditional; JWK is JSON-based.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : null}
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
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Generated Keys */}
        {(publicKey || privateKey) && (
          <div className="mt-6 space-y-6">
            {["Public Key", "Private Key"].map((type) => (
              <div key={type}>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-800">{type}</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(type === "Public Key" ? publicKey : privateKey)}
                      className="flex items-center px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FaCopy className="mr-1" /> Copy
                    </button>
                    <button
                      onClick={() => downloadKey(type === "Public Key" ? publicKey : privateKey, type.split(" ")[0])}
                      className="flex items-center px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <FaDownload className="mr-1" /> Download
                    </button>
                  </div>
                </div>
                <textarea
                  value={type === "Public Key" ? publicKey : privateKey}
                  readOnly
                  className="w-full p-2 border rounded-md bg-gray-50 h-40 font-mono text-sm resize-y"
                  placeholder={`${type} will appear here`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Generate RSA keys with 1024, 2048, or 4096 bits</li>
            <li>Support for RSA-OAEP (encryption) and RSASSA-PKCS1-v1_5 (signing)</li>
            <li>Output in PEM or JWK format</li>
            <li>Copy keys to clipboard or download as files</li>
            <li>Local generation using Web Crypto API</li>
          </ul>
        </div>

        {/* Security Note */}
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-700 text-sm">
            <strong>Note:</strong> Keys are generated locally in your browser. Store the private key securely and never share it. Use 4096 bits for maximum security.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyPairGenerator;