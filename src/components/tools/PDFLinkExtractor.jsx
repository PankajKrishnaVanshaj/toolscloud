"use client";
import React, { useState, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFLinkExtractor = () => {
  const [file, setFile] = useState(null);
  const [links, setLinks] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState("");
  const [settings, setSettings] = useState({
    extractEmails: true,
    extractURLs: true,
    includeText: false,
    uniqueOnly: false,
  });
  const [previewPage, setPreviewPage] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [sortBy, setSortBy] = useState("page"); // Options: "page", "type", "value"
  const fileInputRef = useRef(null);

  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      extractLinks(selectedFile);
    }
  }, [settings]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const extractLinks = useCallback(async (pdfFile) => {
    setIsProcessing(true);
    setLinks([]);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      let extractedLinks = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const annotations = await page.getAnnotations();

        const text = textContent.items.map((item) => item.str).join(" ");

        if (settings.extractURLs) {
          const urlRegex = /(https?:\/\/[^\s]+)/g;
          const urls = text.match(urlRegex) || [];
          urls.forEach((url) =>
            extractedLinks.push({
              type: "URL",
              value: url,
              page: i,
              context: settings.includeText
                ? text.substring(Math.max(0, text.indexOf(url) - 20), text.indexOf(url) + url.length + 20)
                : "",
            })
          );
        }

        if (settings.extractEmails) {
          const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
          const emails = text.match(emailRegex) || [];
          emails.forEach((email) =>
            extractedLinks.push({
              type: "Email",
              value: email,
              page: i,
              context: settings.includeText
                ? text.substring(Math.max(0, text.indexOf(email) - 20), text.indexOf(email) + email.length + 20)
                : "",
            })
          );
        }

        annotations.forEach((anno) => {
          if (anno.url) {
            extractedLinks.push({
              type: "URL",
              value: anno.url,
              page: i,
              context: "Annotation Link",
            });
          }
        });
      }

      // Remove duplicates if uniqueOnly is true
      if (settings.uniqueOnly) {
        extractedLinks = [...new Map(extractedLinks.map((link) => [link.value, link])).values()];
      }

      setLinks(extractedLinks);
    } catch (error) {
      console.error("Link extraction failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [settings]);

  const handleSettingsChange = (e) => {
    const { name, checked } = e.target;
    setSettings((prev) => ({ ...prev, [name]: checked }));
    if (file) extractLinks(file); // Re-extract with new settings
  };

  const exportToCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Type,Value,Page,Context\n" +
      filteredLinks.map((link) => `${link.type},${link.value},${link.page},"${link.context}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `extracted_links_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setFile(null);
    setLinks([]);
    setFilter("");
    setPreviewPage(1);
    setNumPages(null);
    setSettings({ extractEmails: true, extractURLs: true, includeText: false, uniqueOnly: false });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const filteredLinks = links
    .filter((link) => link.value.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "page") return a.page - b.page;
      if (sortBy === "type") return a.type.localeCompare(b.type);
      if (sortBy === "value") return a.value.localeCompare(b.value);
      return 0;
    });

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Link Extractor</h1>

        {/* File Upload */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={onFileChange}
            className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            onClick={reset}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center transition-colors"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Settings */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "extractURLs", label: "Extract URLs" },
            { name: "extractEmails", label: "Extract Emails" },
            { name: "includeText", label: "Include Context" },
            { name: "uniqueOnly", label: "Unique Links Only" },
          ].map(({ name, label }) => (
            <label key={name} className="flex items-center">
              <input
                type="checkbox"
                name={name}
                checked={settings[name]}
                onChange={handleSettingsChange}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>

        {/* Preview */}
        {file && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">PDF Preview</h2>
            <div className="border p-4 bg-gray-50 rounded-lg">
              <Document file={file} onLoadSuccess={onDocumentLoadSuccess} className="flex justify-center">
                <Page pageNumber={previewPage} width={Math.min(400, window.innerWidth - 40)} />
              </Document>
              {numPages && (
                <div className="mt-4 flex justify-center items-center gap-4">
                  <button
                    onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                    disabled={previewPage === 1}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {previewPage} of {numPages}
                  </span>
                  <button
                    onClick={() => setPreviewPage(Math.min(numPages, previewPage + 1))}
                    disabled={previewPage === numPages}
                    className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Links Display */}
        {links.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Extracted Links ({filteredLinks.length})
              </h2>
              <div className="flex gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="page">Sort by Page</option>
                  <option value="type">Sort by Type</option>
                  <option value="value">Sort by Value</option>
                </select>
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center transition-colors"
                >
                  <FaDownload className="mr-2" /> Export to CSV
                </button>
              </div>
            </div>

            <input
              type="text"
              placeholder="Filter links (e.g., domain.com, @gmail)..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-2 mb-4 border rounded-md focus:ring-2 focus:ring-blue-500"
            />

            <div className="max-h-96 overflow-y-auto rounded-lg border">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Value</th>
                    <th className="px-6 py-3">Page</th>
                    {settings.includeText && <th className="px-6 py-3">Context</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredLinks.map((link, index) => (
                    <tr key={index} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{link.type}</td>
                      <td className="px-6 py-4">
                        <a
                          href={link.type === "URL" ? link.value : `mailto:${link.value}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {link.value}
                        </a>
                      </td>
                      <td className="px-6 py-4">{link.page}</td>
                      {settings.includeText && (
                        <td className="px-6 py-4 text-gray-600">{link.context}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Processing PDF...</p>
          </div>
        )}

        {!file && !isProcessing && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload a PDF to start extracting links</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Extract URLs and email addresses from PDF content</li>
            <li>Support for clickable annotation links</li>
            <li>Preview PDF pages with navigation</li>
            <li>Filter and sort extracted links</li>
            <li>Export to CSV with optional context</li>
            <li>Option for unique links only</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFLinkExtractor;