"use client";
import React, { useState } from "react";

const SlugGenerator = () => {
  const [inputText, setInputText] = useState("");
  const [slug, setSlug] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // Function to generate slug
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
  };

  // Handle input change
  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);
    setSlug(generateSlug(text));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(slug);
    setShowAlert(true);
    // Hide alert after 2 seconds
    setTimeout(() => {
      setShowAlert(false);
    }, 2000);
  };

  return (
    <div className="mx-auto p-4 bg-white shadow-lg rounded-2xl flex items-center justify-center">
      <div className="relative  p-6 rounded-lg w-full ">
        {/* Alert Notification */}
        {showAlert && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            Slug copied to clipboard!
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Slug Generator
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="inputText"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Enter your text
            </label>
            <input
              type="text"
              id="inputText"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Type something..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="slugOutput"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Generated Slug
            </label>
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600 break-all">
              {slug || "Your slug will appear here"}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!slug}
            className={`w-full py-2 px-4 rounded-md text-white font-medium
              ${
                slug
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              } transition-colors duration-200`}
          >
            Copy Slug
          </button>
        </form>
      </div>
    </div>
  );
};

export default SlugGenerator;
