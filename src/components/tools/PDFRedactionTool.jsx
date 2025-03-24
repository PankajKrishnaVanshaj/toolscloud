"use client";
import React, { useState, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { FaDownload, FaTrash, FaUndo, FaRedo, FaSync } from "react-icons/fa";
import { PDFDocument, rgb } from "pdf-lib"; 

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFRedactionTool = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [redactions, setRedactions] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [redactionMode, setRedactionMode] = useState("rectangle");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [scale, setScale] = useState(1.0);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle file upload
  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setRedactions([]);
      setHistory([]);
      setHistoryIndex(-1);
      setCurrentPage(1);
      setScale(1.0);
    }
  }, []);

  // Handle PDF load success
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Save to history
  const saveToHistory = useCallback(() => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push([...redactions]);
      return newHistory.slice(-10); // Keep last 10 states
    });
    setHistoryIndex((prev) => prev + 1);
  }, [redactions, historyIndex]);

  // Rectangle Redaction
  const handleMouseDown = (e) => {
    if (redactionMode !== "rectangle") return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    setStartPos({
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    });
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || redactionMode !== "rectangle") return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) / scale;
    const currentY = (e.clientY - rect.top) / scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(
      startPos.x,
      startPos.y,
      currentX - startPos.x,
      currentY - startPos.y
    );
  };

  const handleMouseUp = (e) => {
    if (!isDrawing || redactionMode !== "rectangle") return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const endX = (e.clientX - rect.left) / scale;
    const endY = (e.clientY - rect.top) / scale;

    saveToHistory();
    setRedactions((prev) => [
      ...prev,
      {
        page: currentPage,
        type: "rectangle",
        x: Math.min(startPos.x, endX),
        y: Math.min(startPos.y, endY),
        width: Math.abs(endX - startPos.x),
        height: Math.abs(endY - startPos.y),
      },
    ]);

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsDrawing(false);
    setStartPos(null);
  };

  // Text Redaction
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && redactionMode === "text") {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      saveToHistory();
      setRedactions((prev) => [
        ...prev,
        {
          page: currentPage,
          type: "text",
          x: rect.x / scale,
          y: rect.y / scale,
          width: rect.width / scale,
          height: rect.height / scale,
          text: selection.toString(),
        },
      ]);
      selection.removeAllRanges();
    }
  };

  // Undo/Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setRedactions(history[historyIndex - 1]);
      setHistoryIndex((prev) => prev - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setRedactions(history[historyIndex + 1]);
      setHistoryIndex((prev) => prev + 1);
    }
  };

  // Export Redacted PDF
  const exportRedactedPDF = async () => {
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    redactions.forEach((redaction) => {
      const page = pages[redaction.page - 1];
      const { width, height } = page.getSize();
      const scaleFactor = width / (800 * scale); // Adjust based on display width

      page.drawRectangle({
        x: redaction.x / scaleFactor,
        y: height - (redaction.y + redaction.height) / scaleFactor,
        width: redaction.width / scaleFactor,
        height: redaction.height / scaleFactor,
        color: rgb(0, 0, 0), // Use rgb from pdf-lib
        opacity: 1,
      });
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `redacted_${file.name}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Reset
  const reset = () => {
    setFile(null);
    setRedactions([]);
    setHistory([]);
    setHistoryIndex(-1);
    setCurrentPage(1);
    setScale(1.0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Redaction Tool</h1>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={onFileChange}
            className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={redactionMode}
              onChange={(e) => setRedactionMode(e.target.value)}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="rectangle">Rectangle</option>
              <option value="text">Text Selection</option>
            </select>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <FaUndo />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <FaRedo />
            </button>
            <button
              onClick={() => {
                saveToHistory();
                setRedactions([]);
              }}
              disabled={!redactions.length}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <FaTrash />
            </button>
            <button
              onClick={reset}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSync />
            </button>
            <button
              onClick={exportRedactedPDF}
              disabled={!file || !redactions.length}
              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <FaDownload />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        {file ? (
          <div className="relative">
            <div
              className="relative border bg-gray-50 rounded-md overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => setIsDrawing(false)}
            >
              <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                <Page
                  pageNumber={currentPage}
                  width={800 * scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  onClick={handleTextSelection}
                />
              </Document>
              {redactions
                .filter((r) => r.page === currentPage)
                .map((redaction, index) => (
                  <div
                    key={index}
                    className="absolute bg-black"
                    style={{
                      left: redaction.x * scale,
                      top: redaction.y * scale,
                      width: redaction.width * scale,
                      height: redaction.height * scale,
                      opacity: 0.8,
                    }}
                  />
                ))}
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 pointer-events-none"
                width={800 * scale}
                height={1000 * scale}
              />
            </div>

            {/* Navigation */}
            {numPages && (
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <span className="py-2 text-gray-700">
                  Page {currentPage} of {numPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                  disabled={currentPage === numPages}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 italic">Upload a PDF to start redacting</p>
          </div>
        )}

        {/* Redaction List */}
        {redactions.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Redactions ({redactions.length})
            </h2>
            <div className="max-h-40 overflow-y-auto">
              {redactions.map((r, index) => (
                <div
                  key={index}
                  className="p-2 bg-gray-100 rounded-md mb-2 flex justify-between items-center"
                >
                  <span>
                    Page {r.page}:{" "}
                    {r.type === "text"
                      ? `Text: "${r.text.substring(0, 20)}..."`
                      : "Rectangle"}
                  </span>
                  <button
                    onClick={() => {
                      saveToHistory();
                      setRedactions((prev) => prev.filter((_, i) => i !== index));
                    }}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Rectangle and text selection redaction modes</li>
            <li>Undo/redo functionality with history</li>
            <li>Zoom control for precise redaction</li>
            <li>Export redacted PDF with permanent changes</li>
            <li>Real-time preview of redactions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFRedactionTool;