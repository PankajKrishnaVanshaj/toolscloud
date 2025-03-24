"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaDownload } from "react-icons/fa";

// Amino acid masses (monoisotopic and average, in Da)
const aminoAcidMasses = {
  A: { mono: 71.03711, avg: 71.0788 }, // Alanine
  R: { mono: 156.10111, avg: 156.1875 }, // Arginine
  N: { mono: 114.04293, avg: 114.1038 }, // Asparagine
  D: { mono: 115.02694, avg: 115.0886 }, // Aspartic acid
  C: { mono: 103.00919, avg: 103.1388 }, // Cysteine
  E: { mono: 129.04259, avg: 129.1155 }, // Glutamic acid
  Q: { mono: 128.05858, avg: 128.1307 }, // Glutamine
  G: { mono: 57.02146, avg: 57.0519 }, // Glycine
  H: { mono: 137.05891, avg: 137.1411 }, // Histidine
  I: { mono: 113.08406, avg: 113.1594 }, // Isoleucine
  L: { mono: 113.08406, avg: 113.1594 }, // Leucine
  K: { mono: 128.09496, avg: 128.1741 }, // Lysine
  M: { mono: 131.04049, avg: 131.1926 }, // Methionine
  F: { mono: 147.06841, avg: 147.1766 }, // Phenylalanine
  P: { mono: 97.05276, avg: 97.1167 }, // Proline
  S: { mono: 87.03203, avg: 87.0782 }, // Serine
  T: { mono: 101.04768, avg: 101.1051 }, // Threonine
  W: { mono: 186.07931, avg: 186.2132 }, // Tryptophan
  Y: { mono: 163.06333, avg: 163.1760 }, // Tyrosine
  V: { mono: 99.06841, avg: 99.1326 }, // Valine
};

const ProteinMassCalculator = () => {
  const [sequence, setSequence] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [includeWater, setIncludeWater] = useState(true);
  const [massType, setMassType] = useState("both"); // "mono", "avg", or "both"
  const [decimalPlaces, setDecimalPlaces] = useState(4);

  // Preset examples
  const presets = [
    { name: "Insulin (human)", sequence: "GIVEQCCTSICSLYQLENYCN" },
    { name: "Ubiquitin (short)", sequence: "MQIFVKTLTGK" },
    { name: "Bradykinin", sequence: "RPPGFSPFR" },
  ];

  const calculateMass = useCallback(() => {
    setError("");
    setResult(null);

    if (!sequence.trim()) {
      setError("Please enter a protein sequence");
      return;
    }

    const cleanedSequence = sequence.toUpperCase().replace(/[^A-Z]/g, "");
    if (cleanedSequence.length === 0) {
      setError("Sequence must contain valid amino acid letters");
      return;
    }

    try {
      let monoMass = 0;
      let avgMass = 0;
      const composition = {};

      for (const aa of cleanedSequence) {
        if (!aminoAcidMasses[aa]) {
          setError(`Invalid amino acid: ${aa}`);
          return;
        }
        monoMass += aminoAcidMasses[aa].mono;
        avgMass += aminoAcidMasses[aa].avg;
        composition[aa] = (composition[aa] || 0) + 1;
      }

      const waterMassMono = 18.01056;
      const waterMassAvg = 18.01528;
      const hMassMono = 1.007825;
      const ohMassMono = 17.00274;
      const hMassAvg = 1.00794;
      const ohMassAvg = 17.00734;

      if (includeWater) {
        monoMass += hMassMono + ohMassMono;
        avgMass += hMassAvg + ohMassAvg;
        if (cleanedSequence.length > 1) {
          const peptideBonds = cleanedSequence.length - 1;
          monoMass -= peptideBonds * waterMassMono;
          avgMass -= peptideBonds * waterMassAvg;
        }
      }

      setResult({
        monoisotopic: monoMass,
        average: avgMass,
        length: cleanedSequence.length,
        composition,
      });
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [sequence, includeWater]);

  const formatNumber = (num) => {
    return num.toLocaleString("en-US", { maximumFractionDigits: decimalPlaces });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadResults = () => {
    if (!result) return;
    const text = `
Protein Mass Calculation Results
-------------------------------
Sequence: ${sequence.toUpperCase().replace(/[^A-Z]/g, "")}
Length: ${result.length} amino acids
${
  massType === "both" || massType === "mono"
    ? `Monoisotopic Mass: ${formatNumber(result.monoisotopic)} Da`
    : ""
}
${
  massType === "both" || massType === "avg" ? `Average Mass: ${formatNumber(result.average)} Da` : ""
}
Composition:
${Object.entries(result.composition)
  .map(([aa, count]) => `${aa}: ${count}`)
  .join("\n")}
    `.trim();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `protein_mass_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setSequence("");
    setResult(null);
    setError("");
    setIncludeWater(true);
    setMassType("both");
    setDecimalPlaces(4);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Protein Mass Calculator
        </h1>

        <div className="space-y-6">
          {/* Sequence Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amino Acid Sequence (Single-letter code)
            </label>
            <textarea
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              placeholder="e.g., GIVEQCCTSICSLYQLENYCN"
              className="w-full h-32 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={includeWater}
                  onChange={(e) => setIncludeWater(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                Include terminal groups & peptide bond water loss
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mass Type
              </label>
              <select
                value={massType}
                onChange={(e) => setMassType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="both">Both (Mono & Avg)</option>
                <option value="mono">Monoisotopic Only</option>
                <option value="avg">Average Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimal Places ({decimalPlaces})
              </label>
              <input
                type="range"
                min="1"
                max="6"
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presets</label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setSequence(preset.sequence)}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateMass}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Calculate Mass
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Results:</h2>
              <div className="space-y-2">
                {(massType === "both" || massType === "mono") && (
                  <p>
                    Monoisotopic Mass: {formatNumber(result.monoisotopic)} Da
                  </p>
                )}
                {(massType === "both" || massType === "avg") && (
                  <p>Average Mass: {formatNumber(result.average)} Da</p>
                )}
                <p>Sequence Length: {result.length} amino acids</p>
                <div>
                  <p className="font-medium">Amino Acid Composition:</p>
                  <ul className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-sm">
                    {Object.entries(result.composition).map(([aa, count]) => (
                      <li key={aa}>
                        {aa}: {count}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    copyToClipboard(
                      `${formatNumber(result.monoisotopic)} Da (mono), ${formatNumber(
                        result.average
                      )} Da (avg)`
                    )
                  }
                  className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
                <button
                  onClick={downloadResults}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Monoisotopic and average mass calculations</li>
              <li>Adjustable decimal precision (1-6)</li>
              <li>Terminal groups and peptide bond water loss option</li>
              <li>Amino acid composition analysis</li>
              <li>Preset sequences for quick testing</li>
              <li>Copy and download results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProteinMassCalculator;