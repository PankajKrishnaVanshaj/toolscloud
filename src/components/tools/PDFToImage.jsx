"use client";

import { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/webpack";

const PDFToImage = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [imageURL, setImageURL] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [thumbnails, setThumbnails] = useState([]);
  const canvasRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      generateThumbnails(file);
      renderPDFToCanvas(file, 1);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const generateThumbnails = async (file) => {
    setLoading(true);
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      const pdfData = reader.result;
      const loadingTask = pdfjsLib.getDocument({ data: pdfData });

      const pdf = await loadingTask.promise;
      setTotalPages(pdf.numPages);

      const thumbnailsArray = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const context = canvas.getContext("2d");
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        thumbnailsArray.push(canvas.toDataURL("image/png"));
      }
      setThumbnails(thumbnailsArray);
      setLoading(false);
    };
  };

  const renderPDFToCanvas = async (file, pageNumber) => {
    if (isRendering) return;
    setIsRendering(true);
    setLoading(true);
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      const pdfData = reader.result;
      const loadingTask = pdfjsLib.getDocument({ data: pdfData });

      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = canvasRef.current;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: canvas.getContext("2d"),
        viewport: viewport,
      };
      await page.render(renderContext).promise;

      setImageURL(canvas.toDataURL("image/png"));
      setLoading(false);
      setIsRendering(false);
    };
  };

  const handleThumbnailClick = (pageIndex) => {
    setCurrentPage(pageIndex + 1);
    renderPDFToCanvas(pdfFile, pageIndex + 1);
  };

  const downloadImage = () => {
    if (!imageURL) {
      alert("No image generated!");
      return;
    }
    const link = document.createElement("a");
    link.href = imageURL;
    link.download = `converted-page-${currentPage}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col md:flex-row mx-auto p-5 bg-white shadow-lg rounded-2xl">
  {/* Thumbnail section (hidden on small screens) */}
  <div className="w-full md:w-1/4 overflow-y-auto max-h-[500px] bg-gray-100 rounded-lg p-2 mr-4 hidden md:block">
    {thumbnails.length > 0 && (
      <div className="grid grid-cols-1 gap-2">
        {thumbnails.map((thumbnail, index) => (
          <img
            key={index}
            src={thumbnail}
            alt={`Thumbnail Page ${index + 1}`}
            className={`cursor-pointer border-2 rounded-lg ${
              currentPage === index + 1 ? "border-primary" : "border-gray-300"
            }`}
            onClick={() => handleThumbnailClick(index)}
          />
        ))}
      </div>
    )}
  </div>

  {/* Main content section */}
  <div className="w-full md:w-3/4">
    <h2 className="text-xl font-bold mb-4">PDF to Image Converter</h2>
    <input
      type="file"
      accept="application/pdf"
      className="mb-3 w-full p-2 border rounded-lg"
      onChange={handleFileUpload}
    />

    {loading && <div className="text-center">Rendering page, please wait...</div>}

    <canvas ref={canvasRef} className="hidden"></canvas>

    {imageURL && (
      <div className="mt-4">
        <img
          src={imageURL}
          alt={`Converted Page ${currentPage}`}
          className="w-full rounded-lg shadow"
        />
        <div className="flex flex-wrap justify-between items-center gap-4 mt-3">
          <button
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
            onClick={() => handleThumbnailClick(currentPage - 2)}
            disabled={currentPage <= 1 || isRendering}
          >
            Previous Page
          </button>

          <span className="font-medium text-secondary">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
            onClick={() => handleThumbnailClick(currentPage)}
            disabled={currentPage >= totalPages || isRendering}
          >
            Next Page
          </button>
        </div>
        <button
          className={`w-full bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text px-4 py-2 mt-4 rounded-lg border hover:border-secondary transition ${
            isRendering || !imageURL ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={downloadImage}
          disabled={isRendering || !imageURL}
        >
          {isRendering ? "Rendering..." : "Download Image"}
        </button>
      </div>
    )}
  </div>
</div>

  );
};

export default PDFToImage;
