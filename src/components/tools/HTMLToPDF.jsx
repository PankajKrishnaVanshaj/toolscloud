"use client";
import React, { useState, useRef, useCallback } from "react";
import { jsPDF } from "jspdf";
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import { FaDownload, FaSync } from "react-icons/fa";

const HTMLToPDF = () => {
  const [htmlContent, setHtmlContent] = useState("<h1>Hello World</h1>\n<p>This is a test paragraph.</p>");
  const [pdfSettings, setPdfSettings] = useState({
    format: "a4",
    orientation: "portrait",
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    marginBottom: 10,
    fontSize: 12,
    quality: 100,
    header: "",
    footer: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef(null);

  const scope = { React }; // For LivePreview

  const handleSettingsChange = useCallback((e) => {
    const { name, value } = e.target;
    setPdfSettings((prev) => ({
      ...prev,
      [name]: name.includes("margin") || name === "fontSize" || name === "quality" ? parseInt(value) : value,
    }));
  }, []);

  const resetSettings = () => {
    setHtmlContent("<h1>Hello World</h1>\n<p>This is a test paragraph.</p>");
    setPdfSettings({
      format: "a4",
      orientation: "portrait",
      marginLeft: 10,
      marginRight: 10,
      marginTop: 10,
      marginBottom: 10,
      fontSize: 12,
      quality: 100,
      header: "",
      footer: "",
    });
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: pdfSettings.orientation,
        unit: "mm",
        format: pdfSettings.format,
        putOnlyUsedFonts: true,
        floatPrecision: 16,
      });

      // Add header
      if (pdfSettings.header) {
        doc.setFontSize(10);
        doc.text(pdfSettings.header, pdfSettings.marginLeft, 5);
      }

      // Add footer
      if (pdfSettings.footer) {
        doc.setFontSize(10);
        const pageHeight = doc.internal.pageSize.height;
        doc.text(pdfSettings.footer, pdfSettings.marginLeft, pageHeight - 5);
      }

      // Main content
      doc.setFontSize(pdfSettings.fontSize);
      await doc.html(previewRef.current, {
        callback: (pdf) => {
          pdf.save(`converted-document-${Date.now()}.pdf`);
        },
        margin: [
          pdfSettings.marginTop,
          pdfSettings.marginRight,
          pdfSettings.marginBottom,
          pdfSettings.marginLeft,
        ],
        html2canvas: {
          scale: pdfSettings.quality / 100,
          useCORS: true,
          logging: false,
        },
        jsPDF: {
          unit: "mm",
          format: pdfSettings.format,
          orientation: pdfSettings.orientation,
        },
      });
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">HTML to PDF Converter</h1>

        {/* Editor and Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">HTML Editor</h2>
            <LiveProvider code={htmlContent} scope={scope}>
              <div className="border rounded-lg overflow-hidden shadow-sm">
                <LiveEditor
                  onChange={(code) => setHtmlContent(code)}
                  className="h-[50vh] font-mono text-sm bg-gray-50"
                  style={{ minHeight: "300px" }}
                />
              </div>
              <LiveError className="text-red-600 text-sm mt-2" />
            </LiveProvider>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Preview</h2>
            <div className="border p-4 bg-white rounded-lg shadow-sm h-[50vh] overflow-auto">
              <div ref={previewRef}>
                <LivePreview />
              </div>
            </div>
          </div>
        </div>

        {/* PDF Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paper Format</label>
            <select
              name="format"
              value={pdfSettings.format}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="a4">A4</option>
              <option value="letter">Letter</option>
              <option value="legal">Legal</option>
              <option value="a3">A3</option>
              <option value="a5">A5</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orientation</label>
            <select
              name="orientation"
              value={pdfSettings.orientation}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Font Size (pt)</label>
            <input
              type="number"
              name="fontSize"
              value={pdfSettings.fontSize}
              onChange={handleSettingsChange}
              min="8"
              max="72"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quality (%)</label>
            <input
              type="range"
              name="quality"
              value={pdfSettings.quality}
              onChange={handleSettingsChange}
              min="10"
              max="100"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-sm text-gray-600">{pdfSettings.quality}%</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Margin Left (mm)</label>
            <input
              type="number"
              name="marginLeft"
              value={pdfSettings.marginLeft}
              onChange={handleSettingsChange}
              min="0"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Margin Right (mm)</label>
            <input
              type="number"
              name="marginRight"
              value={pdfSettings.marginRight}
              onChange={handleSettingsChange}
              min="0"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Margin Top (mm)</label>
            <input
              type="number"
              name="marginTop"
              value={pdfSettings.marginTop}
              onChange={handleSettingsChange}
              min="0"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Margin Bottom (mm)</label>
            <input
              type="number"
              name="marginBottom"
              value={pdfSettings.marginBottom}
              onChange={handleSettingsChange}
              min="0"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Header and Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Header Text</label>
            <input
              type="text"
              name="header"
              value={pdfSettings.header}
              onChange={handleSettingsChange}
              placeholder="e.g., Page Header"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text</label>
            <input
              type="text"
              name="footer"
              value={pdfSettings.footer}
              onChange={handleSettingsChange}
              placeholder="e.g., Page Footer"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" />
            {isGenerating ? "Generating..." : "Generate PDF"}
          </button>
          <button
            onClick={resetSettings}
            disabled={isGenerating}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Live HTML editing with real-time preview</li>
            <li>Customizable paper format, orientation, and margins</li>
            <li>Adjustable font size and quality</li>
            <li>Add header and footer text</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Error display for invalid HTML</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HTMLToPDF;