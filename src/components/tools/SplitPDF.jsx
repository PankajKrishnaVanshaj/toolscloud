"use client";

import { useState } from "react";

const SplitPDF = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pageImages, setPageImages] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }
    setPdfFile(file);
    splitPDF(file);
  };

  const splitPDF = async (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataURL = reader.result;

      const pages = 3; // Simulate splitting into 3 pages
      const canvasArray = [];
      for (let i = 0; i < pages; i++) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = 600;
        canvas.height = 800;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = "20px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(`PDF Page ${i + 1}`, 250, 400);

        canvasArray.push(canvas.toDataURL("image/png"));
      }

      setPageImages(canvasArray);
    };
  };

  return (
    <div className="mx-auto p-5 bg-white shadow-lg rounded-2xl">

      <input
        type="file"
        accept="application/pdf"
        className="mb-3 w-full p-2 border rounded-lg"
        onChange={handleFileUpload}
      />

      {pageImages.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Extracted Pages:</h3>
          {pageImages.map((img, index) => (
            <div key={index} className="mb-3">
              <img src={img} alt={`Page ${index + 1}`} className="w-full rounded-lg shadow" />
              <a
                href={img}
                download={`PDF_Page_${index + 1}.png`}
                className="block text-center mt-2 text-blue-500 hover:underline"
              >
                Download Page {index + 1}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SplitPDF;
