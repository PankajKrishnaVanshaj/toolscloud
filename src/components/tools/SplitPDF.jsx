"use client";

import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

const SplitPDF = () => {
  const [pageImages, setPageImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }
    setLoading(true);
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.onload = async () => {
      const pdfData = new Uint8Array(fileReader.result);
      await splitPDF(pdfData);
      setLoading(false);
    };
  };

  const splitPDF = async (pdfData) => {
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdfDocument = await loadingTask.promise;

    const images = [];
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      images.push(canvas.toDataURL("image/png"));
    }

    setPageImages(images);
    setCurrentPage(0); // Reset to the first page
  };

  const handleNextPage = () => {
    if (currentPage < pageImages.length - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handlePageClick = (index) => {
    setCurrentPage(index);
  };

  return (
    <div className="mx-auto p-5 bg-white shadow-lg rounded-2xl">
  <input
    type="file"
    accept="application/pdf"
    className="mb-3 w-full p-2 border rounded-lg"
    onChange={handleFileUpload}
  />

  {loading && <div className="text-primary">Processing your PDF, please wait...</div>}

  {pageImages.length > 0 && (
    <div className="flex flex-col md:flex-row gap-4 mt-4">
      {/* Left-side small previews (hidden on small screens) */}
      <div className="w-full md:w-1/4 flex-shrink-0 overflow-y-auto max-h-screen border-r pr-2 hidden md:block">
        {pageImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Page ${index + 1}`}
            className={`cursor-pointer border rounded-lg mb-2 ${
              index === currentPage
                ? "border-primary"
                : "border-gray-300 hover:border-gray-500"
            }`}
            onClick={() => handlePageClick(index)}
          />
        ))}
      </div>

      {/* Main content with large page view */}
      <div className="flex-grow">
        <h3 className="text-lg font-semibold mb-2">
          Page {currentPage + 1} of {pageImages.length}
        </h3>
        <img
          src={pageImages[currentPage]}
          alt={`Page ${currentPage + 1}`}
          className="w-full border rounded-lg shadow"
        />
        <a
          href={pageImages[currentPage]}
          download={`PDF_Page_${currentPage + 1}.png`}
          className="block text-center mt-2 text-primary hover:underline"
        >
          Download Page {currentPage + 1}
        </a>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className={`px-4 py-2 rounded-lg ${
              currentPage === 0
                ? "bg-gray-300 text-gray-600"
                : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === pageImages.length - 1}
            className={`px-4 py-2 rounded-lg ${
              currentPage === pageImages.length - 1
                ? "bg-gray-300 text-gray-600"
                : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )}
</div>

  );
};

export default SplitPDF;
