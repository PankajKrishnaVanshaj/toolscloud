"use client";
import { useState, useRef, useEffect } from "react";
import JsBarcode from "jsbarcode";

const BarcodeGenerator = () => {
  const [barcode, setBarcode] = useState("123456789012");
  const [format, setFormat] = useState("CODE128");
  const [fontSize, setFontSize] = useState(14);
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const canvasRef = useRef(null);

  const barcodeFormats = [
    "CODE128",
    "CODE128A",
    "CODE128B",
    "CODE128C",
    "EAN13",
    "UPC",
    "EAN8",
    "ITF14",
    "ITF",
    "MSI",
    "pharmacode",
    "codabar",
    "CODE39",
    "CODE93",
  ];

  useEffect(() => {
    generateBarcode();
  }, [barcode, format, fontSize, foregroundColor, backgroundColor]);

  const validateInput = () => {
    switch (format) {
      case "EAN13":
        if (!/^\d{13}$/.test(barcode)) return `EAN-13 must be 13 digits.`;
        break;
      case "UPC":
        if (!/^\d{12}$/.test(barcode)) return `UPC must be 12 digits.`;
        break;
      case "ITF14":
        if (!/^\d{14}$/.test(barcode)) return `ITF-14 must be 14 digits.`;
        break;
      default:
        break;
    }
    return "";
  };

  const generateBarcode = () => {
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");

    try {
      const canvas = canvasRef.current;
      JsBarcode(canvas, barcode, {
        format,
        displayValue: true,
        fontSize,
        height: 100,
        width: 2,
        margin: 10,
        lineColor: foregroundColor,
        background: backgroundColor,
      });

      setHistory((prev) => {
        const newHistory = [{ barcode, format }, ...prev];
        localStorage.setItem("barcodeHistory", JSON.stringify(newHistory));
        return newHistory;
      });
    } catch {
      setError("An error occurred while generating the barcode.");
    }
  };

  const downloadBarcode = (format = "png") => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `${barcode}.${format}`;
    link.href =
      format === "png" ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg");
    link.click();
  };

  const copyBarcode = () => {
    navigator.clipboard.writeText(barcode).then(() => alert("Barcode copied to clipboard!"));
  };

  const resetBarcode = () => {
    setBarcode("123456789012");
    setFormat("CODE128");
    setForegroundColor("#000000");
    setBackgroundColor("#ffffff");
    setFontSize(14);
    setError("");
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem("barcodeHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  return (
    <div className="mx-auto p-4 bg-white shadow-lg rounded-2xl">

      <input
        type="text"
        className="border border-gray-300 p-3 w-full rounded-lg mb-4 focus:ring-2 focus:ring-blue-400"
        placeholder="Enter barcode value"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        aria-label="Barcode Value"
      />

      {error && <p className="text-red-600 mb-2 font-medium">{error}</p>}

      <label className="block mb-2 font-medium text-gray-700">Select Barcode Format:</label>
      <select
        value={format}
        onChange={(e) => setFormat(e.target.value)}
        className="border border-gray-300 p-3 w-full rounded-lg mb-4 focus:ring-2 focus:ring-blue-400"
        aria-label="Barcode Format"
      >
        {barcodeFormats.map((formatOption) => (
          <option key={formatOption} value={formatOption}>
            {formatOption}
          </option>
        ))}
      </select>

      <label className="block mb-2 font-medium text-gray-700">Font Size:</label>
      <input
        type="number"
        min="10"
        max="20"
        value={fontSize}
        onChange={(e) => setFontSize(Number(e.target.value))}
        className="border border-gray-300 p-3 w-full rounded-lg mb-4 focus:ring-2 focus:ring-blue-400"
      />

      <label className="block mb-2 font-medium text-gray-700">Foreground Color:</label>
      <input
        type="color"
        className="w-full mb-4"
        value={foregroundColor}
        onChange={(e) => setForegroundColor(e.target.value)}
      />

      <label className="block mb-2 font-medium text-gray-700">Background Color:</label>
      <input
        type="color"
        className="w-full mb-4"
        value={backgroundColor}
        onChange={(e) => setBackgroundColor(e.target.value)}
      />

      <button
        onClick={generateBarcode}
        className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg mb-4 hover:bg-blue-700"
      >
        Generate Barcode
      </button>

      <canvas ref={canvasRef} className="mt-4 border rounded-lg shadow-md"></canvas>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => downloadBarcode("png")}
          className="w-1/2 px-4 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600"
        >
          Download PNG
        </button>
        <button
          onClick={() => downloadBarcode("jpg")}
          className="w-1/2 px-4 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600"
        >
          Download JPG
        </button>
      </div>

      <button
        onClick={copyBarcode}
        className="w-full px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg mt-4 hover:bg-purple-700"
      >
        Copy Barcode Value
      </button>

      <button
        onClick={resetBarcode}
        className="w-full px-4 py-3 bg-gray-500 text-white font-semibold rounded-lg mt-4 hover:bg-gray-600"
      >
        Reset
      </button>

      <h3 className="text-xl font-bold mt-6 mb-2 text-gray-800">Barcode History</h3>
      <ul className="list-disc pl-6 text-gray-700">
        {history.map((item, index) => (
          <li key={index} className="mb-2">
            <span className="font-semibold">{item.barcode}</span> - {item.format}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BarcodeGenerator;
