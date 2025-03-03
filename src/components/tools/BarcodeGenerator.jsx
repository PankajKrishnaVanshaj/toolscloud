'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

const BarcodeGenerator = () => {
  const [inputValue, setInputValue] = useState('123456789012');
  const [format, setFormat] = useState('UPC');
  const [fontSize, setFontSize] = useState(14);
  const [lineWidth, setLineWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [displayValue, setDisplayValue] = useState(true);
  const [error, setError] = useState('');
  const [downloadFormat, setDownloadFormat] = useState('png');
  const [history, setHistory] = useState([]);
  const [bulkInputs, setBulkInputs] = useState(['']);
  const [showBulk, setShowBulk] = useState(false);
  const [margin, setMargin] = useState(10);

  const canvasRef = useRef(null);
  const previewRef = useRef(null);

  const barcodeFormats = [
    'CODE128', 'CODE128A', 'CODE128B', 'CODE128C',
    'EAN13', 'UPC', 'EAN8', 'EAN5', 'EAN2',
    'ITF14', 'ITF', 'MSI', 'MSI10', 'MSI11', 'MSI1010', 'MSI1110',
    'pharmacode', 'codabar', 'CODE39', 'CODE93',
    'QR', // 2D barcode
  ];

  useEffect(() => {
    generateBarcode();
    const savedHistory = localStorage.getItem('barcodeHistory');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const validateInput = useCallback(() => {
    const value = showBulk ? bulkInputs.join('') : inputValue;
    switch (format) {
      case 'EAN13':
        if (!/^\d{13}$/.test(value)) return 'EAN-13 must be 13 digits.';
        break;
      case 'UPC':
        if (!/^\d{12}$/.test(value)) return 'UPC must be 12 digits.';
        break;
      case 'ITF14':
        if (!/^\d{14}$/.test(value)) return 'ITF-14 must be 14 digits.';
        break;
      case 'EAN8':
        if (!/^\d{8}$/.test(value)) return 'EAN-8 must be 8 digits.';
        break;
      case 'EAN5':
        if (!/^\d{5}$/.test(value)) return 'EAN-5 must be 5 digits.';
        break;
      case 'EAN2':
        if (!/^\d{2}$/.test(value)) return 'EAN-2 must be 2 digits.';
        break;
      default:
        if (!value) return 'Input value is required.';
        break;
    }
    return '';
  }, [format, inputValue, bulkInputs, showBulk]);

  const generateBarcode = useCallback(() => {
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');

    const canvas = canvasRef.current;
    const value = showBulk ? bulkInputs.join('') : inputValue;

    try {
      if (format === 'QR') {
        QRCode.toCanvas(canvas, value, {
          width: height,
          margin,
          color: {
            dark: foregroundColor,
            light: backgroundColor,
          },
          errorCorrectionLevel: 'H',
        });
      } else {
        JsBarcode(canvas, value, {
          format,
          displayValue,
          fontSize,
          height,
          width: lineWidth,
          margin,
          lineColor: foregroundColor,
          background: backgroundColor,
        });
      }

      setHistory(prev => {
        const newHistory = [{ value, format, timestamp: new Date().toISOString() }, ...prev.slice(0, 9)];
        localStorage.setItem('barcodeHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    } catch (err) {
      setError(`Error generating barcode: ${err.message}`);
    }
  }, [format, inputValue, bulkInputs, fontSize, lineWidth, height, foregroundColor, backgroundColor, displayValue, margin, showBulk]);

  const downloadBarcode = (formatType) => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    const filename = `${showBulk ? 'bulk_' : ''}${inputValue || 'barcode'}.${formatType}`;
    
    if (formatType === 'svg') {
      const svgData = canvas.toDataURL('image/svg+xml');
      link.href = svgData;
    } else {
      link.href = formatType === 'png' ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg');
    }
    
    link.download = filename;
    link.click();
  };

  const downloadBulkImages = async () => {
    for (let i = 0; i < bulkInputs.length; i++) {
      setInputValue(bulkInputs[i]);
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for render
      generateBarcode();
      const link = document.createElement('a');
      link.download = `${bulkInputs[i]}.${downloadFormat}`;
      link.href = canvasRef.current.toDataURL(`image/${downloadFormat}`);
      link.click();
    }
    setInputValue(bulkInputs.join(''));
  };

  const handleBulkInputChange = (index, value) => {
    const newInputs = [...bulkInputs];
    newInputs[index] = value;
    setBulkInputs(newInputs);
  };

  const addBulkInput = () => setBulkInputs([...bulkInputs, '']);
  const removeBulkInput = (index) => {
    if (bulkInputs.length > 1) {
      setBulkInputs(bulkInputs.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full ">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800">
          Advanced Barcode Generator
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Controls Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBulk(!showBulk)}
                className={`px-4 py-2 rounded-md ${showBulk ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'} hover:bg-opacity-80 transition-colors`}
              >
                {showBulk ? 'Single Mode' : 'Bulk Mode'}
              </button>
            </div>

            {showBulk ? (
              <div className="space-y-2">
                {bulkInputs.map((input, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => handleBulkInputChange(index, e.target.value)}
                      placeholder={`Barcode ${index + 1}`}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {bulkInputs.length > 1 && (
                      <button
                        onClick={() => removeBulkInput(index)}
                        className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        X
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addBulkInput}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Add Barcode
                </button>
              </div>
            ) : (
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter barcode value"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            {error && <p className="text-red-600 font-medium">{error}</p>}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {barcodeFormats.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                <input
                  type="number"
                  min="10"
                  max="50"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Line Width</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={lineWidth}
                  onChange={(e) => setLineWidth(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                <input
                  type="number"
                  min="50"
                  max="300"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foreground</label>
                <input
                  type="color"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Margin</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Download Format</label>
                <select
                  value={downloadFormat}
                  onChange={(e) => setDownloadFormat(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                  <option value="svg">SVG</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={displayValue}
                onChange={(e) => setDisplayValue(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">Display Value</label>
            </div>

            <button
              onClick={generateBarcode}
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Generate Barcode
            </button>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <div ref={previewRef} className="border rounded-lg shadow-md p-4 bg-white">
              <canvas ref={canvasRef} className="w-full" />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => downloadBarcode(downloadFormat)}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Download Single
              </button>
              {showBulk && (
                <button
                  onClick={downloadBulkImages}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Download Bulk
                </button>
              )}
            </div>
          </div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Barcode History (Last 10)</h3>
            <div className="max-h-40 overflow-auto border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm">
              {history.map((item, index) => (
                <div key={index} className="flex justify-between items-center mb-2 text-sm text-gray-700">
                  <span>
                    <strong>{item.value}</strong> - {item.format} ({new Date(item.timestamp).toLocaleString()})
                  </span>
                  <button
                    onClick={() => {
                      setInputValue(item.value);
                      setFormat(item.format);
                      generateBarcode();
                    }}
                    className="px-2 py-1 bg-blue-200 text-blue-800 rounded hover:bg-blue-300"
                  >
                    Regenerate
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600 text-center">
          <p>Supports all major 1D barcode formats and QR codes</p>
          <p>Features bulk generation, custom styling, and history with regeneration</p>
        </div>
      </div>
    </div>
  );
};

export default BarcodeGenerator;