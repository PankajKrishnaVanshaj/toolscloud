"use client";
import React, { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { useDropzone } from "react-dropzone";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PDFDocument } from "pdf-lib"; // For actual PDF manipulation
import { FaDownload, FaSync, FaUpload, FaTrash } from "react-icons/fa";

// Set pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PageItem = ({ pageNumber, index, movePage, totalPages, removePage }) => {
  const [, drag] = useDrag({
    type: "PAGE",
    item: { index },
  });

  const [, drop] = useDrop({
    accept: "PAGE",
    hover: (item) => {
      if (item.index !== index) {
        movePage(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className="flex items-center space-x-4 p-3 bg-white rounded-lg shadow-sm hover:bg-gray-50 cursor-move transition-colors"
    >
      <div className="w-24 h-32 bg-gray-100 flex items-center justify-center">
        <Page pageNumber={pageNumber} width={80} />
      </div>
      <div className="flex-1">
        <span className="text-sm text-gray-600">
          Page {pageNumber} of {totalPages}
        </span>
      </div>
      <button
        onClick={() => removePage(index)}
        className="p-2 text-red-600 hover:text-red-800 transition-colors"
      >
        <FaTrash />
      </button>
    </div>
  );
};

const PDFPageReorder = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pages, setPages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(80); // Default preview size

  const onDrop = useCallback((acceptedFiles) => {
    const pdfFile = acceptedFiles[0];
    if (pdfFile && pdfFile.type === "application/pdf") {
      setFile(pdfFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPages(Array.from({ length: numPages }, (_, i) => i + 1));
  };

  const movePage = useCallback((fromIndex, toIndex) => {
    setPages((prevPages) => {
      const newPages = [...prevPages];
      const [movedPage] = newPages.splice(fromIndex, 1);
      newPages.splice(toIndex, 0, movedPage);
      return newPages;
    });
  }, []);

  const removePage = useCallback((index) => {
    setPages((prevPages) => prevPages.filter((_, i) => i !== index));
  }, []);

  const reorderAndDownload = async () => {
    if (!file || !pages.length) return;

    setIsProcessing(true);
    try {
      // Load the original PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdfDoc = await PDFDocument.create();

      // Reorder pages
      const originalPages = await newPdfDoc.copyPages(
        pdfDoc,
        pages.map((p) => p - 1) // Convert to 0-based index
      );
      originalPages.forEach((page) => newPdfDoc.addPage(page));

      // Save the new PDF
      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reordered_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Reordering failed:", error);
      alert("An error occurred while reordering the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setNumPages(null);
    setPages([]);
    setPreviewZoom(80);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Page Reorder</h1>

        {/* File Dropzone */}
        {!file && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
            }`}
          >
            <input {...getInputProps()} />
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-600">
              Drag and drop a PDF file here, or click to select
            </p>
            <p className="text-sm text-gray-400 mt-2">Only PDF files are supported</p>
          </div>
        )}

        {/* Page Reordering Interface */}
        {file && (
          <DndProvider backend={HTML5Backend}>
            <div className="space-y-6">
              {/* Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preview Size ({previewZoom}px)
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={previewZoom}
                    onChange={(e) => setPreviewZoom(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>

              {/* Pages List */}
              <div className="max-h-[60vh] overflow-y-auto space-y-2">
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="hidden"
                >
                  {pages.map((pageNumber, index) => (
                    <PageItem
                      key={pageNumber}
                      pageNumber={pageNumber}
                      index={index}
                      movePage={movePage}
                      totalPages={numPages}
                      removePage={removePage}
                    />
                  ))}
                </Document>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={reset}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <FaSync className="mr-2" /> Reset
                </button>
                <button
                  onClick={reorderAndDownload}
                  disabled={isProcessing || !pages.length}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  {isProcessing ? "Processing..." : "Download Reordered PDF"}
                </button>
              </div>

              {/* Page Count */}
              {pages.length > 0 && (
                <p className="text-sm text-gray-600">
                  Total Pages: {pages.length} {pages.length !== numPages && `(Originally ${numPages})`}
                </p>
              )}
            </div>
          </DndProvider>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Drag and drop PDF page reordering</li>
            <li>Remove individual pages</li>
            <li>Adjustable preview size</li>
            <li>Actual PDF reordering with pdf-lib</li>
            <li>Download reordered PDF</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFPageReorder;