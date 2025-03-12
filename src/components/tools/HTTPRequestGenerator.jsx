"use client";

import React, { useState, useCallback, useEffect } from "react";
import { FaCopy, FaDownload, FaSync, FaPlay } from "react-icons/fa";

const HTTPRequestGenerator = () => {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState([{ key: "", value: "" }]);
  const [queryParams, setQueryParams] = useState([{ key: "", value: "" }]);
  const [body, setBody] = useState("");
  const [format, setFormat] = useState("fetch");
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];
  const formats = ["fetch", "axios", "curl", "python-requests"];

  const addHeader = () => setHeaders([...headers, { key: "", value: "" }]);
  const updateHeader = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };
  const removeHeader = (index) => headers.length > 1 && setHeaders(headers.filter((_, i) => i !== index));

  const addQueryParam = () => setQueryParams([...queryParams, { key: "", value: "" }]);
  const updateQueryParam = (index, field, value) => {
    const newParams = [...queryParams];
    newParams[index][field] = value;
    setQueryParams(newParams);
  };
  const removeQueryParam = (index) => queryParams.length > 1 && setQueryParams(queryParams.filter((_, i) => i !== index));

  const generateRequest = useCallback(() => {
    if (!url.trim()) {
      setGeneratedCode("Please enter a URL");
      setCopied(false);
      return;
    }

    const params = queryParams.filter(p => p.key.trim() && p.value.trim()).map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join("&");
    const fullUrl = params ? `${url}?${params}` : url;
    const headersObj = headers.filter(h => h.key.trim() && h.value.trim()).reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {});

    let code = "";
    switch (format) {
      case "fetch":
        code = `fetch("${fullUrl}", {\n  method: "${method}",\n`;
        if (Object.keys(headersObj).length) code += `  headers: ${JSON.stringify(headersObj, null, 2).replace(/\n/g, "\n  ")},\n`;
        if (method !== "GET" && body.trim()) code += `  body: \`${body}\`,\n`;
        code += `})\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error("Error:", err));`;
        break;

      case "axios":
        code = `import axios from "axios";\n\naxios({\n  method: "${method.toLowerCase()}",\n  url: "${fullUrl}",\n`;
        if (Object.keys(headersObj).length) code += `  headers: ${JSON.stringify(headersObj, null, 2).replace(/\n/g, "\n  ")},\n`;
        if (method !== "GET" && body.trim()) code += `  data: ${JSON.stringify(body, null, 2).replace(/\n/g, "\n  ")},\n`;
        code += `})\n  .then(res => console.log(res.data))\n  .catch(err => console.error("Error:", err));`;
        break;

      case "curl":
        code = `curl -X ${method} "${fullUrl}"`;
        headers.forEach(h => h.key.trim() && h.value.trim() && (code += ` \\\n  -H "${h.key}: ${h.value}"`));
        if (method !== "GET" && body.trim()) code += ` \\\n  -d '${body.replace(/'/g, "'\\''")}'`;
        break;

      case "python-requests":
        code = `import requests\n\nresponse = requests.${method.toLowerCase()}("${fullUrl}",\n`;
        if (Object.keys(headersObj).length) code += `  headers=${JSON.stringify(headersObj, null, 2).replace(/\n/g, "\n  ")},\n`;
        if (method !== "GET" && body.trim()) code += `  json=${JSON.stringify(JSON.parse(body || "{}"), null, 2).replace(/\n/g, "\n  ")},\n`;
        code += `)\nprint(response.json())`;
        break;

      default:
        code = "";
    }
    setGeneratedCode(code);
    setHistory(prev => [...prev, { method, url: fullUrl, format, code }].slice(-5));
  }, [method, url, headers, queryParams, body, format]);

  const handleTestRequest = async () => {
    setLoading(true);
    setResponse(null);
    const headersObj = headers.filter(h => h.key.trim() && h.value.trim()).reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {});
    const params = queryParams.filter(p => p.key.trim() && p.value.trim()).reduce((acc, p) => ({ ...acc, [p.key]: p.value }), {});
    
    try {
      const res = await fetch(url, {
        method,
        headers: headersObj,
        body: method !== "GET" && body.trim() ? body : undefined,
        ...(Object.keys(params).length && { searchParams: new URLSearchParams(params) }),
      });
      const data = await res.json();
      setResponse({ status: res.status, data: JSON.stringify(data, null, 2) });
    } catch (error) {
      setResponse({ status: "Error", data: error.message });
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (generatedCode && generatedCode !== "Please enter a URL") {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `request-${format}-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => generateRequest(), [generateRequest]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">HTTP Request Generator</h2>

        {/* Request Form */}
        <form onSubmit={(e) => { e.preventDefault(); generateRequest(); }} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                {methods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="https://api.example.com" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Query Parameters</label>
              {queryParams.map((param, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input value={param.key} onChange={(e) => updateQueryParam(index, "key", e.target.value)} className="w-1/2 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500" placeholder="Key" />
                  <input value={param.value} onChange={(e) => updateQueryParam(index, "value", e.target.value)} className="w-1/2 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500" placeholder="Value" />
                  {queryParams.length > 1 && <button type="button" onClick={() => removeQueryParam(index)} className="text-red-600 hover:text-red-800">✕</button>}
                </div>
              ))}
              <button type="button" onClick={addQueryParam} className="text-sm text-blue-600 hover:underline">+ Add Parameter</button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Headers</label>
              {headers.map((header, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input value={header.key} onChange={(e) => updateHeader(index, "key", e.target.value)} className="w-1/2 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500" placeholder="Key" />
                  <input value={header.value} onChange={(e) => updateHeader(index, "value", e.target.value)} className="w-1/2 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500" placeholder="Value" />
                  {headers.length > 1 && <button type="button" onClick={() => removeHeader(index)} className="text-red-600 hover:text-red-800">✕</button>}
                </div>
              ))}
              <button type="button" onClick={addHeader} className="text-sm text-blue-600 hover:underline">+ Add Header</button>
            </div>
          </div>

          {method !== "GET" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Request Body</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500" placeholder='{"key": "value"}' />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                {formats.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <button type="submit" className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Generate</button>
            <button type="button" onClick={handleTestRequest} disabled={loading || !url.trim()} className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center">
              {loading ? <span className="animate-spin mr-2">⏳</span> : <FaPlay className="mr-2" />}
              Test
            </button>
          </div>
        </form>

        {/* Generated Code */}
        {generatedCode && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-700">Generated {format} Request</h3>
              <div className="flex gap-2">
                <button onClick={handleCopy} className={`py-1 px-3 rounded text-sm transition-colors ${copied ? "bg-green-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`} disabled={generatedCode === "Please enter a URL"}>
                  <FaCopy className="inline mr-1" /> {copied ? "Copied!" : "Copy"}
                </button>
                <button onClick={handleDownload} className="py-1 px-3 bg-gray-200 rounded text-sm hover:bg-gray-300 transition-colors" disabled={generatedCode === "Please enter a URL"}>
                  <FaDownload className="inline mr-1" /> Download
                </button>
              </div>
            </div>
            <pre className="p-4 bg-white rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap break-all border border-gray-200">{generatedCode}</pre>
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Test Response</h3>
            <pre className="p-4 bg-white rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap break-all border border-gray-200">
              Status: {response.status}
              {"\n\n"}
              {response.data}
            </pre>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Request History (Last 5)</h3>
            <ul className="space-y-2">
              {history.slice().reverse().map((item, index) => (
                <li key={index} className="flex justify-between items-center text-sm text-gray-600">
                  <span>{item.method} {item.url.slice(0, 50)}{item.url.length > 50 ? "..." : ""} ({item.format})</span>
                  <button onClick={() => { setMethod(item.method); setUrl(item.url); setFormat(item.format); setGeneratedCode(item.code); }} className="text-blue-600 hover:underline">Restore</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Support for multiple HTTP methods</li>
            <li>Dynamic query parameters and headers</li>
            <li>Multiple output formats (fetch, axios, curl, python-requests)</li>
            <li>Test requests live with response preview</li>
            <li>Copy and download generated code</li>
            <li>Request history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HTTPRequestGenerator;