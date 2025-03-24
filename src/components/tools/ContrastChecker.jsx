"use client";
import { useState, useCallback } from "react";
import { FaCopy, FaRandom, FaSync, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; 

const ContrastChecker = () => {
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [previewText, setPreviewText] = useState("Sample Text");
  const [fontSize, setFontSize] = useState(16);
  const [wcagLevel, setWcagLevel] = useState("AA");
  const previewRef = React.useRef(null);

  // Calculate luminance
  const luminance = (color) => {
    const rgb = color.match(/\w\w/g).map((c) => parseInt(c, 16) / 255);
    return rgb
      .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)))
      .reduce((acc, val, idx) => acc + val * [0.2126, 0.7152, 0.0722][idx], 0);
  };

  // Calculate contrast ratio
  const contrastRatio = useCallback(() => {
    const ratio =
      (Math.max(luminance(textColor), luminance(bgColor)) + 0.05) /
      (Math.min(luminance(textColor), luminance(bgColor)) + 0.05);
    return ratio.toFixed(2);
  }, [textColor, bgColor]);

  // Check accessibility based on WCAG level
  const isAccessible = useCallback(() => {
    const ratio = parseFloat(contrastRatio());
    const isLargeText = fontSize >= 18;
    if (wcagLevel === "AAA") {
      return isLargeText ? ratio >= 7 : ratio >= 4.5;
    }
    return isLargeText ? ratio >= 4.5 : ratio >= 3;
  }, [contrastRatio, fontSize, wcagLevel]);

  // Generate random color
  const generateRandomColor = () =>
    `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;

  // Generate accessible color pair
  const generateAccessibleColors = () => {
    let newTextColor, newBgColor;
    do {
      newTextColor = generateRandomColor();
      newBgColor = generateRandomColor();
      const lumText = luminance(newTextColor);
      const lumBg = luminance(newBgColor);
      const ratio = (Math.max(lumText, lumBg) + 0.05) / (Math.min(lumText, lumBg) + 0.05);
      if (wcagLevel === "AAA") {
        if ((fontSize >= 18 && ratio >= 7) || ratio >= 4.5) {
          break;
        }
      } else if ((fontSize >= 18 && ratio >= 4.5) || ratio >= 3) {
        break;
      }
    } while (true);
    setTextColor(newTextColor);
    setBgColor(newBgColor);
  };

  // Copy to clipboard
  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color);
    alert(`${color} copied to clipboard!`);
  };

  // Reset to defaults
  const reset = () => {
    setTextColor("#000000");
    setBgColor("#ffffff");
    setPreviewText("Sample Text");
    setFontSize(16);
    setWcagLevel("AA");
  };

  // Download preview
  const downloadPreview = () => {
    if (previewRef.current) {
      html2canvas(previewRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `contrast-preview-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Contrast Checker
        </h2>

        {/* Color Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {[
            { label: "Text Color", color: textColor, setColor: setTextColor },
            { label: "Background Color", color: bgColor, setColor: setBgColor },
          ].map(({ label, color, setColor }) => (
            <div key={label} className="flex flex-col items-center">
              <label className="text-sm font-medium text-gray-700 mb-2">{label}</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-20 rounded-md cursor-pointer border-2 border-gray-200"
              />
              <div className="flex items-center mt-3 gap-2">
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="border p-2 rounded-md w-24 text-center text-sm focus:ring-2 focus:ring-blue-500"
                  maxLength={7}
                />
                <button
                  onClick={() => copyToClipboard(color)}
                  className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  title="Copy to clipboard"
                >
                  <FaCopy />
                </button>
                <button
                  onClick={() => setColor(generateRandomColor())}
                  className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  title="Random color"
                >
                  <FaRandom />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Size ({fontSize}px)
            </label>
            <input
              type="range"
              min="12"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WCAG Level
            </label>
            <select
              value={wcagLevel}
              onChange={(e) => setWcagLevel(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="AA">AA (Minimum)</option>
              <option value="AAA">AAA (Enhanced)</option>
            </select>
          </div>
        </div>

        {/* Preview Area */}
        <div ref={previewRef} className="mb-6">
          <textarea
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            className="w-full h-24 border rounded-lg p-4 text-center resize-none shadow-inner"
            style={{
              backgroundColor: bgColor,
              color: textColor,
              fontSize: `${fontSize}px`,
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={generateAccessibleColors}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaRandom className="mr-2" /> Generate Accessible Colors
          </button>
          <button
            onClick={downloadPreview}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download Preview
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Contrast Info */}
        <div className="text-center">
          <p className="text-lg font-medium text-gray-800">
            Contrast Ratio: <strong>{contrastRatio()}:1</strong>
          </p>
          <p
            className={`mt-2 text-lg font-medium ${
              isAccessible() ? "text-green-600" : "text-red-600"
            }`}
          >
            {isAccessible() ? "✔ Accessible" : "❌ Not Accessible"} (WCAG {wcagLevel})
          </p>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Real-time contrast ratio calculation</li>
            <li>WCAG AA and AAA compliance checking</li>
            <li>Adjustable font size for large text criteria</li>
            <li>Random and accessible color generation</li>
            <li>Copy colors to clipboard</li>
            <li>Download preview as PNG</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContrastChecker;