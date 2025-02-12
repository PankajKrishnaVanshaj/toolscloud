"use client";
import { useState } from "react";

const HashGenerator = () => {
  const [input, setInput] = useState("");
  const [hash, setHash] = useState("");
  const [algorithm, setAlgorithm] = useState("SHA-256");
  const [compareHash, setCompareHash] = useState("");
  const [matchResult, setMatchResult] = useState("");
  const [error, setError] = useState("");

  const generateHash = async (data) => {
    try {
      setError("");
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest(algorithm, encodedData);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      setHash(hashHex);
      setMatchResult("");
    } catch (e) {
      setError("Failed to generate hash. Please try again.");
    }
  };

  const handleTextHash = () => generateHash(input);

  const compareHashes = () => {
    if (hash === compareHash) {
      setMatchResult("The hashes match!");
    } else {
      setMatchResult("The hashes do not match.");
    }
  };

  const downloadHash = () => {
    const blob = new Blob([hash], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hash.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hash).then(() => {
      alert("Hash copied to clipboard!");
    });
  };

  const clearFields = () => {
    setInput("");
    setHash("");
    setCompareHash("");
    setMatchResult("");
    setError("");
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">
      <label className="block mb-2 font-semibold bg-gradient-to-r from-secondary to-primary text-transparent bg-clip-text">
        Enter Text:
      </label>
      <input
        type="text"
        className="border p-2 w-full mb-2 rounded-md"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter text to hash"
      />

      <label className="block mb-2 font-semibold bg-gradient-to-r from-secondary to-primary text-transparent bg-clip-text">
        Select Algorithm:
      </label>
      <select
        value={algorithm}
        onChange={(e) => setAlgorithm(e.target.value)}
        className="border p-2 w-full mb-4 rounded-md"
      >
        <option value="SHA-1">SHA-1</option>
        <option value="SHA-256">SHA-256</option>
        <option value="SHA-384">SHA-384</option>
        <option value="SHA-512">SHA-512</option>
      </select>

      <div className="flex space-x-4 mb-4">
        <button
          onClick={handleTextHash}
          className="px-4 py-2 text-primary font-semibold border hover:border-secondary rounded-lg"
        >
          Generate Hash
        </button>
      </div>

      {hash && (
        <div className="mt-3">
          <p className="break-all">{hash}</p>
          <div className="flex space-x-4 mt-2">
            <button
              onClick={downloadHash}
              className="px-4 py-2 bg-secondary/80 text-white font-semibold rounded-lg hover:bg-secondary/90"
            >
              Download Hash
            </button>
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-primary/90 text-white font-semibold rounded-lg hover:bg-primary"
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}

      <label className="block mt-4 mb-2 font-semibold bg-gradient-to-r from-secondary to-primary text-transparent bg-clip-text">
        Compare Hash:
      </label>
      <input
        type="text"
        className="border p-2 w-full mb-2 rounded-md"
        value={compareHash}
        onChange={(e) => setCompareHash(e.target.value)}
        placeholder="Enter hash to compare"
      />
      <button
        onClick={compareHashes}
        className="px-4 py-2 mr-2 text-secondary font-semibold border hover:border-primary rounded-lg "
      >
        Compare
      </button>

      {matchResult && (
        <p
          className={`mt-2 font-semibold ${
            matchResult.includes("match") ? "text-green-600" : "text-red-600"
          }`}
        >
          {matchResult}
        </p>
      )}

      {error && <p className="mt-2 text-red-600 font-semibold">{error}</p>}

      <button
        onClick={clearFields}
        className="mt-4 px-4 py-2 text-primary font-semibold border hover:border-secondary  rounded-lg"
      >
        Clear All
      </button>
    </div>
  );
};

export default HashGenerator;
