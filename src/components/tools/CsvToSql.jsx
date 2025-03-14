"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaDownload, FaCopy, FaSync, FaUpload } from "react-icons/fa";

const CsvToSql = () => {
  const [csvInput, setCsvInput] = useState("");
  const [sqlOutput, setSqlOutput] = useState("");
  const [tableName, setTableName] = useState("my_table");
  const [dialect, setDialect] = useState("mysql");
  const [inferTypes, setInferTypes] = useState(true);
  const [delimiter, setDelimiter] = useState(",");
  const [includeCreateTable, setIncludeCreateTable] = useState(true);
  const [batchSize, setBatchSize] = useState(100); // For batch INSERT statements
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Parse CSV with custom delimiter
  const parseCSV = useCallback(
    (csv) => {
      const lines = csv.trim().split("\n");
      const headers = lines[0].split(delimiter).map((h) => h.trim());
      const rows = lines
        .slice(1)
        .map((line) => line.split(delimiter).map((v) => v.trim()));
      return { headers, rows };
    },
    [delimiter]
  );

  // Enhanced data type inference
  const inferDataType = (value) => {
    if (!inferTypes) return dialect === "sqlite" ? "TEXT" : "VARCHAR(255)";
    if (/^\d+$/.test(value)) return "INTEGER";
    if (/^\d*\.\d+$/.test(value)) return "FLOAT";
    if (/^(true|false)$/i.test(value)) return "BOOLEAN";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return "DATE";
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) return "DATETIME";
    return dialect === "sqlite" ? "TEXT" : "VARCHAR(255)";
  };

  // Generate SQL with batch support
  const generateSQL = useCallback(() => {
    setError("");
    setSqlOutput("");

    if (!csvInput.trim()) {
      setError("Please enter CSV data");
      return;
    }

    try {
      const { headers, rows } = parseCSV(csvInput);
      if (rows.length === 0) {
        setError("No data rows found in CSV");
        return;
      }

      const columnTypes = headers.map((_, index) =>
        inferDataType(rows[0][index] || "")
      );
      let sql = "";

      // CREATE TABLE statement
      if (includeCreateTable) {
        if (dialect === "mysql" || dialect === "postgresql") {
          sql += `DROP TABLE IF EXISTS ${tableName};\n`;
          sql += `CREATE TABLE ${tableName} (\n`;
          sql += headers
            .map((header, i) => `  "${header}" ${columnTypes[i]}`)
            .join(",\n");
          sql += "\n);\n\n";
        } else if (dialect === "sqlite") {
          sql += `DROP TABLE IF EXISTS ${tableName};\n`;
          sql += `CREATE TABLE ${tableName} (\n`;
          sql += headers
            .map((header, i) => `  "${header}" ${columnTypes[i]}`)
            .join(",\n");
          sql += "\n);\n\n";
        }
      }

      // Batch INSERT statements
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        sql += `INSERT INTO ${tableName} ("${headers.join('","')}") VALUES\n`;
        sql += batch
          .map((row) => {
            const values = row.map((value, j) => {
              const type = columnTypes[j];
              if (value === "" || value === null) return "NULL";
              if (type === "INTEGER" || type === "FLOAT") return value;
              if (type === "BOOLEAN")
                return value.toLowerCase() === "true" ? "TRUE" : "FALSE";
              return `'${value.replace(/'/g, "''")}'`;
            });
            return `  (${values.join(", ")})`;
          })
          .join(",\n");
        sql += ";\n\n";
      }

      setSqlOutput(sql.trim());
    } catch (err) {
      setError(`Error parsing CSV: ${err.message}`);
    }
  }, [csvInput, tableName, dialect, inferTypes, delimiter, includeCreateTable, batchSize]);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => setCsvInput(event.target.result);
    reader.onerror = () => setError("Error reading file");
    reader.readAsText(file);
  };

  // Copy to clipboard
  const copyToClipboard = () => navigator.clipboard.writeText(sqlOutput);

  // Download SQL as file
  const downloadSQL = () => {
    const blob = new Blob([sqlOutput], { type: "text/sql" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${tableName}_${dialect}.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Reset form
  const reset = () => {
    setCsvInput("");
    setSqlOutput("");
    setTableName("my_table");
    setDialect("mysql");
    setInferTypes(true);
    setDelimiter(",");
    setIncludeCreateTable(true);
    setBatchSize(100);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          CSV to SQL Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CSV Input
              </label>
              <textarea
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder={`name,age,city\nJohn,25,New York\nJane,30,London`}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 font-mono text-sm resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Table Name
                </label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SQL Dialect
                </label>
                <select
                  value={dialect}
                  onChange={(e) => setDialect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mysql">MySQL</option>
                  <option value="postgresql">PostgreSQL</option>
                  <option value="sqlite">SQLite</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delimiter
                </label>
                <input
                  type="text"
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value.slice(0, 1))}
                  maxLength={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                  placeholder=","
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Size
                </label>
                <input
                  type="number"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={inferTypes}
                  onChange={(e) => setInferTypes(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Infer Data Types</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeCreateTable}
                  onChange={(e) => setIncludeCreateTable(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Include CREATE TABLE</span>
              </label>
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={generateSQL}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaUpload className="mr-2" /> Convert to SQL
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Output Section */}
          {sqlOutput && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-2 gap-2">
                <h2 className="text-lg font-semibold text-gray-700">SQL Output</h2>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="py-1 px-3 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center text-sm"
                  >
                    <FaCopy className="mr-1" /> Copy
                  </button>
                  <button
                    onClick={downloadSQL}
                    className="py-1 px-3 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm"
                  >
                    <FaDownload className="mr-1" /> Download
                  </button>
                </div>
              </div>
              <pre className="text-sm font-mono bg-white p-4 rounded-lg overflow-auto max-h-96 border border-gray-200">
                {sqlOutput}
              </pre>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Supports MySQL, PostgreSQL, and SQLite dialects</li>
              <li>Custom delimiter support (e.g., comma, tab, semicolon)</li>
              <li>Advanced data type inference (INTEGER, FLOAT, BOOLEAN, DATE, DATETIME, TEXT/VARCHAR)</li>
              <li>Batch INSERT statements with configurable size</li>
              <li>Optional CREATE TABLE with DROP TABLE IF EXISTS</li>
              <li>File upload and text input options</li>
              <li>Copy to clipboard and download as .sql file</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CsvToSql;