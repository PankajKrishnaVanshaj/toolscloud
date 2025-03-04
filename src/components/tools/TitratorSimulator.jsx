'use client'
import React, { useState, useEffect, useRef } from 'react';

const TitratorSimulator = () => {
  const [acid, setAcid] = useState('HCl'); // Acid type
  const [base, setBase] = useState('NaOH'); // Base type
  const [acidConc, setAcidConc] = useState(0.1); // Acid concentration (M)
  const [baseConc, setBaseConc] = useState(0.1); // Base concentration (M)
  const [acidVolume, setAcidVolume] = useState(50); // Acid volume (mL)
  const canvasRef = useRef(null);

  // Acid/Base properties (pKa values for weak acids/bases)
  const acidData = {
    'HCl': { strong: true, pKa: -6 },
    'CH3COOH': { strong: false, pKa: 4.76 }, // Acetic acid
  };

  const baseData = {
    'NaOH': { strong: true, pKb: -1.8 },
    'NH3': { strong: false, pKb: 4.75 }, // Ammonia
  };

  useEffect(() => {
    drawTitrationCurve();
  }, [acid, base, acidConc, baseConc, acidVolume]);

  const calculatePH = (baseVolume) => {
    const Va = acidVolume / 1000; // Convert mL to L
    const Vb = baseVolume / 1000; // Convert mL to L
    const na = acidConc * Va; // Moles of acid
    const nb = baseConc * Vb; // Moles of base
    const totalVolume = Va + Vb;

    const isAcidStrong = acidData[acid].strong;
    const isBaseStrong = baseData[base].strong;
    const pKa = acidData[acid].pKa;
    const pKb = baseData[base].pKb;
    const Kw = 1e-14; // Water dissociation constant

    if (isAcidStrong && isBaseStrong) {
      // Strong acid vs strong base
      if (na > nb) {
        // Excess acid
        const excessH = (na - nb) / totalVolume;
        return -Math.log10(excessH);
      } else if (nb > na) {
        // Excess base
        const excessOH = (nb - na) / totalVolume;
        return 14 + Math.log10(excessOH);
      } else {
        // Neutralization point
        return 7;
      }
    } else if (isAcidStrong && !isBaseStrong) {
      // Strong acid vs weak base
      if (na > nb) {
        const excessH = (na - nb) / totalVolume;
        return -Math.log10(excessH);
      } else if (nb === na) {
        const kb = Math.pow(10, -pKb);
        const concB = (nb / totalVolume);
        const oh = Math.sqrt(kb * concB);
        return 14 + Math.log10(oh);
      } else {
        const excessOH = (nb - na) / totalVolume;
        return 14 + Math.log10(excessOH);
      }
    } else if (!isAcidStrong && isBaseStrong) {
      // Weak acid vs strong base
      if (nb === 0) {
        return -Math.log10(acidConc * Math.pow(10, -pKa));
      } else if (nb < na) {
        // Buffer region
        const molesA = na - nb;
        const molesHA = nb;
        return pKa + Math.log10(molesA / molesHA);
      } else if (nb === na) {
        // Equivalence point
        const ka = Math.pow(10, -pKa);
        const concA = (na / totalVolume);
        const h = Math.sqrt(ka * concA);
        return -Math.log10(h);
      } else {
        const excessOH = (nb - na) / totalVolume;
        return 14 + Math.log10(excessOH);
      }
    } else {
      // Weak acid vs weak base (simplified)
      return 7; // Approximation at equivalence
    }
  };

  const drawTitrationCurve = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Axes
    ctx.beginPath();
    ctx.moveTo(50, height - 50);
    ctx.lineTo(width - 50, height - 50); // X-axis (base volume)
    ctx.moveTo(50, height - 50);
    ctx.lineTo(50, 50); // Y-axis (pH)
    ctx.strokeStyle = 'black';
    ctx.stroke();

    // Labels
    ctx.font = '12px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Base Volume (mL)', width / 2 - 30, height - 20);
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('pH', 0, 0);
    ctx.restore();

    // Scale
    const maxVolume = acidVolume * 2; // Up to twice acid volume
    const xScale = (width - 100) / maxVolume;
    const yScale = (height - 100) / 14; // pH 0-14

    // Plot curve
    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    let first = true;
    for (let v = 0; v <= maxVolume; v += 0.1) {
      const pH = calculatePH(v);
      const x = 50 + v * xScale;
      const y = height - 50 - pH * yScale;
      if (first) {
        ctx.moveTo(x, y);
        first = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Equivalence point
    const equivVolume = (acidConc * acidVolume) / baseConc;
    const equivPH = calculatePH(equivVolume);
    const equivX = 50 + equivVolume * xScale;
    const equivY = height - 50 - equivPH * yScale;
    ctx.beginPath();
    ctx.arc(equivX, equivY, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
  };

  const formatNumber = (num, digits = 2) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Titration Simulator
        </h1>

        <div className="space-y-6">
          {/* Canvas */}
          <div>
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full border border-gray-300 rounded-md"
            />
            <p className="text-sm text-gray-600 mt-2">
              Blue: Titration Curve | Red: Equivalence Point
            </p>
          </div>

          {/* Controls */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acid
              </label>
              <select
                value={acid}
                onChange={(e) => setAcid(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="HCl">HCl (Strong)</option>
                <option value="CH3COOH">CH3COOH (Weak)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base
              </label>
              <select
                value={base}
                onChange={(e) => setBase(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="NaOH">NaOH (Strong)</option>
                <option value="NH3">NH3 (Weak)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acid Concentration (M)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={acidConc}
                onChange={(e) => setAcidConc(Math.max(0.01, parseFloat(e.target.value) || 0.1))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Concentration (M)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={baseConc}
                onChange={(e) => setBaseConc(Math.max(0.01, parseFloat(e.target.value) || 0.1))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acid Volume (mL)
              </label>
              <input
                type="number"
                min="1"
                value={acidVolume}
                onChange={(e) => setAcidVolume(Math.max(1, parseFloat(e.target.value) || 50))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Results */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Titration Properties:</h2>
            <p>Acid: {acid} ({formatNumber(acidConc)} M, {formatNumber(acidVolume)} mL)</p>
            <p>Base: {base} ({formatNumber(baseConc)} M)</p>
            <p>Equivalence Volume: {formatNumber((acidConc * acidVolume) / baseConc)} mL</p>
            <p>Equivalence pH: {formatNumber(calculatePH((acidConc * acidVolume) / baseConc))}</p>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Simulates acid-base titration:</p>
                <ul className="list-disc list-inside">
                  <li>Strong acid/base: Direct pH calculation</li>
                  <li>Weak acid/base: Uses pKa/pKb and buffer equations</li>
                  <li>Plots pH vs. base volume</li>
                  <li>Marks equivalence point</li>
                </ul>
                <p>Note: Simplified model; assumes ideal conditions.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitratorSimulator;