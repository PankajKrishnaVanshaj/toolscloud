'use client'
import React, { useState } from 'react';

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
  const [sequence, setSequence] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [includeWater, setIncludeWater] = useState(true); // Account for water loss in peptide bonds

  // Preset examples
  const presets = [
    { name: 'Insulin (human)', sequence: 'GIVEQCCTSICSLYQLENYCN' },
    { name: 'Ubiquitin (short)', sequence: 'MQIFVKTLTGK' },
  ];

  const calculateMass = () => {
    setError('');
    setResult(null);

    if (!sequence.trim()) {
      setError('Please enter a protein sequence');
      return;
    }

    const cleanedSequence = sequence.toUpperCase().replace(/[^A-Z]/g, '');
    if (cleanedSequence.length === 0) {
      setError('Sequence must contain valid amino acid letters');
      return;
    }

    try {
      let monoMass = 0;
      let avgMass = 0;
      const composition = {};

      // Calculate raw sum of amino acid masses
      for (const aa of cleanedSequence) {
        if (!aminoAcidMasses[aa]) {
          setError(`Invalid amino acid: ${aa}`);
          return;
        }
        monoMass += aminoAcidMasses[aa].mono;
        avgMass += aminoAcidMasses[aa].avg;
        composition[aa] = (composition[aa] || 0) + 1;
      }

      // Add terminal groups (H and OH) and subtract water for peptide bonds
      const waterMassMono = 18.01056; // H2O monoisotopic
      const waterMassAvg = 18.01528; // H2O average
      const hMassMono = 1.007825; // H monoisotopic
      const ohMassMono = 17.00274; // OH monoisotopic
      const hMassAvg = 1.00794; // H average
      const ohMassAvg = 17.00734; // OH average

      if (includeWater) {
        monoMass += hMassMono + ohMassMono; // Add H and OH termini
        avgMass += hMassAvg + ohMassAvg;
        if (cleanedSequence.length > 1) {
          const peptideBonds = cleanedSequence.length - 1;
          monoMass -= peptideBonds * waterMassMono; // Subtract water for each bond
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
      setError('Calculation error: ' + err.message);
    }
  };

  const formatNumber = (num, digits = 4) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
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
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>

          {/* Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                checked={includeWater}
                onChange={(e) => setIncludeWater(e.target.checked)}
                className="mr-2"
              />
              Include terminal groups and peptide bond water loss
            </label>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Presets
            </label>
            <div className="flex gap-2 flex-wrap">
              {presets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => setSequence(preset.sequence)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateMass}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate Mass
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md space-y-2">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <p>Monoisotopic Mass: {formatNumber(result.monoisotopic)} Da</p>
              <p>Average Mass: {formatNumber(result.average)} Da</p>
              <p>Sequence Length: {result.length} amino acids</p>
              <div>
                <p>Amino Acid Composition:</p>
                <ul className="list-disc list-inside text-sm">
                  {Object.entries(result.composition).map(([aa, count]) => (
                    <li key={aa}>{aa}: {count}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => copyToClipboard(`${formatNumber(result.monoisotopic)} Da (mono), ${formatNumber(result.average)} Da (avg)`)}
                className="mt-2 px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Copy Results
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates protein molecular mass from amino acid sequence.</p>
                <p>Features:</p>
                <ul className="list-disc list-inside">
                  <li>Monoisotopic and average mass calculations</li>
                  <li>Accounts for H₂O loss in peptide bonds (18.01 Da per bond)</li>
                  <li>Terminal H (1.0078 Da) and OH (17.0027 Da) included</li>
                  <li>Composition analysis</li>
                </ul>
                <p>Use single-letter codes (e.g., A for Alanine).</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProteinMassCalculator;