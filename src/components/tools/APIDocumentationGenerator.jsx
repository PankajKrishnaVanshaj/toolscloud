"use client";

import React, { useState, useCallback, useRef } from 'react';
import { FaPlus, FaTrash, FaCopy, FaDownload, FaSync } from 'react-icons/fa';

const APIDocumentationGenerator = () => {
  const [endpoints, setEndpoints] = useState([
    { path: '', method: 'GET', description: '', parameters: [], responses: [], headers: [] }
  ]);
  const [format, setFormat] = useState('markdown');
  const [generatedDocs, setGeneratedDocs] = useState('');
  const [copied, setCopied] = useState(false);
  const [title, setTitle] = useState('API Documentation');
  const [baseUrl, setBaseUrl] = useState('');
  const docsRef = useRef(null);

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const formats = ['markdown', 'html', 'json'];

  const addEndpoint = () => {
    setEndpoints([...endpoints, { path: '', method: 'GET', description: '', parameters: [], responses: [], headers: [] }]);
  };

  const removeEndpoint = (index) => {
    setEndpoints(endpoints.filter((_, i) => i !== index));
  };

  const updateEndpoint = (index, field, value) => {
    const newEndpoints = [...endpoints];
    newEndpoints[index][field] = value;
    setEndpoints(newEndpoints);
  };

  const addParameter = (index) => {
    const newEndpoints = [...endpoints];
    newEndpoints[index].parameters.push({ name: '', type: 'string', description: '', required: false, in: 'query' });
    setEndpoints(newEndpoints);
  };

  const updateParameter = (endpointIndex, paramIndex, field, value) => {
    const newEndpoints = [...endpoints];
    newEndpoints[endpointIndex].parameters[paramIndex][field] = value;
    setEndpoints(newEndpoints);
  };

  const addHeader = (index) => {
    const newEndpoints = [...endpoints];
    newEndpoints[index].headers.push({ name: '', description: '', required: false });
    setEndpoints(newEndpoints);
  };

  const updateHeader = (endpointIndex, headerIndex, field, value) => {
    const newEndpoints = [...endpoints];
    newEndpoints[endpointIndex].headers[headerIndex][field] = value;
    setEndpoints(newEndpoints);
  };

  const addResponse = (index) => {
    const newEndpoints = [...endpoints];
    newEndpoints[index].responses.push({ status: '', description: '', example: '', contentType: 'application/json' });
    setEndpoints(newEndpoints);
  };

  const updateResponse = (endpointIndex, respIndex, field, value) => {
    const newEndpoints = [...endpoints];
    newEndpoints[endpointIndex].responses[respIndex][field] = value;
    setEndpoints(newEndpoints);
  };

  const generateDocumentation = useCallback(() => {
    let docs = '';

    if (format === 'markdown') {
      docs = `# ${title}\n\n${baseUrl ? `Base URL: ${baseUrl}\n\n` : ''}`;
      docs += endpoints.map(endpoint => {
        let content = `## ${endpoint.method} ${baseUrl}${endpoint.path}\n\n${endpoint.description || 'No description provided'}\n\n`;
        
        if (endpoint.headers.length > 0) {
          content += '### Headers\n\n| Name | Required | Description |\n|------|----------|-------------|\n';
          content += endpoint.headers.map(header => 
            `| ${header.name} | ${header.required ? 'Yes' : 'No'} | ${header.description || ''} |`
          ).join('\n') + '\n\n';
        }

        if (endpoint.parameters.length > 0) {
          content += '### Parameters\n\n| Name | Type | In | Required | Description |\n|------|------|----|----------|-------------|\n';
          content += endpoint.parameters.map(param => 
            `| ${param.name} | ${param.type} | ${param.in} | ${param.required ? 'Yes' : 'No'} | ${param.description || ''} |`
          ).join('\n') + '\n\n';
        }

        if (endpoint.responses.length > 0) {
          content += '### Responses\n\n';
          content += endpoint.responses.map(resp => 
            `#### ${resp.status} (${resp.contentType})\n${resp.description || 'No description'}\n` +
            (resp.example ? "```json\n" + resp.example + "\n```\n" : '')
          ).join('\n');
        }

        return content;
      }).join('\n');
    } else if (format === 'html') {
      docs = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1 { color: #2c3e50; }
    h2 { color: #34495e; margin-top: 2rem; }
    h3 { color: #4a6a8a; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f5f5f5; }
    pre { background: #f8f9fa; padding: 1rem; border-radius: 4px; overflow-x: auto; }
    hr { margin: 2rem 0; border: 0; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${baseUrl ? `<p><strong>Base URL:</strong> ${baseUrl}</p>` : ''}
${endpoints.map(endpoint => `
  <h2>${endpoint.method} ${baseUrl}${endpoint.path}</h2>
  <p>${endpoint.description || 'No description provided'}</p>
  ${endpoint.headers.length > 0 ? `
    <h3>Headers</h3>
    <table>
      <tr><th>Name</th><th>Required</th><th>Description</th></tr>
      ${endpoint.headers.map(header => `
        <tr>
          <td>${header.name}</td>
          <td>${header.required ? 'Yes' : 'No'}</td>
          <td>${header.description || ''}</td>
        </tr>
      `).join('')}
    </table>
  ` : ''}
  ${endpoint.parameters.length > 0 ? `
    <h3>Parameters</h3>
    <table>
      <tr><th>Name</th><th>Type</th><th>In</th><th>Required</th><th>Description</th></tr>
      ${endpoint.parameters.map(param => `
        <tr>
          <td>${param.name}</td>
          <td>${param.type}</td>
          <td>${param.in}</td>
          <td>${param.required ? 'Yes' : 'No'}</td>
          <td>${param.description || ''}</td>
        </tr>
      `).join('')}
    </table>
  ` : ''}
  ${endpoint.responses.length > 0 ? `
    <h3>Responses</h3>
    ${endpoint.responses.map(resp => `
      <div>
        <h4>${resp.status} (${resp.contentType})</h4>
        <p>${resp.description || 'No description'}</p>
        ${resp.example ? `<pre>${resp.example}</pre>` : ''}
      </div>
    `).join('')}
  ` : ''}
`).join('<hr>')}
</body>
</html>
      `;
    } else if (format === 'json') {
      docs = JSON.stringify({ title, baseUrl, endpoints }, null, 2);
    }

    setGeneratedDocs(docs.trim());
    setCopied(false);
  }, [endpoints, format, title, baseUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDocs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedDocs], { type: format === 'html' ? 'text/html' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setEndpoints([{ path: '', method: 'GET', description: '', parameters: [], responses: [], headers: [] }]);
    setGeneratedDocs('');
    setTitle('API Documentation');
    setBaseUrl('');
    setFormat('markdown');
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">API Documentation Generator</h1>

        {/* General Settings */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Documentation Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="API Documentation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://api.example.com"
              />
            </div>
          </div>
        </div>

        {/* Endpoints */}
        {endpoints.map((endpoint, index) => (
          <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg relative">
            <button
              onClick={() => removeEndpoint(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              aria-label="Remove endpoint"
            >
              <FaTrash />
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
              <select
                value={endpoint.method}
                onChange={(e) => updateEndpoint(index, 'method', e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {methods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input
                type="text"
                value={endpoint.path}
                onChange={(e) => updateEndpoint(index, 'path', e.target.value)}
                placeholder="/api/resource"
                className="sm:col-span-3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <textarea
              value={endpoint.description}
              onChange={(e) => updateEndpoint(index, 'description', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="Endpoint description"
            />

            {/* Headers */}
            <div className="mb-4">
              <button
                onClick={() => addHeader(index)}
                className="text-sm text-blue-600 hover:underline mb-2 flex items-center"
              >
                <FaPlus className="mr-1" /> Add Header
              </button>
              {endpoint.headers.map((header, hIndex) => (
                <div key={hIndex} className="flex gap-2 mb-2 items-center">
                  <input
                    type="text"
                    value={header.name}
                    onChange={(e) => updateHeader(index, hIndex, 'name', e.target.value)}
                    placeholder="Authorization"
                    className="w-1/3 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="checkbox"
                    checked={header.required}
                    onChange={(e) => updateHeader(index, hIndex, 'required', e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={header.description}
                    onChange={(e) => updateHeader(index, hIndex, 'description', e.target.value)}
                    placeholder="Bearer token"
                    className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* Parameters */}
            <div className="mb-4">
              <button
                onClick={() => addParameter(index)}
                className="text-sm text-blue-600 hover:underline mb-2 flex items-center"
              >
                <FaPlus className="mr-1" /> Add Parameter
              </button>
              {endpoint.parameters.map((param, pIndex) => (
                <div key={pIndex} className="flex gap-2 mb-2 items-center">
                  <input
                    type="text"
                    value={param.name}
                    onChange={(e) => updateParameter(index, pIndex, 'name', e.target.value)}
                    placeholder="id"
                    className="w-1/4 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={param.type}
                    onChange={(e) => updateParameter(index, pIndex, 'type', e.target.value)}
                    className="w-1/5 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="string">string</option>
                    <option value="number">number</option>
                    <option value="boolean">boolean</option>
                    <option value="object">object</option>
                  </select>
                  <select
                    value={param.in}
                    onChange={(e) => updateParameter(index, pIndex, 'in', e.target.value)}
                    className="w-1/5 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="query">Query</option>
                    <option value="path">Path</option>
                    <option value="body">Body</option>
                  </select>
                  <input
                    type="checkbox"
                    checked={param.required}
                    onChange={(e) => updateParameter(index, pIndex, 'required', e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={param.description}
                    onChange={(e) => updateParameter(index, pIndex, 'description', e.target.value)}
                    placeholder="Resource ID"
                    className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* Responses */}
            <div>
              <button
                onClick={() => addResponse(index)}
                className="text-sm text-blue-600 hover:underline mb-2 flex items-center"
              >
                <FaPlus className="mr-1" /> Add Response
              </button>
              {endpoint.responses.map((resp, rIndex) => (
                <div key={rIndex} className="space-y-2 mb-4">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={resp.status}
                      onChange={(e) => updateResponse(index, rIndex, 'status', e.target.value)}
                      placeholder="200"
                      className="w-20 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={resp.contentType}
                      onChange={(e) => updateResponse(index, rIndex, 'contentType', e.target.value)}
                      className="w-1/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="application/json">application/json</option>
                      <option value="text/plain">text/plain</option>
                      <option value="application/xml">application/xml</option>
                    </select>
                    <input
                      type="text"
                      value={resp.description}
                      onChange={(e) => updateResponse(index, rIndex, 'description', e.target.value)}
                      placeholder="Success response"
                      className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <textarea
                    value={resp.example}
                    onChange={(e) => updateResponse(index, rIndex, 'example', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder='{"status": "success", "data": {...}}'
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={addEndpoint}
            className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center"
          >
            <FaPlus className="mr-2" /> Add Endpoint
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset All
          </button>
          <div className="flex-1 flex gap-2">
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-1/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {formats.map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
            </select>
            <button
              onClick={generateDocumentation}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Generate
            </button>
          </div>
        </div>

        {/* Generated Documentation */}
        {generatedDocs && (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
              <h2 className="text-lg font-semibold text-gray-700">
                Generated {format.toUpperCase()} Documentation
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className={`py-2 px-4 rounded-md transition-colors flex items-center ${
                    copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <FaCopy className="mr-2" /> {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <pre
              ref={docsRef}
              className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap max-h-96 overflow-auto border border-gray-200"
            >
              {generatedDocs}
            </pre>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple endpoints with custom paths and methods</li>
            <li>Support for headers, parameters (query/path/body), and responses</li>
            <li>Output in Markdown, HTML, or JSON formats</li>
            <li>Customizable title and base URL</li>
            <li>Copy and download functionality</li>
            <li>Responsive design with endpoint removal</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default APIDocumentationGenerator;