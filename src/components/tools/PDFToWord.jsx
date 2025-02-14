"use client";

import { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

const PDFToWord = () => {
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [textSize, setTextSize] = useState(16);
  const [images, setImages] = useState([]);
  const previewCanvasRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file?.type === "application/pdf") {
      convertPDFToText(file);
      convertPDFToImages(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const convertPDFToText = async (file) => {
    setLoading(true);
    setExtractedText([]);
    setCurrentPage(1);
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async () => {
      const loadingTask = pdfjsLib.getDocument({ data: reader.result });
      loadingTask.promise
        .then(async (pdf) => {
          const pagesText = [];
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            pagesText.push(textContent.items.map((item) => item.str).join(" "));
            if (pageNum === 1) renderPagePreview(page);
          }
          setExtractedText(pagesText);
        })
        .catch((error) => console.error("Error extracting text:", error))
        .finally(() => setLoading(false));
    };
  };

  const renderPagePreview = async (page) => {
    const canvas = previewCanvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      const viewport = page.getViewport({ scale: 0.5 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
    }
  };

  const downloadWordDocument = () => {
    if (!extractedText.length) return alert("No text to download.");
    const fullText = extractedText
      .map((text, i) => `--- Page ${i + 1} ---\n\n${text}`)
      .join("\n\n");
    const blob = new Blob([fullText], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "converted-document.docx";
    link.click();
  };

  const convertPDFToImages = async (file) => {
    setImages([]);
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      const loadingTask = pdfjsLib.getDocument({ data: reader.result });
      const pdf = await loadingTask.promise;
      const imagesArray = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        imagesArray.push(canvas.toDataURL("image/png"));
      }
      setImages(imagesArray);
    };
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-2xl flex flex-col gap-4">
      <input
        type="file"
        accept="application/pdf"
        className="mb-4 w-full p-2 border rounded-lg"
        onChange={handleFileUpload}
      />

      {loading && (
        <div className="text-center text-primary">
          Converting PDF to text, please wait...
        </div>
      )}

      {extractedText.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4">
          {/* Image Preview (hidden on mobile) */}
          <div className="w-full md:w-1/3 hidden md:block">
            {images.length > 0 && (
              <div className="mt-4">
                <img
                  src={images[currentPage - 1]}
                  alt={`Page ${currentPage}`}
                  className="w-full border rounded shadow"
                />
              </div>
            )}
            <canvas
              ref={previewCanvasRef}
              className="hidden"
            />
          </div>

          <div className="w-full md:w-2/3 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">
                Page {currentPage} of {extractedText.length}
              </h3>
              <div className="flex gap-2">
                <button
                  className="bg-gray-500 text-white px-2 py-1 rounded-lg hover:bg-gray-600"
                  onClick={() => setTextSize((size) => Math.max(size - 2, 12))}
                >
                  A-
                </button>
                <button
                  className="bg-gray-500 text-white px-2 py-1 rounded-lg hover:bg-gray-600"
                  onClick={() => setTextSize((size) => size + 2)}
                >
                  A+
                </button>
              </div>
            </div>

            <div
              className="p-4 border rounded-lg bg-gray-100 overflow-y-auto max-h-96"
              style={{
                whiteSpace: "pre-wrap",
                fontFamily: "monospace",
                fontSize: `${textSize}px`,
              }}
            >
              {extractedText[currentPage - 1]}
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                onClick={() => setCurrentPage((page) => page - 1)}
                disabled={currentPage === 1}
              >
                Previous Page
              </button>
              <button
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                onClick={() => setCurrentPage((page) => page + 1)}
                disabled={currentPage === extractedText.length}
              >
                Next Page
              </button>
            </div>

            <button
          className="w-full mt-5 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text border hover:border-secondary p-2 rounded-lg"
          onClick={downloadWordDocument}
            >
              Download Word Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFToWord;
