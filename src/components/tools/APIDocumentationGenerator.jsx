"use client";

import React, { useState } from 'react';

const APIDocumentationGenerator = () => {
  const [endpoints, setEndpoints] = useState([
    { path: '', method: 'GET', description: '', parameters: [], responses: [] }
  ]);
  const [format, setFormat] = useState('markdown');
  const [generatedDocs, setGeneratedDocs] = useState('');
  const [copied, setCopied] = useState(false);

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const formats = ['markdown', 'html'];

  const addEndpoint = () => {
    setEndpoints([...endpoints, { path: '', method: 'GET', description: '', parameters: [], responses: [] }]);
  };

  const updateEndpoint = (index, field, value) => {
    const newEndpoints = [...endpoints];
    newEndpoints[index][field] = value;
    setEndpoints(newEndpoints);
  };

  const addParameter = (index) => {
    const newEndpoints = [...endpoints];
    newEndpoints[index].parameters.push({ name: '', type: 'string', description: '', required: false });
    setEndpoints(newEndpoints);
  };

  const updateParameter = (endpointIndex, paramIndex, field, value) => {
    const newEndpoints = [...endpoints];
    newEndpoints[endpointIndex].parameters[paramIndex][field] = value;
    setEndpoints(newEndpoints);
  };

  const addResponse = (index) => {
    const newEndpoints = [...endpoints];
    newEndpoints[index].responses.push({ status: '', description: '', example: '' });
    setEndpoints(newEndpoints);
  };

  const updateResponse = (endpointIndex, respIndex, field, value) => {
    const newEndpoints = [...endpoints];
    newEndpoints[endpointIndex].responses[respIndex][field] = value;
    setEndpoints(newEndpoints);
  };

  const generateDocumentation = () => {
    let docs = '';
    
    if (format === 'markdown') {
      docs = endpoints.map(endpoint => {
        let content = `## ${endpoint.method} ${endpoint.path}\n\n${endpoint.description || 'No description provided'}\n\n`;
        
        if (endpoint.parameters.length > 0) {
          content += '### Parameters\n\n| Name | Type | Required | Description |\n|------|------|----------|-------------|\n';
          content += endpoint.parameters.map(param => 
            `| ${param.name} | ${param.type} | ${param.required ? 'Yes' : 'No'} | ${param.description || ''} |`
          ).join('\n') + '\n\n';
        }

        if (endpoint.responses.length > 0) {
          content += '### Responses\n\n';
          content += endpoint.responses.map(resp => 
            `#### ${resp.status}\n${resp.description || 'No description'}\n` +
            (resp.example ? "```json\n" + resp.example + "\n```\n" : '')
          ).join('\n');
        }

        return content;
      }).join('\n');
    } else if (format === 'html') {
      docs = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h2 { color: #2c3e50; }
    h3 { color: #34495e; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    pre { background: #f8f8f8; padding: 10px; border-radius: 4px; }
  </style>
</head>
<body>
${endpoints.map(endpoint => `
  <h2>${endpoint.method} ${endpoint.path}</h2>
  <p>${endpoint.description || 'No description provided'}</p>
  ${endpoint.parameters.length > 0 ? `
    <h3>Parameters</h3>
    <table>
      <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
      ${endpoint.parameters.map(param => `
        <tr>
          <td>${param.name}</td>
          <td>${param.type}</td>
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
        <h4>${resp.status}</h4>
        <p>${resp.description || 'No description'}</p>
        ${resp.example ? `<pre>${resp.example}</pre>` : ''}
      </div>
    `).join('')}
  ` : ''}
`).join('<hr>')}
</body>
</html>
      `;
    }

    setGeneratedDocs(docs.trim());
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDocs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">API Documentation Generator</h2>

        {/* Endpoint Inputs */}
        {endpoints.map((endpoint, index) => (
          <div key={index} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-md">
            <div className="flex gap-4">
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
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <textarea
              value={endpoint.description}
              onChange={(e) => updateEndpoint(index, 'description', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Endpoint description"
            />

            {/* Parameters */}
            <div>
              <button
                onClick={() => addParameter(index)}
                className="text-sm text-blue-600 hover:underline mb-2"
              >
                + Add Parameter
              </button>
              {endpoint.parameters.map((param, pIndex) => (
                <div key={pIndex} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={param.name}
                    onChange={(e) => updateParameter(index, pIndex, 'name', e.target.value)}
                    placeholder="name"
                    className="w-1/4 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={param.type}
                    onChange={(e) => updateParameter(index, pIndex, 'type', e.target.value)}
                    className="w-1/4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="string">string</option>
                    <option value="number">number</option>
                    <option value="boolean">boolean</option>
                    <option value="object">object</option>
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
                    placeholder="description"
                    className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* Responses */}
            <div>
              <button
                onClick={() => addResponse(index)}
                className="text-sm text-blue-600 hover:underline mb-2"
              >
                + Add Response
              </button>
              {endpoint.responses.map((resp, rIndex) => (
                <div key={rIndex} className="space-y-2 mb-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={resp.status}
                      onChange={(e) => updateResponse(index, rIndex, 'status', e.target.value)}
                      placeholder="200"
                      className="w-20 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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

        <button
          onClick={addEndpoint}
          className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors mb-4"
        >
          Add Another Endpoint
        </button>

        <div className="flex gap-4 items-center mb-4">
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {formats.map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
          </select>
          <button
            onClick={generateDocumentation}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Documentation
          </button>
        </div>

        {/* Generated Documentation */}
        {generatedDocs && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-700">
                Generated {format.toUpperCase()} Documentation
              </h3>
              <button
                onClick={handleCopy}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap">
              {generatedDocs}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default APIDocumentationGenerator;