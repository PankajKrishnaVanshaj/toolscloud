"use client";
import React, { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { FaFileUpload, FaSync, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading analysis report

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFSecurityAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [detailedAnalysis, setDetailedAnalysis] = useState(false);
  const fileInputRef = React.useRef(null);
  const analysisRef = React.useRef(null);

  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setAnalysisResult(null);
      setPreviewPage(1);
      setNumPages(null);
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const analyzePDF = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;

      // Perform security analysis
      const metadata = await pdf.getMetadata();
      const jsActions = await pdf.getJavaScript();
      const isEncrypted = pdf.isEncrypted || false;
      const hasJavaScript = jsActions.length > 0;

      // Analyze pages for annotations and content
      const pagePromises = Array.from({ length: pdf.numPages }, (_, i) =>
        pdf.getPage(i + 1)
      );
      const pages = await Promise.all(pagePromises);
      const hasExternalLinks = pages.some((page) => {
        const annotations = page.getAnnotations();
        return annotations.some((ann) => ann.url || ann.unsafeUrl);
      });

      // Detailed analysis (optional)
      let suspiciousText = [];
      let fontAnalysis = new Set();
      if (detailedAnalysis) {
        for (const page of pages) {
          const textContent = await page.getTextContent();
          textContent.items.forEach((item) => {
            if (item.str.match(/(javascript|eval|script|http)/i)) {
              suspiciousText.push(item.str);
            }
            if (item.fontName) fontAnalysis.add(item.fontName);
          });
        }
      }

      const result = {
        fileName: file.name,
        fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
        pageCount: pdf.numPages,
        isEncrypted,
        hasJavaScript,
        javascriptCount: jsActions.length,
        hasExternalLinks,
        metadata: {
          title: metadata.info?.Title,
          author: metadata.info?.Author,
          creationDate: metadata.info?.CreationDate,
          modifiedDate: metadata.info?.ModDate,
        },
        securityScore: calculateSecurityScore({
          isEncrypted,
          hasJavaScript,
          hasExternalLinks,
          suspiciousText: suspiciousText.length,
        }),
        detailed: detailedAnalysis
          ? {
              suspiciousText: suspiciousText.slice(0, 10), // Limit to 10 for brevity
              fontCount: fontAnalysis.size,
              fontsUsed: Array.from(fontAnalysis),
            }
          : null,
      };

      setAnalysisResult(result);
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysisResult({ error: "Failed to analyze PDF: " + error.message });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateSecurityScore = ({
    isEncrypted,
    hasJavaScript,
    hasExternalLinks,
    suspiciousText,
  }) => {
    let score = 100;
    if (!isEncrypted) score -= 20;
    if (hasJavaScript) score -= 30;
    if (hasExternalLinks) score -= 20;
    if (suspiciousText > 0) score -= 10 * Math.min(suspiciousText, 5); // Cap penalty
    return Math.max(0, score);
  };

  const reset = () => {
    setFile(null);
    setAnalysisResult(null);
    setPreviewPage(1);
    setNumPages(null);
    setDetailedAnalysis(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadReport = () => {
    if (analysisRef.current) {
      html2canvas(analysisRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `pdf-security-report-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Security Analyzer</h1>

        {/* File Upload and Options */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload PDF File</label>
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={onFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={detailedAnalysis}
                onChange={(e) => setDetailedAnalysis(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              Detailed Analysis
            </label>
            <p className="text-xs text-gray-500">
              Includes text and font analysis (may take longer)
            </p>
          </div>
        </div>

        {/* Preview */}
        {file && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">Document Preview</h2>
            <div className="border p-4 bg-gray-50 rounded-lg">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex justify-center"
              >
                <Page pageNumber={previewPage} width={Math.min(400, window.innerWidth - 40)} />
              </Document>
              {numPages && (
                <div className="mt-2 text-center space-x-2">
                  <button
                    onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                    disabled={previewPage === 1 || isAnalyzing}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {previewPage} of {numPages}
                  </span>
                  <button
                    onClick={() => setPreviewPage(Math.min(numPages, previewPage + 1))}
                    disabled={previewPage === numPages || isAnalyzing}
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
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={analyzePDF}
            disabled={!file || isAnalyzing}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isAnalyzing ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Analyzing...
              </span>
            ) : (
              <>
                <FaFileUpload className="mr-2" /> Analyze Security
              </>
            )}
          </button>
          <button
            onClick={downloadReport}
            disabled={!analysisResult || isAnalyzing}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download Report
          </button>
          <button
            onClick={reset}
            disabled={isAnalyzing}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <div ref={analysisRef} className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-700">Analysis Results</h2>

            {analysisResult.error ? (
              <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                {analysisResult.error}
              </div>
            ) : (
              <>
                {/* Security Score */}
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 relative">
                    <div
                      className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xl ${
                        analysisResult.securityScore >= 70
                          ? "bg-green-500"
                          : analysisResult.securityScore >= 40
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    >
                      {analysisResult.securityScore}%
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">Security Score</h3>
                    <p className="text-sm text-gray-600">
                      Overall document security assessment
                    </p>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">File Name</p>
                    <p className="font-medium truncate">{analysisResult.fileName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">File Size</p>
                    <p className="font-medium">{analysisResult.fileSize}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Page Count</p>
                    <p className="font-medium">{analysisResult.pageCount}</p>
                  </div>
                </div>

                {/* Security Features */}
                <div>
                  <h3 className="font-semibold mb-2 text-gray-700">Security Features</h3>
                  <div className="space-y-2">
                    <p className={analysisResult.isEncrypted ? "text-green-600" : "text-red-600"}>
                      Encryption: {analysisResult.isEncrypted ? "Enabled" : "Not Enabled"}
                    </p>
                    <p className={analysisResult.hasJavaScript ? "text-red-600" : "text-green-600"}>
                      JavaScript: {analysisResult.hasJavaScript ? `Detected (${analysisResult.javascriptCount} instances)` : "Not Detected"}
                    </p>
                    <p className={analysisResult.hasExternalLinks ? "text-yellow-600" : "text-green-600"}>
                      External Links: {analysisResult.hasExternalLinks ? "Detected" : "Not Detected"}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div>
                  <h3 className="font-semibold mb-2 text-gray-700">Metadata</h3>
                  <div className="space-y-2">
                    {Object.entries(analysisResult.metadata).map(([key, value]) =>
                      value ? (
                        <p key={key} className="text-sm">
                          <span className="text-gray-600">
                            {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:
                          </span>
                          <span className="ml-2 font-medium">{value}</span>
                        </p>
                      ) : null
                    )}
                  </div>
                </div>

                {/* Detailed Analysis */}
                {analysisResult.detailed && (
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-700">Detailed Analysis</h3>
                    <div className="space-y-2">
                      <p>
                        <span className="text-gray-600">Suspicious Text Fragments:</span>
                        <span className="ml-2 font-medium">
                          {analysisResult.detailed.suspiciousText.length > 0
                            ? analysisResult.detailed.suspiciousText.join(", ")
                            : "None"}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-600">Number of Fonts Used:</span>
                        <span className="ml-2 font-medium">{analysisResult.detailed.fontCount}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600">Fonts:</span>
                        <span className="ml-2 font-medium">
                          {analysisResult.detailed.fontsUsed.join(", ")}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Analyzes encryption, JavaScript, and external links</li>
            <li>Optional detailed text and font analysis</li>
            <li>Security score with visual indicator</li>
            <li>PDF preview with page navigation</li>
            <li>Downloadable analysis report</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFSecurityAnalyzer;