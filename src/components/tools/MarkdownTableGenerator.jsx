"use client";
import React, { useState, useCallback, useRef } from "react";
import { saveAs } from "file-saver";
import { FaDownload, FaCopy, FaSync, FaTrash, FaPlus } from "react-icons/fa";

const MarkdownTableGenerator = () => {
  const [columns, setColumns] = useState([
    { name: "ID", align: "left" },
    { name: "Name", align: "left" },
    { name: "Value", align: "right" },
  ]);
  const [rows, setRows] = useState([
    ["1", "John", "100"],
    ["2", "Jane", "200"],
  ]);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [tableTitle, setTableTitle] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const previewRef = useRef(null);

  const MAX_ROWS = 1000;
  const MAX_COLS = 20;
  const ALIGN_OPTIONS = ["left", "center", "right"];

  // Generate Markdown table
  const generateMarkdown = useCallback(() => {
    if (columns.length === 0) return "";

    let markdown = tableTitle ? `# ${tableTitle}\n\n` : "";
    markdown += "| " + columns.map((col) => col.name).join(" | ") + " |\n";
    markdown += "| " + columns.map((col) =>
      col.align === "center" ? ":-:" : col.align === "right" ? "-:" : ":-"
    ).join(" | ") + " |\n";

    rows.forEach((row) => {
      markdown += "| " + row.map((cell) => cell || "").join(" | ") + " |\n";
    });

    return markdown.trim();
  }, [columns, rows, tableTitle]);

  // Add new column
  const addColumn = () => {
    if (columns.length < MAX_COLS) {
      setColumns([...columns, { name: `Column${columns.length + 1}`, align: "left" }]);
      setRows(rows.map((row) => [...row, ""]));
    }
  };

  // Update column properties
  const updateColumn = (index, key, value) => {
    const newColumns = [...columns];
    newColumns[index][key] = value;
    setColumns(newColumns);
  };

  // Remove column
  const removeColumn = (index) => {
    if (columns.length > 1) {
      setColumns(columns.filter((_, i) => i !== index));
      setRows(rows.map((row) => row.filter((_, i) => i !== index)));
    }
  };

  // Add new row
  const addRow = () => {
    if (rows.length < MAX_ROWS) {
      setRows([...rows, Array(columns.length).fill("")]);
    }
  };

  // Update cell value
  const updateCell = (rowIdx, colIdx, value) => {
    const newRows = [...rows];
    newRows[rowIdx][colIdx] = value;
    setRows(newRows);
  };

  // Remove row
  const removeRow = (index) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      const markdown = generateMarkdown();
      if (!markdown) {
        setError("Nothing to copy - table is empty");
        return;
      }
      await navigator.clipboard.writeText(markdown);
      setIsCopied(true);
      setError("");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy: " + err.message);
    }
  };

  // Download as Markdown file
  const downloadMarkdown = () => {
    const markdown = generateMarkdown();
    if (!markdown) {
      setError("Nothing to download - table is empty");
      return;
    }
    try {
      const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
      saveAs(blob, `table-${Date.now()}.md`);
      setError("");
    } catch (err) {
      setError("Download failed: " + err.message);
    }
  };

  // Clear table
  const clearTable = () => {
    setColumns([{ name: "Column1", align: "left" }]);
    setRows([[""]]);
    setTableTitle("");
    setError("");
    setIsCopied(false);
  };

  // Import CSV
  const importCSV = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target.result;
        const lines = csv.split("\n").filter((line) => line.trim());
        if (lines.length > 0) {
          const headers = lines[0].split(",").map((name) => ({
            name: name.trim(),
            align: "left",
          }));
          const newRows = lines.slice(1).map((line) =>
            line.split(",").map((cell) => cell.trim())
          );
          setColumns(headers);
          setRows(newRows);
          setError("");
        }
      };
      reader.onerror = () => setError("Failed to read CSV file");
      reader.readAsText(file);
    } else {
      setError("Please upload a valid CSV file");
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Markdown Table Generator
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Table Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Table Title (Optional)
          </label>
          <input
            type="text"
            value={tableTitle}
            onChange={(e) => setTableTitle(e.target.value)}
            placeholder="Enter table title"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Column Headers */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Columns ({columns.length}/{MAX_COLS})
            </label>
            <button
              onClick={addColumn}
              disabled={columns.length >= MAX_COLS}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              <FaPlus /> Add Column
            </button>
          </div>
          <div className="space-y-2">
            {columns.map((col, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={col.name}
                  onChange={(e) => updateColumn(index, "name", e.target.value)}
                  placeholder="Column Name"
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={col.align}
                  onChange={(e) => updateColumn(index, "align", e.target.value)}
                  className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {ALIGN_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeColumn(index)}
                  disabled={columns.length <= 1}
                  className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Table Data */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Rows ({rows.length}/{MAX_ROWS})
            </label>
            <button
              onClick={addRow}
              disabled={rows.length >= MAX_ROWS}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              <FaPlus /> Add Row
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {columns.map((col, idx) => (
                    <th
                      key={idx}
                      className={`p-2 border border-gray-300 bg-gray-50 text-${col.align}`}
                    >
                      {col.name}
                    </th>
                  ))}
                  <th className="p-2 border border-gray-300 bg-gray-50 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {row.map((cell, colIdx) => (
                      <td key={colIdx} className="p-1 border border-gray-300">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                          className={`w-full p-1 border-none focus:ring-1 focus:ring-blue-500 text-${columns[colIdx].align}`}
                        />
                      </td>
                    ))}
                    <td className="p-1 border border-gray-300">
                      <button
                        onClick={() => removeRow(rowIdx)}
                        disabled={rows.length <= 1}
                        className="w-full p-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Import CSV */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Import CSV
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={importCSV}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload a CSV file to populate the table
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={copyToClipboard}
            className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
              isCopied
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-600 text-white hover:bg-gray-700"
            }`}
          >
            <FaCopy className="mr-2" /> {isCopied ? "Copied!" : "Copy to Clipboard"}
          </button>
          <button
            onClick={downloadMarkdown}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download as Markdown
          </button>
          <button
            onClick={clearTable}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Clear Table
          </button>
        </div>

        {/* Preview */}
        {columns.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-700">Markdown Preview</h2>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showPreview ? "Hide" : "Show"} Preview
              </button>
            </div>
            {showPreview && (
              <div
                ref={previewRef}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-auto"
              >
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {generateMarkdown()}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable column names and alignment</li>
            <li>Dynamic row and column addition/removal</li>
            <li>Table title support</li>
            <li>CSV import functionality</li>
            <li>Copy to clipboard and download as Markdown</li>
            <li>Real-time preview with toggle</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MarkdownTableGenerator;