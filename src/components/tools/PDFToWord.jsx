"use client";

import { useState } from "react";

const PDFToWord = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [textContent, setTextContent] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      extractTextFromPDF(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const extractTextFromPDF = async (file) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      setTextContent(reader.result);
    };
  };

  const downloadWordFile = () => {
    if (!textContent) {
      alert("No text extracted from PDF!");
      return;
    }

    const blob = new Blob([textContent], { type: "application/msword" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "converted.doc";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-lg mx-auto p-5 bg-white shadow-lg rounded-2xl">
      <h2 className="text-xl font-semibold mb-4">PDF to Word Converter</h2>

      {/* File Input */}
      <input
        type="file"
        accept="application/pdf"
        className="mb-3 w-full p-2 border rounded-lg"
        onChange={handleFileUpload}
      />

      {/* Extracted Text Preview */}
      {textContent && (
        <textarea
          className="w-full h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={textContent}
          readOnly
        />
      )}

      {/* Download Button */}
      <button
        className="w-full bg-green-500 text-white px-4 py-2 mt-3 rounded-lg hover:bg-green-600 transition"
        onClick={downloadWordFile}
      >
        Download Word File
      </button>
    </div>
  );
};

export default PDFToWord;
