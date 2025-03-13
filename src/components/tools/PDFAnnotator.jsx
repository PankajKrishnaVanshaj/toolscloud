// app/components/PDFAnnotator.jsx
"use client";
import React, { useState, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { FaSave, FaTrash, FaUndo, FaRedo, FaFileUpload } from "react-icons/fa";

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFAnnotator = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tool, setTool] = useState("select"); // select, highlight, note, draw
  const [annotations, setAnnotations] = useState([]);
  const [scale, setScale] = useState(1.0);
  const [color, setColor] = useState("#FFFF00"); // Default highlight color
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const onFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setAnnotations([]);
      setHistory([]);
      setHistoryIndex(-1);
      setCurrentPage(1);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const saveToHistory = useCallback(() => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(annotations);
      return newHistory.slice(-20); // Keep last 20 states
    });
    setHistoryIndex((prev) => prev + 1);
  }, [annotations, historyIndex]);

  const addAnnotation = (type, data) => {
    saveToHistory();
    setAnnotations((prev) => [
      ...prev,
      { id: Date.now(), type, page: currentPage, color, ...data },
    ]);
  };

  const handleCanvasClick = (e) => {
    if (!canvasRef.current || tool === "select") return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    switch (tool) {
      case "highlight":
        addAnnotation("highlight", { x, y, width: 200, height: 20 });
        break;
      case "note":
        addAnnotation("note", { x, y, text: "New note" });
        break;
      case "draw":
        addAnnotation("draw", { x, y, points: [{ x, y }] });
        break;
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setAnnotations(history[historyIndex - 1]);
      setHistoryIndex((prev) => prev - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setAnnotations(history[historyIndex + 1]);
      setHistoryIndex((prev) => prev + 1);
    }
  };

  const saveAnnotations = () => {
    const data = JSON.stringify({ fileName: file?.name, annotations });
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${file?.name || "document"}_annotations.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadAnnotations = (e) => {
    const annotationFile = e.target.files[0];
    if (annotationFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const { fileName, annotations: loadedAnnotations } = JSON.parse(event.target.result);
        setAnnotations(loadedAnnotations);
        setHistory([]);
        setHistoryIndex(-1);
      };
      reader.readAsText(annotationFile);
    }
  };

  const clearAnnotations = () => {
    saveToHistory();
    setAnnotations([]);
  };

  const renderAnnotations = () => {
    return annotations
      .filter((ann) => ann.page === currentPage)
      .map((ann) => {
        switch (ann.type) {
          case "highlight":
            return (
              <div
                key={ann.id}
                className="absolute opacity-50"
                style={{
                  left: ann.x * scale,
                  top: ann.y * scale,
                  width: ann.width * scale,
                  height: ann.height * scale,
                  backgroundColor: ann.color,
                }}
              />
            );
          case "note":
            return (
              <div
                key={ann.id}
                className="absolute bg-blue-100 p-2 rounded shadow text-sm"
                style={{ left: ann.x * scale, top: ann.y * scale }}
              >
                {ann.text}
              </div>
            );
          case "draw":
            return (
              <svg
                key={ann.id}
                className="absolute"
                style={{ left: ann.x * scale, top: ann.y * scale }}
              >
                <polyline
                  points={ann.points.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke={ann.color}
                  strokeWidth="2"
                />
              </svg>
            );
          default:
            return null;
        }
      });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Annotator</h1>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setTool("select")}
            className={`flex items-center px-3 py-2 rounded-md ${
              tool === "select" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Select
          </button>
          <button
            onClick={() => setTool("highlight")}
            className={`flex items-center px-3 py-2 rounded-md ${
              tool === "highlight" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Highlight
          </button>
          <button
            onClick={() => setTool("note")}
            className={`flex items-center px-3 py-2 rounded-md ${
              tool === "note" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Note
          </button>
          <button
            onClick={() => setTool("draw")}
            className={`flex items-center px-3 py-2 rounded-md ${
              tool === "draw" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Draw
          </button>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-10 p-1 rounded-md border-none cursor-pointer"
            title="Choose color"
          />
          <select
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="0.5">50%</option>
            <option value="1.0">100%</option>
            <option value="1.5">150%</option>
            <option value="2.0">200%</option>
          </select>
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="flex items-center px-3 py-2 bg-gray-200 rounded-md disabled:opacity-50"
          >
            <FaUndo className="mr-1" /> Undo
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="flex items-center px-3 py-2 bg-gray-200 rounded-md disabled:opacity-50"
          >
            <FaRedo className="mr-1" /> Redo
          </button>
          <button
            onClick={saveAnnotations}
            disabled={!file || annotations.length === 0}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FaSave className="mr-1" /> Save
          </button>
          <label className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md cursor-pointer">
            <FaFileUpload className="mr-1" /> Load
            <input
              type="file"
              accept=".json"
              onChange={loadAnnotations}
              className="hidden"
            />
          </label>
          <button
            onClick={clearAnnotations}
            disabled={!file || annotations.length === 0}
            className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FaTrash className="mr-1" /> Clear
          </button>
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={onFileChange}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* PDF Viewer */}
        {file ? (
          <div className="relative">
            <div className="overflow-auto max-h-[70vh] border bg-gray-50 rounded-lg">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                className="relative"
              >
                <div
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="relative mx-auto"
                >
                  <Page
                    pageNumber={currentPage}
                    scale={scale}
                    renderAnnotationLayer={false}
                    renderTextLayer={true}
                  />
                  {renderAnnotations()}
                </div>
              </Document>
            </div>

            {/* Navigation */}
            {numPages && (
              <div className="mt-4 flex justify-center items-center gap-4">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300 transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  Page {currentPage} of {numPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                  disabled={currentPage === numPages}
                  className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaFileUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload a PDF to start annotating</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Tools: Highlight, Note, Free Draw</li>
            <li>Customizable colors for annotations</li>
            <li>Undo/Redo functionality</li>
            <li>Save and load annotations as JSON</li>
            <li>Zoom control (50%-200%)</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Multi-page navigation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFAnnotator;