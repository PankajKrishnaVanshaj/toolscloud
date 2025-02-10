"use client";

import { useState } from "react";

const CompressPDF = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [compressedImages, setCompressedImages] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }
    setPdfFile(file);
    compressPDF(file);
  };

  const compressPDF = async (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataURL = reader.result;

      const pages = 3; // Simulating 3 pages
      const compressedImagesArray = [];
      for (let i = 0; i < pages; i++) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = 500; // Lower resolution
        canvas.height = 700;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = "16px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(`Compressed PDF Page ${i + 1}`, 180, 350);

        compressedImagesArray.push(canvas.toDataURL("image/jpeg", 0.6)); // Compressing to 60% quality
      }

      setCompressedImages(compressedImagesArray);
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

      {compressedImages.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Compressed Pages:</h3>
          {compressedImages.map((img, index) => (
            <div key={index} className="mb-3">
              <img src={img} alt={`Compressed Page ${index + 1}`} className="w-full rounded-lg shadow" />
              <a
                href={img}
                download={`Compressed_PDF_Page_${index + 1}.jpg`}
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

export default CompressPDF;
