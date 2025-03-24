"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaHistory, FaUndo, FaPlus } from "react-icons/fa";

const HTMLTagGenerator = () => {
  const [tagName, setTagName] = useState("div");
  const [attributes, setAttributes] = useState([{ name: "", value: "" }]);
  const [content, setContent] = useState("");
  const [generatedTag, setGeneratedTag] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [nestedTags, setNestedTags] = useState(false);
  const [nestedContent, setNestedContent] = useState("");

  const commonTags = [
    "div", "span", "p", "a", "button", "input", "img", "h1", "h2", "h3", "ul", "li", "form", "label", "section",
  ];
  const commonAttributes = ["id", "class", "style", "href", "src", "type", "value", "placeholder", "alt", "title"];

  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  const addAttribute = () => {
    setAttributes([...attributes, { name: "", value: "" }]);
  };

  const removeAttribute = (index) => {
    if (attributes.length > 1) {
      setAttributes(attributes.filter((_, i) => i !== index));
    }
  };

  const generateTag = useCallback(() => {
    let tag = `<${tagName}`;

    // Add attributes
    const validAttributes = attributes.filter((attr) => attr.name.trim() && attr.value.trim());
    if (validAttributes.length > 0) {
      const attrString = validAttributes.map((attr) => `${attr.name}="${attr.value}"`).join(" ");
      tag += ` ${attrString}`;
    }

    // Handle self-closing tags and content
    const selfClosingTags = ["input", "img", "br", "hr"];
    if (selfClosingTags.includes(tagName)) {
      tag += " />";
    } else {
      const innerContent = nestedTags && nestedContent ? `${content}\n  ${nestedContent}` : content;
      tag += `>${innerContent}</${tagName}>`;
    }

    setGeneratedTag(tag);
    setHistory((prev) => [
      ...prev,
      { tagName, attributes: [...validAttributes], content, nestedContent, generatedTag: tag },
    ].slice(-5));
    setIsCopied(false);
  }, [tagName, attributes, content, nestedTags, nestedContent]);

  const copyToClipboard = () => {
    if (!generatedTag) return;
    navigator.clipboard
      .writeText(generatedTag)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const resetForm = () => {
    setTagName("div");
    setAttributes([{ name: "", value: "" }]);
    setContent("");
    setNestedContent("");
    setGeneratedTag("");
    setIsCopied(false);
    setNestedTags(false);
  };

  const restoreFromHistory = (entry) => {
    setTagName(entry.tagName);
    setAttributes(entry.attributes.length ? [...entry.attributes] : [{ name: "", value: "" }]);
    setContent(entry.content);
    setNestedContent(entry.nestedContent || "");
    setGeneratedTag(entry.generatedTag);
    setNestedTags(!!entry.nestedContent);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced HTML Tag Generator
        </h1>

        <div className="space-y-6">
          {/* Tag Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tag Name</label>
            <select
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {commonTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Attributes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Attributes</label>
            {attributes.map((attr, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2 mb-3">
                <select
                  value={attr.name}
                  onChange={(e) => handleAttributeChange(index, "name", e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Attribute</option>
                  {commonAttributes.map((attrName) => (
                    <option key={attrName} value={attrName}>
                      {attrName}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={attr.value}
                  onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                  placeholder="Value (e.g., main-div)"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {attributes.length > 1 && (
                  <button
                    onClick={() => removeAttribute(index)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addAttribute}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <FaPlus className="mr-1" /> Add Attribute
            </button>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content (for non-self-closing tags)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-y"
              placeholder="Enter tag content"
              disabled={["input", "img", "br", "hr"].includes(tagName)}
            />
          </div>

          {/* Nested Tags Option */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={nestedTags}
              onChange={() => setNestedTags(!nestedTags)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">Add Nested Tag</label>
          </div>
          {nestedTags && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nested Content</label>
              <textarea
                value={nestedContent}
                onChange={(e) => setNestedContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-y"
                placeholder="Enter nested tag (e.g., <span>Nested</span>)"
              />
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateTag}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              Generate Tag
            </button>
            {generatedTag && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors font-medium flex items-center justify-center ${
                    isCopied
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Reset
                </button>
              </>
            )}
          </div>

          {/* Generated Tag */}
          {generatedTag && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Generated HTML Tag:</h2>
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                {generatedTag}
              </pre>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold text-gray-700 flex items-center">
                <FaHistory className="mr-2" /> Recent Tags (Last 5)
              </h3>
              <ul className="mt-2 text-sm text-gray-600 space-y-2">
                {history.slice().reverse().map((entry, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{entry.generatedTag.slice(0, 20)}...</span>
                    <button
                      onClick={() => restoreFromHistory(entry)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <FaUndo />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Features Info */}
          <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
            <h3 className="font-semibold text-blue-700">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm">
              <li>Generate common HTML tags with custom attributes</li>
              <li>Support for nested tags and content</li>
              <li>Attribute suggestions and history tracking</li>
              <li>Copy or reset generated tags</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HTMLTagGenerator;