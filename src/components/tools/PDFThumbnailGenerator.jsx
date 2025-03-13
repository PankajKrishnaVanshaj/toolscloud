// app/components/PDFThumbnailGenerator.jsx
"use client";
import React, { useState, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { FaDownload, FaSync, FaTrash, FaCog } from "react-icons/fa";

// Set pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFThumbnailGenerator = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [settings, setSettings] = useState({
    thumbnailWidth: 200,
    format: "png",
    pages: "all",
    customPages: "",
    quality: 100,
    backgroundColor: "#ffffff",
    shadow: true,
  });
  const canvasRefs = useRef([]);
  const fileInputRef = useRef(null);

  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile?.type === "application/pdf") {
      setFile(selectedFile);
      setThumbnails([]);
      setNumPages(null);
      setIsGenerating(false);
    }
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    canvasRefs.current = Array(numPages)
      .fill(null)
      .map(() => React.createRef());
  }, []);

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const parsePageRange = (rangeStr, maxPages) => {
    if (!rangeStr) return [];
    const pages = new Set();
    rangeStr.split(",").forEach((part) => {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(Number);
        for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
          pages.add(i);
        }
      } else {
        const num = Number(part);
        if (num >= 1 && num <= maxPages) pages.add(num);
      }
    });
    return Array.from(pages).sort((a, b) => a - b);
  };

  const generateThumbnails = useCallback(async () => {
    if (!file || !numPages) return;

    setIsGenerating(true);
    const pdfUrl = URL.createObjectURL(file);
    const pdf = await pdfjs.getDocument(pdfUrl).promise;
    const newThumbnails = [];

    const pagesToRender =
      settings.pages === "all"
        ? Array.from({ length: numPages }, (_, i) => i + 1)
        : parsePageRange(settings.customPages, numPages);

    try {
      for (const pageNum of pagesToRender) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1 });
        const scale = settings.thumbnailWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        const canvas = canvasRefs.current[pageNum - 1].current;
        const context = canvas.getContext("2d");

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        // Apply background color
        context.fillStyle = settings.backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: context,
          viewport: scaledViewport,
        }).promise;

        newThumbnails.push({
          page: pageNum,
          dataUrl: canvas.toDataURL(
            `image/${settings.format}`,
            settings.quality / 100
          ),
        });
      }
      setThumbnails(newThumbnails);
    } catch (error) {
      console.error("Thumbnail generation failed:", error);
    } finally {
      setIsGenerating(false);
      URL.revokeObjectURL(pdfUrl);
    }
  }, [file, numPages, settings]);

  const downloadThumbnails = () => {
    thumbnails.forEach((thumb) => {
      const link = document.createElement("a");
      link.href = thumb.dataUrl;
      link.download = `thumbnail_page_${thumb.page}.${settings.format}`;
      link.click();
      link.remove();
    });
  };

  const downloadZip = async () => {
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();

    thumbnails.forEach((thumb) => {
      const base64Data = thumb.dataUrl.split(",")[1];
      zip.file(
        `thumbnail_page_${thumb.page}.${settings.format}`,
        base64Data,
        { base64: true }
      );
    });

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "thumbnails.zip";
    link.click();
    link.remove();
  };

  const reset = () => {
    setFile(null);
    setThumbnails([]);
    setNumPages(null);
    setIsGenerating(false);
    setSettings({
      thumbnailWidth: 200,
      format: "png",
      pages: "all",
      customPages: "",
      quality: 100,
      backgroundColor: "#ffffff",
      shadow: true,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          PDF Thumbnail Generator
        </h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload PDF File
          </label>
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={isGenerating}
          />
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width (px)
            </label>
            <input
              type="number"
              name="thumbnailWidth"
              value={settings.thumbnailWidth}
              onChange={handleSettingsChange}
              min="50"
              max="1000"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Format
            </label>
            <select
              name="format"
              value={settings.format}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WEBP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quality (%)
            </label>
            <input
              type="range"
              name="quality"
              value={settings.quality}
              onChange={handleSettingsChange}
              min="10"
              max="100"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              disabled={isGenerating}
            />
            <span className="text-sm text-gray-600">{settings.quality}%</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pages
            </label>
            <select
              name="pages"
              value={settings.pages}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
            >
              <option value="all">All Pages</option>
              <option value="first">First Page</option>
              <option value="custom">Custom Pages</option>
            </select>
          </div>
          {settings.pages === "custom" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pages (e.g., 1,3,5-7)
              </label>
              <input
                type="text"
                name="customPages"
                value={settings.customPages}
                onChange={handleSettingsChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1,3,5-7"
                disabled={isGenerating}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background Color
            </label>
            <input
              type="color"
              name="backgroundColor"
              value={settings.backgroundColor}
              onChange={handleSettingsChange}
              className="w-full h-10 border rounded-md cursor-pointer"
              disabled={isGenerating}
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="shadow"
              checked={settings.shadow}
              onChange={handleSettingsChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isGenerating}
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Add Shadow
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={generateThumbnails}
            disabled={!file || isGenerating}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaCog className={`mr-2 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Generating..." : "Generate Thumbnails"}
          </button>
          {thumbnails.length > 0 && (
            <>
              <button
                onClick={downloadThumbnails}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                disabled={isGenerating}
              >
                <FaDownload className="mr-2" /> Download All
              </button>
              <button
                onClick={downloadZip}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                disabled={isGenerating}
              >
                <FaDownload className="mr-2" /> Download ZIP
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                disabled={isGenerating}
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </>
          )}
        </div>

        {/* Thumbnails Display */}
        {thumbnails.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {thumbnails.map((thumb) => (
              <div
                key={thumb.page}
                className={`border rounded-lg p-2 bg-gray-50 ${
                  settings.shadow ? "shadow-md" : ""
                }`}
              >
                <img
                  src={thumb.dataUrl}
                  alt={`Page ${thumb.page}`}
                  className="w-full h-auto rounded"
                />
                <p className="text-center text-sm mt-2 text-gray-600">
                  Page {thumb.page}
                </p>
              </div>
            ))}
          </div>
        )}

        {!file && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 italic">Upload a PDF to generate thumbnails</p>
          </div>
        )}

        {/* Hidden Canvases */}
        <div className="hidden">
          {Array.from({ length: numPages || 0 }, (_, i) => (
            <canvas key={i} ref={canvasRefs.current[i]} />
          ))}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Custom thumbnail width, format (PNG/JPEG/WEBP), and quality</li>
            <li>Generate for all, first, or custom page ranges</li>
            <li>Customizable background color and shadow</li>
            <li>Download individual thumbnails or as ZIP</li>
            <li>Real-time preview of generated thumbnails</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFThumbnailGenerator;