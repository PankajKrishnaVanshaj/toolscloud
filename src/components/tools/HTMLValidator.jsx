"use client";
import React, { useState, useRef, useEffect } from "react";

const HTMLValidator = () => {
  const [htmlInput, setHtmlInput] = useState("");
  const [validationResult, setValidationResult] = useState("");
  const [loading, setLoading] = useState(false);
  const validationCount = useRef(0);
  const [lastValidation, setLastValidation] = useState(null);

  // Enhanced HTML validation for tag mismatches
  const validateHTML = (html) => {
    setLoading(true);
    try {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const results = [];

      // Check for parsing errors
      if (doc.documentElement.nodeName === "parsererror") {
        results.push(`HTML is invalid: ${doc.documentElement.textContent}`);
      }

      // Check for essential tags
      ['html', 'head', 'body'].forEach(tag => {
        if (!doc.querySelector(tag)) {
          results.push(`Missing essential tag: <${tag}>`);
        }
      });

      // Enhanced tag matching logic
      const stack = [];
      const regex = /<([a-z1-6]+)(?![^>]*\/>)|<\/([a-z1-6]+)>/gi;

      let match;
      while ((match = regex.exec(html))) {
        if (match[1]) { // Opening tag
          stack.push(match[1]);
        } else if (match[2]) { // Closing tag
          if (stack.length === 0 || stack.pop() !== match[2]) {
            results.push(`Mismatched or unclosed tag: </${match[2]}>`);
          }
        }
      }

      // Remaining unclosed tags in stack
      if (stack.length > 0) {
        results.push(`Unclosed tags: ${stack.join(', ')}`);
      }

      // Check for duplicate IDs
      const ids = doc.querySelectorAll('[id]');
      const duplicateIds = Array.from(ids).reduce((acc, el) => {
        acc[el.id] = (acc[el.id] || 0) + 1;
        return acc;
      }, {});
      const duplicates = Object.keys(duplicateIds).filter(id => duplicateIds[id] > 1);
      if (duplicates.length > 0) {
        results.push(`Duplicate IDs found: ${duplicates.join(', ')}`);
      }

      setLoading(false);
      setLastValidation(new Date());
      return results.length === 0 ? "HTML is valid!" : results.map((msg, index) => (
        <p key={index} className="text-red-700">{msg}</p>
      ));
    } catch (e) {
      setLoading(false);
      console.error(e);
      return "An error occurred during validation.";
    }
  };

  const handleValidate = async () => {
    if (validationCount.current === 0) {
      const result = validateHTML(htmlInput);
      setValidationResult(result);
      validationCount.current += 1;
    }
  };

  useEffect(() => {
    // Reset validation count if component re-renders due to route change or similar
    return () => { validationCount.current = 0; };
  }, []);

  return (
    <div className="mx-auto p-4  rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">HTML Validator</h1>
      
      <textarea 
        value={htmlInput}
        onChange={(e) => setHtmlInput(e.target.value)}
        className="w-full h-48 p-2 border rounded mb-4 resize-none focus:ring focus:border-blue-400"
        placeholder="Enter HTML here..."
      />

      <button 
        onClick={handleValidate}
        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded transition duration-300"
        disabled={validationCount.current > 0 || loading}
      >
        {loading ? 'Validating...' : validationCount.current > 0 ? 'Validation Done' : 'Validate HTML'}
      </button>

      {validationResult && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-300 shadow-sm">
          {typeof validationResult === "string" ? (
            <p className={validationResult === "HTML is valid!" ? "text-green-700" : "text-red-700"}>
              {validationResult}
            </p>
          ) : (
            validationResult
          )}
          {lastValidation && (
            <p className="text-gray-500 text-sm mt-2">
              Last validated: {lastValidation.toLocaleTimeString()} on {lastValidation.toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default HTMLValidator;