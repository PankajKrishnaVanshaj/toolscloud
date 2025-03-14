"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync } from "react-icons/fa";

const JsonToHtmlTable = () => {
  const [jsonInput, setJsonInput] = useState("");
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

  // Parse JSON and convert to table data
  const parseJson = useCallback((jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("JSON must be a non-empty array of objects");
      }

      // Extract headers from the first object
      const headers = options.headers ? Object.keys(parsed[0]) : [];
      const data = parsed.map((item) =>
        headers.map((header) => (item[header] !== undefined ? String(item[header]) : ""))
      );

      return { headers, data };
    } catch (err) {
      throw new Error(`Invalid JSON: ${err.message}`);
    }
  }, [options.headers]);

  // Generate HTML table
  const generateHtmlTable = useCallback(() => {
    setError("");
    setHtmlTable("");

    if (!jsonInput.trim()) {
      setError("Please enter JSON data");
      return;
    }

    try {
      const { headers, data } = parseJson(jsonInput);

      let classes = "table";
      if (options.bordered) classes += " table-bordered";
      if (options.striped) classes += " table-striped";
      if (options.hover) classes += " table-hover";
      if (options.centered) classes += " mx-auto";
      if (options.darkMode) classes += " table-dark";
      classes += ` text-${options.fontSize}`;
      if (options.customClass) classes += ` ${options.customClass}`;

      let html = options.responsive ? '<div class="table-responsive">\n' : "";
      html += `  <table class="${classes.trim()}">\n`;

      if (options.headers && headers.length > 0) {
        html += "    <thead>\n      <tr>\n";
        headers.forEach((header) => {
          html += `        <th>${escapeHtml(header)}</th>\n`;
        });
        html += "      </tr>\n    </thead>\n";
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
      setError(err.message);
    }
  }, [jsonInput, options]);

  // Escape HTML characters
  const escapeHtml = (text) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setJsonInput(event.target.result);
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
    setJsonInput("");
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
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          JSON to HTML Table Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                JSON Input
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='e.g., [{"Name": "John", "Age": 25, "City": "New York"}, {"Name": "Jane", "Age": 30, "City": "London"}]'
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-y font-mono text-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <div className="flex gap-2">
                <button
                  onClick={generateHtmlTable}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Convert to HTML
                </button>
                <button
                  onClick={reset}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <FaSync className="mr-2" /> Reset
                </button>
              </div>
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Table Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: "headers", label: "Use Keys as Headers" },
                { key: "bordered", label: "Bordered Table" },
                { key: "striped", label: "Striped Rows" },
                { key: "hover", label: "Hover Effect" },
                { key: "responsive", label: "Responsive Wrapper" },
                { key: "centered", label: "Centered Table" },
                { key: "darkMode", label: "Dark Mode" },
              ].map(({ key, label }) => (
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
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <h2 className="text-lg font-semibold text-gray-700">HTML Table Output</h2>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                  >
                    <FaCopy className="mr-2" /> Copy
                  </button>
                  <button
                    onClick={downloadHtml}
                    className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FaDownload className="mr-2" /> Download
                  </button>
                </div>
              </div>
              <pre className="text-sm bg-gray-100 p-4 rounded-md overflow-auto max-h-96 font-mono">
                {htmlTable}
              </pre>
              <div className="mt-4">
                <h3 className="text-md font-semibold text-gray-700 mb-2">Preview</h3>
                <div
                  className="p-4 bg-white rounded-md shadow-sm overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: htmlTable }}
                />
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert JSON arrays to styled HTML tables</li>
              <li>File upload (.json) or manual input support</li>
              <li>Customizable Bootstrap-like styles</li>
              <li>Options for headers, borders, stripes, hover, and more</li>
              <li>Font size and custom class support</li>
              <li>Copy to clipboard or download as HTML</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonToHtmlTable;