"use client";
import React, { useState, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { PDFDocument } from "pdf-lib";
import { FaDownload, FaSync, FaUpload, FaSearchPlus, FaSearchMinus } from "react-icons/fa";

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFAnnotationRemover = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [annotations, setAnnotations] = useState([]);
  const [selectedAnnotations, setSelectedAnnotations] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [scale, setScale] = useState(1.0); // Zoom level
  const [settings, setSettings] = useState({
    removeAll: false,
    removeTypes: {
      text: true,
      highlight: true,
      underline: true,
      stamp: true,
      ink: true,
    },
    keepOriginal: false, // Option to keep original file
  });
  const fileInputRef = useRef(null);

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setCurrentPage(1);
      setAnnotations([]);
      setSelectedAnnotations(new Set());
      setScale(1.0);
    }
  };

  const onDocumentLoadSuccess = async ({ numPages }) => {
    setNumPages(numPages);
    await loadAnnotations(1);
  };

  const loadAnnotations = useCallback(
    async (pageNum) => {
      if (!file) return;

      const pdf = await pdfjs.getDocument(URL.createObjectURL(file)).promise;
      const page = await pdf.getPage(pageNum);
      const annots = await page.getAnnotations();
      setAnnotations(annots);
    },
    [file]
  );

  const handlePageChange = async (newPage) => {
    setCurrentPage(newPage);
    await loadAnnotations(newPage);
    setSelectedAnnotations(new Set());
  };

  const toggleAnnotationSelection = (annotId) => {
    setSelectedAnnotations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(annotId)) newSet.delete(annotId);
      else newSet.add(annotId);
      return newSet;
    });
  };

  const handleSettingsChange = (e) => {
    const { name, checked } = e.target;
    if (name === "removeAll" || name === "keepOriginal") {
      setSettings((prev) => ({ ...prev, [name]: checked }));
    } else {
      setSettings((prev) => ({
        ...prev,
        removeTypes: { ...prev.removeTypes, [name]: checked },
      }));
    }
  };

  const removeAnnotations = useCallback(async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const pdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const annotations = await pdfjs
          .getDocument({ data: pdfBytes })
          .promise.then((doc) => doc.getPage(i + 1).then((p) => p.getAnnotations()));

        const annotationsToRemove = settings.removeAll
          ? annotations
          : annotations.filter(
              (annot) =>
                (settings.removeTypes.text && annot.subtype === "Text") ||
                (settings.removeTypes.highlight && annot.subtype === "Highlight") ||
                (settings.removeTypes.underline && annot.subtype === "Underline") ||
                (settings.removeTypes.stamp && annot.subtype === "Stamp") ||
                (settings.removeTypes.ink && annot.subtype === "Ink") ||
                selectedAnnotations.has(annot.id)
            );

        if (annotationsToRemove.length > 0) {
          const annotIdsToRemove = annotationsToRemove.map((annot) => annot.id);
          const existingAnnots = page.node.getAnnots();
          if (existingAnnots) {
            const remainingAnnots = existingAnnots.filter(
              (annot) => !annotIdsToRemove.includes(annot.get("Id")?.toString())
            );
            page.node.setAnnots(remainingAnnots);
          }
        }
      }

      const pdfBytesCleaned = await pdfDoc.save();
      const blob = new Blob([pdfBytesCleaned], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cleaned_${file.name}`;
      link.click();
      URL.revokeObjectURL(url);

      if (!settings.keepOriginal) {
        setFile(blob);
        await loadAnnotations(currentPage);
      }
    } catch (error) {
      console.error("Annotation removal failed:", error);
      alert("An error occurred while removing annotations");
    } finally {
      setIsProcessing(false);
    }
  }, [file, settings, selectedAnnotations, currentPage, loadAnnotations]);

  const reset = () => {
    setFile(null);
    setNumPages(null);
    setCurrentPage(1);
    setAnnotations([]);
    setSelectedAnnotations(new Set());
    setScale(1.0);
    setSettings({
      removeAll: false,
      removeTypes: { text: true, highlight: true, underline: true, stamp: true, ink: true },
      keepOriginal: false,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Annotation Remover</h1>

        {/* File Upload */}
        <div className="mb-6">
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {file && (
          <div className="space-y-6">
            {/* Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h2 className="text-lg font-semibold mb-2 text-gray-700">Removal Settings</h2>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="removeAll"
                      checked={settings.removeAll}
                      onChange={handleSettingsChange}
                      className="mr-2 accent-blue-500"
                    />
                    <span className="text-sm text-gray-700">Remove All Annotations</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="keepOriginal"
                      checked={settings.keepOriginal}
                      onChange={handleSettingsChange}
                      className="mr-2 accent-blue-500"
                    />
                    <span className="text-sm text-gray-700">Keep Original Preview</span>
                  </label>
                  {!settings.removeAll && (
                    <div className="grid grid-cols-2 gap-2 pl-6">
                      {Object.entries(settings.removeTypes).map(([type, checked]) => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            name={type}
                            checked={checked}
                            onChange={handleSettingsChange}
                            className="mr-2 accent-blue-500"
                          />
                          <span className="text-sm text-gray-600 capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Zoom Controls */}
              <div>
                <h2 className="text-lg font-semibold mb-2 text-gray-700">Zoom</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
                    className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    <FaSearchMinus />
                  </button>
                  <span className="text-sm text-gray-600">{(scale * 100).toFixed(0)}%</span>
                  <button
                    onClick={() => setScale((prev) => Math.min(2.0, prev + 0.1))}
                    className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    <FaSearchPlus />
                  </button>
                </div>
              </div>
            </div>

            {/* Preview and Navigation */}
            <div className="border p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {numPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || isProcessing}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(Math.min(numPages, currentPage + 1))}
                    disabled={currentPage === numPages || isProcessing}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="flex justify-center"
                >
                  <Page pageNumber={currentPage} scale={scale} width={800} />
                </Document>
              </div>
              {annotations.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700">Annotations on this page:</h3>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2 bg-white">
                    {annotations.map((annot) => (
                      <label key={annot.id} className="flex items-center py-1">
                        <input
                          type="checkbox"
                          checked={selectedAnnotations.has(annot.id)}
                          onChange={() => toggleAnnotationSelection(annot.id)}
                          className="mr-2 accent-blue-500"
                          disabled={settings.removeAll || isProcessing}
                        />
                        <span className="text-sm text-gray-600 truncate">
                          {annot.subtype} - {annot.contents?.substring(0, 30) || "No content"}...
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={removeAnnotations}
                disabled={!file || isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" />
                {isProcessing ? "Processing..." : "Remove & Download"}
              </button>
              <button
                onClick={reset}
                disabled={!file || isProcessing}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>
        )}

        {!file && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload a PDF to start</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Remove specific annotation types or all annotations</li>
            <li>Manual selection of individual annotations</li>
            <li>Zoom in/out for better preview</li>
            <li>Keep original file option</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Multi-page navigation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFAnnotationRemover;