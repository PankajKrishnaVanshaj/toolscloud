"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaCopy, FaSync } from "react-icons/fa";

const CsvToHtmlTable = () => {
  const [csvInput, setCsvInput] = useState("");
  const [htmlTable, setHtmlTable] = useState("");
  const [error, setError] = useState("");
  const [options, setOptions] = useState({
    headers: true,
    bordered: true,
    striped: false,
    hover: true,
    responsive: false,
    centered: false,
    darkMode: false,
    fontSize: "md",
    customClass: "",
  });

  // Improved CSV parsing with better quote handling
  const parseCSV = useCallback((csv) => {
    const lines = csv.trim().split("\n").map((line) => line.trim());
    if (lines.length === 0) return [];

    return lines.map((line) => {
      const values = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
          if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
            current += '"'; // Handle escaped quotes
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (line[i] === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += line[i];
        }
      }
      values.push(current.trim());
      return values;
    });
  }, []);

  // Generate HTML table with additional options
  const generateHtmlTable = useCallback(() => {
    setError("");
    setHtmlTable("");

    if (!csvInput.trim()) {
      setError("Please enter CSV data");
      return;
    }

    try {
      const data = parseCSV(csvInput);
      if (data.length === 0) {
        setError("No valid CSV data found");
        return;
      }

      let classes = "table";
      if (options.bordered) classes += " table-bordered";
      if (options.striped) classes += " table-striped";
      if (options.hover) classes += " table-hover";
      if (options.centered) classes += " mx-auto";
      if (options.darkMode) classes += " table-dark";
      classes += ` table-${options.fontSize}`;
      if (options.customClass) classes += ` ${options.customClass}`;

      let html = options.responsive ? '<div class="table-responsive">\n' : "";
      html += `  <table class="${classes.trim()}">\n`;

      if (options.headers && data.length > 0) {
        html += "    <thead>\n      <tr>\n";
        data[0].forEach((header) => {
          html += `        <th>${escapeHtml(header)}</th>\n`;
        });
        html += "      </tr>\n    </thead>\n";
        data.shift();
      }

      html += "    <tbody>\n";
      data.forEach((row) => {
        html += "      <tr>\n";
        row.forEach((cell) => {
          html += `        <td>${escapeHtml(cell)}</td>\n`;
        });
        html += "      </tr>\n";
      });
      html += "    </tbody>\n  </table>\n";
      if (options.responsive) html += "</div>";

      setHtmlTable(html);
    } catch (err) {
      setError(`Error parsing CSV: ${err.message}`);
    }
  }, [csvInput, options]);

  // Escape HTML characters
  const escapeHtml = (text) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setCsvInput(event.target.result);
      reader.readAsText(file);
    }
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(htmlTable);
  };

  // Download as HTML file
  const downloadHtml = () => {
    const blob = new Blob([htmlTable], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `table-${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Reset all inputs and options
  const reset = () => {
    setCsvInput("");
    setHtmlTable("");
    setError("");
    setOptions({
      headers: true,
      bordered: true,
      striped: false,
      hover: true,
      responsive: false,
      centered: false,
      darkMode: false,
      fontSize: "md",
      customClass: "",
    });
  };

  // Handle option changes
  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          CSV to HTML Table Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CSV Input
              </label>
              <textarea
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder='e.g., "Name","Age","City"\n"John",25,"New York"\n"Jane",30,"London"'
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-y"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <div className="flex gap-2">
                <button
                  onClick={generateHtmlTable}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Convert to HTML
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                >
                  <FaSync className="mr-2" /> Reset
                </button>
              </div>
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Table Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Use First Row as Headers", key: "headers" },
                { label: "Bordered Table", key: "bordered" },
                { label: "Striped Rows", key: "striped" },
                { label: "Hover Effect", key: "hover" },
                { label: "Responsive Wrapper", key: "responsive" },
                { label: "Centered Table", key: "centered" },
                { label: "Dark Mode", key: "darkMode" },
              ].map(({ label, key }) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={options[key]}
                    onChange={(e) => handleOptionChange(key, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  {label}
                </label>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Size
                </label>
                <select
                  value={options.fontSize}
                  onChange={(e) => handleOptionChange("fontSize", e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Class
                </label>
                <input
                  type="text"
                  value={options.customClass}
                  onChange={(e) => handleOptionChange("customClass", e.target.value)}
                  placeholder="e.g., my-table"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Output Section */}
          {htmlTable && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-2">
                <h2 className="text-lg font-semibold">HTML Table Output</h2>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                  >
                    <FaCopy className="mr-2" /> Copy
                  </button>
                  <button
                    onClick={downloadHtml}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FaDownload className="mr-2" /> Download
                  </button>
                </div>
              </div>
              <pre className="text-sm bg-gray-100 p-4 rounded-md overflow-auto max-h-96 whitespace-pre-wrap">
                {htmlTable}
              </pre>
              <div className="mt-4">
                <h3 className="text-md font-semibold mb-2">Preview</h3>
                <div
                  className="p-4 bg-white border rounded-md"
                  dangerouslySetInnerHTML={{ __html: htmlTable }}
                />
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert CSV to styled HTML tables</li>
              <li>Supports file upload or manual input</li>
              <li>Advanced options: dark mode, font size, custom classes</li>
              <li>Improved CSV parsing with quote handling</li>
              <li>Preview, copy, or download generated HTML</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CsvToHtmlTable;