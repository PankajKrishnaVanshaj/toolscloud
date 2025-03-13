"use client";
import React, { useState, useRef, useCallback } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";
import PptxGenJS from "pptxgenjs"; // Requires: npm install pptxgenjs

const PDFToPowerPoint = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionSettings, setConversionSettings] = useState({
    slidePerPage: true,
    includeNotes: false,
    template: "default",
    transition: "none",
    customRange: "",
    pageRange: "all",
    slideSize: "STANDARD_4_3",
    backgroundColor: "#FFFFFF",
  });
  const fileInputRef = useRef(null);

  // Handle file upload
  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setPreviewPage(1);
      setNumPages(null);
    }
  }, []);

  // Handle PDF load success
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Handle settings changes
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConversionSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Parse custom page range
  const parsePageRange = () => {
    if (conversionSettings.pageRange === "all") return Array.from({ length: numPages }, (_, i) => i + 1);
    const ranges = conversionSettings.customRange.split(",").map((r) => r.trim());
    const pages = new Set();
    ranges.forEach((range) => {
      if (range.includes("-")) {
        const [start, end] = range.split("-").map(Number);
        for (let i = Math.max(1, start); i <= Math.min(numPages, end); i++) pages.add(i);
      } else {
        const page = Number(range);
        if (page >= 1 && page <= numPages) pages.add(page);
      }
    });
    return Array.from(pages).sort((a, b) => a - b);
  };

  // Convert PDF to PowerPoint
  const convertToPowerPoint = async () => {
    if (!file || !numPages) return;

    setIsConverting(true);
    try {
      const pptx = new PptxGenJS();
      pptx.layout = conversionSettings.slideSize;

      const pagesToConvert = parsePageRange();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      for (const pageNum of pagesToConvert) {
        const slide = pptx.addSlide();
        slide.background = { color: conversionSettings.backgroundColor };

        // Render PDF page to canvas
        const pdfPage = await new Promise((resolve) => {
          const pdfDoc = document.querySelector(".react-pdf__Document");
          pdfDoc.firstChild.children[pageNum - 1].querySelector("canvas").toBlob(resolve);
        });

        const img = new Image();
        img.src = URL.createObjectURL(pdfPage);
        await new Promise((resolve) => (img.onload = resolve));

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imgData = canvas.toDataURL("image/png");
        slide.addImage({ data: imgData, x: 0, y: 0, w: "100%", h: "100%" });

        if (conversionSettings.includeNotes) {
          slide.addNotes(`Notes for Slide ${pageNum}`);
        }
        if (conversionSettings.transition !== "none") {
          slide.transition = { type: conversionSettings.transition };
        }
      }

      await pptx.writeFile({ fileName: `converted_${file.name.replace(".pdf", ".pptx")}` });
    } catch (error) {
      console.error("Conversion failed:", error);
      alert("Conversion failed. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  // Reset form
  const reset = () => {
    setFile(null);
    setNumPages(null);
    setPreviewPage(1);
    setConversionSettings({
      slidePerPage: true,
      includeNotes: false,
      template: "default",
      transition: "none",
      customRange: "",
      pageRange: "all",
      slideSize: "STANDARD_4_3",
      backgroundColor: "#FFFFFF",
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF to PowerPoint Converter</h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload PDF File</label>
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Conversion Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slide Layout</label>
            <select
              name="slidePerPage"
              value={conversionSettings.slidePerPage}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value={true}>One Slide per Page</option>
              <option value={false}>Fit Content</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slide Template</label>
            <select
              name="template"
              value={conversionSettings.template}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="default">Default</option>
              <option value="modern">Modern</option>
              <option value="professional">Professional</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transition Effect</label>
            <select
              name="transition"
              value={conversionSettings.transition}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">None</option>
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
              <option value="push">Push</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slide Size</label>
            <select
              name="slideSize"
              value={conversionSettings.slideSize}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="STANDARD_4_3">Standard 4:3</option>
              <option value="WIDESCREEN_16_9">Widescreen 16:9</option>
              <option value="WIDESCREEN_16_10">Widescreen 16:10</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
            <input
              type="color"
              name="backgroundColor"
              value={conversionSettings.backgroundColor}
              onChange={handleSettingsChange}
              className="w-full h-10 border rounded-md cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Range</label>
            <select
              name="pageRange"
              value={conversionSettings.pageRange}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Pages</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          {conversionSettings.pageRange === "custom" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Range (e.g., 1-5, 7)
              </label>
              <input
                type="text"
                name="customRange"
                value={conversionSettings.customRange}
                onChange={handleSettingsChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1-5, 7"
              />
            </div>
          )}
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includeNotes"
                checked={conversionSettings.includeNotes}
                onChange={handleSettingsChange}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Include Speaker Notes</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        {file && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">Slide Preview</h2>
            <div className="border p-4 bg-gray-50 rounded-lg">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex justify-center"
              >
                <Page pageNumber={previewPage} width={Math.min(400, window.innerWidth - 40)} />
              </Document>
              {numPages && (
                <div className="mt-4 flex justify-center items-center gap-4">
                  <button
                    onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                    disabled={previewPage === 1 || isConverting}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Slide {previewPage} of {numPages}
                  </span>
                  <button
                    onClick={() => setPreviewPage(Math.min(numPages, previewPage + 1))}
                    disabled={previewPage === numPages || isConverting}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={convertToPowerPoint}
            disabled={!file || isConverting}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isConverting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
              <FaDownload className="mr-2" />
            )}
            {isConverting ? "Converting..." : "Convert and Download"}
          </button>
          <button
            onClick={reset}
            disabled={isConverting}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" />
            Reset
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert PDF pages to PowerPoint slides</li>
            <li>Customizable slide size, template, and transitions</li>
            <li>Adjustable page range with custom selection</li>
            <li>Background color picker</li>
            <li>Include speaker notes option</li>
            <li>Responsive preview with navigation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFToPowerPoint;