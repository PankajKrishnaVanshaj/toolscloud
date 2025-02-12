"use client";
import { useState, useRef, useEffect } from "react";
import JsBarcode from "jsbarcode";

const BarcodeGenerator = () => {
  const [barcode, setBarcode] = useState("123456789012");
  const [format, setFormat] = useState("UPC");
  const [fontSize, setFontSize] = useState(14);
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [error, setError] = useState("");
  const [downloadFormat, setDownloadFormat] = useState("png");
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

  const downloadBarcode = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `${barcode}.${downloadFormat}`;
    link.href =
      downloadFormat === "png"
        ? canvas.toDataURL("image/png")
        : canvas.toDataURL("image/jpeg");
    link.click();
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem("barcodeHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  return (
    <div className="mx-auto p-4 bg-white shadow-lg rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <input
            type="text"
            className="border border-gray-300 p-3 w-full rounded-lg mb-4"
            placeholder="Enter barcode value"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            aria-label="Barcode Value"
          />
          {error && <p className="text-red-600 mb-4 font-medium">{error}</p>}

          <div className="flex items-center mb-4">
            <label className="font-medium text-secondary w-1/3">
              Barcode Format:
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="border border-gray-300 p-3 w-2/3 rounded-lg"
              aria-label="Barcode Format"
            >
              {barcodeFormats.map((formatOption) => (
                <option key={formatOption} value={formatOption}>
                  {formatOption}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center mb-4">
            <label className="font-medium text-secondary w-1/3">
              Font Size:
            </label>
            <input
              type="number"
              min="10"
              max="20"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="border border-gray-300 p-3 w-2/3 rounded-lg"
            />
          </div>

          <div className="flex items-center mb-4">
            <label className="font-medium text-secondary w-1/3">
              Foreground Color:
            </label>
            <input
              type="color"
              className="w-2/3 p-1 border border-gray-300 rounded-lg"
              value={foregroundColor}
              onChange={(e) => setForegroundColor(e.target.value)}
            />
          </div>

          <div className="flex items-center mb-4">
            <label className="font-medium text-secondary w-1/3">
              Background Color:
            </label>
            <input
              type="color"
              className="w-2/3 p-1 border border-gray-300 rounded-lg"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
          </div>

          <div className="flex items-center mb-4">
            <label className="font-medium text-secondary w-1/3">
              Download Format:
            </label>
            <select
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value)}
              className="border border-gray-300 p-3 w-2/3 rounded-lg"
            >
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
            </select>
          </div>

          <button
            onClick={generateBarcode}
            className="w-full px-4 py-3 border text-primary font-semibold rounded-lg hover:border-secondary"
          >
            Generate Barcode
          </button>
        </div>

        <div>
          <canvas
            ref={canvasRef}
            className="border rounded-lg shadow-md w-full"
          ></canvas>

          <button
            onClick={downloadBarcode}
            className="w-full px-4 py-3 mt-4 border text-secondary font-semibold rounded-lg hover:border-primary"
          >
            Download Barcode
          </button>
        </div>
      </div>

      {/* Barcode History */}
      <h3 className="text-xl font-bold mt-8 mb-4 text-secondary">
        Barcode History
      </h3>
      <ul className="list-disc pl-6 text-secondary max-h-40 overflow-auto border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50">
        {history.map((item, index) => (
          <li key={index} className="mb-2">
            <span className="font-semibold">{item.barcode}</span> -{" "}
            {item.format}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BarcodeGenerator;
