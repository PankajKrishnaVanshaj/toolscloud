"use client";

import React, { useState } from 'react';

const XMLValidator = () => {
  const [xmlInput, setXmlInput] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState(null);

  const validateXML = (xml) => {
    setError(null);
    setValidationResult(null);

    if (!xml.trim()) {
      setError('Please enter some XML content');
      return;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'application/xml');
      
      // Check for parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        const errorText = parserError.textContent || 'Unknown parsing error';
        throw new Error(errorText);
      }

      // Basic structure analysis
      const rootElement = doc.documentElement;
      const analysis = {
        isValid: true,
        rootElement: rootElement.tagName,
        elementCount: doc.getElementsByTagName('*').length,
        attributesCount: Array.from(doc.getElementsByTagName('*')).reduce(
          (count, el) => count + el.attributes.length,
          0
        ),
        issues: []
      };

      // Additional checks (e.g., empty tags, malformed content)
      const elements = doc.getElementsByTagName('*');
      Array.from(elements).forEach((el, index) => {
        if (!el.textContent.trim() && !el.hasChildElements() && !el.attributes.length) {
          analysis.issues.push({
            message: `Empty element found: <${el.tagName}>`,
            line: index + 1 // Approximate line number
          });
        }
      });

      setValidationResult(analysis);
    } catch (err) {
      setValidationResult({
        isValid: false,
        issues: [{ message: err.message, line: 'N/A' }]
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validateXML(xmlInput);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">XML Validator</h2>

        {/* XML Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              XML Content
            </label>
            <textarea
              value={xmlInput}
              onChange={(e) => setXmlInput(e.target.value)}
              className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`<?xml version="1.0" encoding="UTF-8"?>
<root>
  <item id="1">Hello</item>
  <item id="2">World</item>
</root>`}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Validate XML
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Validation Result */}
        {validationResult && (
          <div className="mt-6 space-y-4">
            <div className={`p-4 rounded-md ${validationResult.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className="font-semibold text-gray-700">Validation Status</h3>
              <p className={`text-lg ${validationResult.isValid ? 'text-green-700' : 'text-red-700'}`}>
                {validationResult.isValid ? 'Valid XML' : 'Invalid XML'}
              </p>
            </div>

            {validationResult.isValid && (
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700 mb-2">Analysis</h3>
                <ul className="text-sm text-gray-600 list-disc pl-5">
                  <li>Root Element: <span className="font-mono">{validationResult.rootElement}</span></li>
                  <li>Total Elements: {validationResult.elementCount}</li>
                  <li>Total Attributes: {validationResult.attributesCount}</li>
                </ul>
              </div>
            )}

            {validationResult.issues.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700 mb-2">Issues Found</h3>
                <ul className="text-sm text-gray-600 list-disc pl-5">
                  {validationResult.issues.map((issue, index) => (
                    <li key={index}>
                      {issue.message} {issue.line !== 'N/A' ? `(Line ~${issue.line})` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600">
                - Validates XML syntax (well-formedness) only, not against a schema (DTD/XSD).
              </p>
              <p className="text-sm text-gray-600">
                - Line numbers are approximate based on element order.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default XMLValidator;