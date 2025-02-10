"use client";

import { useState } from "react";

const MergePDFs = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [mergedImageURL, setMergedImageURL] = useState("");

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => file.type === "application/pdf");

    if (validFiles.length < 2) {
      alert("Please upload at least two valid PDF files.");
      return;
    }

    setPdfFiles(validFiles);
    mergePDFs(validFiles);
  };

  const mergePDFs = async (files) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 600;
    canvas.height = 800 * files.length; // Increase height for multiple pages

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "20px Arial";
    ctx.fillStyle = "black";

    files.forEach((file, index) => {
      ctx.fillText(`PDF Page ${index + 1}`, 250, (index * 800) + 400);
    });

    setMergedImageURL(canvas.toDataURL("image/png"));
  };

  const downloadMergedPDF = () => {
    if (!mergedImageURL) {
      alert("No merged PDF generated!");
      return;
    }
    const link = document.createElement("a");
    link.href = mergedImageURL;
    link.download = "merged.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto p-5 bg-white shadow-lg rounded-2xl">

      <input
        type="file"
        accept="application/pdf"
        multiple
        className="mb-3 w-full p-2 border rounded-lg"
        onChange={handleFileUpload}
      />

      {mergedImageURL && (
        <div className="mt-4">
          <img src={mergedImageURL} alt="Merged PDF" className="w-full rounded-lg shadow" />
          <button
            className="w-full bg-blue-500 text-white px-4 py-2 mt-3 rounded-lg hover:bg-blue-600 transition"
            onClick={downloadMergedPDF}
          >
            Download Merged PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default MergePDFs;
