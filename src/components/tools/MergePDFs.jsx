"use client";

import { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";

const MergePDFs = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [mergedPdfURL, setMergedPdfURL] = useState("");

  // Clean up merged PDF URL
  useEffect(() => {
    return () => {
      if (mergedPdfURL) {
        URL.revokeObjectURL(mergedPdfURL);
      }
    };
  }, [mergedPdfURL]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter((file) => file.type === "application/pdf");

    if (validFiles.length === 0) {
      alert("Please upload valid PDF files.");
      return;
    }

    setPdfFiles((prevFiles) => [...prevFiles, ...validFiles]);

    // Create previews for each uploaded file
    validFiles.forEach((file) => {
      const previewURL = URL.createObjectURL(file);
      setFilePreviews((prevPreviews) => [...prevPreviews, previewURL]);
    });
  };

  const mergePDFs = async () => {
    if (pdfFiles.length < 2) {
      alert("Please upload at least two PDF files to merge.");
      return;
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of pdfFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    const mergedPdfBlob = new Blob([mergedPdfBytes], {
      type: "application/pdf",
    });
    const newMergedPdfURL = URL.createObjectURL(mergedPdfBlob);
    setMergedPdfURL(newMergedPdfURL);
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const updatedFiles = [...pdfFiles];
    const updatedPreviews = [...filePreviews];
    [updatedFiles[index - 1], updatedFiles[index]] = [
      updatedFiles[index],
      updatedFiles[index - 1],
    ];
    [updatedPreviews[index - 1], updatedPreviews[index]] = [
      updatedPreviews[index],
      updatedPreviews[index - 1],
    ];
    setPdfFiles(updatedFiles);
    setFilePreviews(updatedPreviews);
  };

  const moveDown = (index) => {
    if (index === pdfFiles.length - 1) return;
    const updatedFiles = [...pdfFiles];
    const updatedPreviews = [...filePreviews];
    [updatedFiles[index], updatedFiles[index + 1]] = [
      updatedFiles[index + 1],
      updatedFiles[index],
    ];
    [updatedPreviews[index], updatedPreviews[index + 1]] = [
      updatedPreviews[index + 1],
      updatedPreviews[index],
    ];
    setPdfFiles(updatedFiles);
    setFilePreviews(updatedPreviews);
  };

  const removeFile = (index) => {
    const updatedFiles = pdfFiles.filter((_, i) => i !== index);
    const updatedPreviews = filePreviews.filter((_, i) => i !== index);
    setPdfFiles(updatedFiles);
    setFilePreviews(updatedPreviews);
  };

  const downloadMergedPDF = () => {
    if (!mergedPdfURL) {
      alert("No merged PDF generated!");
      return;
    }
    const link = document.createElement("a");
    link.href = mergedPdfURL;
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
        className="mb-4 w-full p-2 border rounded-lg"
        onChange={handleFileUpload}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Column: Uploaded Files with Previews */}
        <div className="md:col-span-1 bg-gray-100 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Uploaded Files</h3>
          <ul>
            {pdfFiles.map((file, index) => (
              <li
                key={index}
                className="flex flex-col bg-white p-2 rounded-lg mb-4 shadow-sm"
              >
                <span className="truncate font-medium mb-2">{file.name}</span>
                <iframe
                  src={filePreviews[index]}
                  title={`Preview ${index}`}
                  className="w-full h-32 border rounded-lg mb-2"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => moveUp(index)}
                    className="flex-1 px-2 py-1 bg-primary text-white rounded hover:bg-primary/90"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    className="flex-1 px-2 py-1 bg-primary text-white rounded hover:bg-primary/90"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeFile(index)}
                    className="flex-1 px-2 py-1 bg-secondary text-white rounded hover:bg-secondary/90"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <button
            onClick={mergePDFs}
            className="w-full font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text border hover:border-secondary p-2 rounded-lg"
          >
            Merge PDFs
          </button>
        </div>

        {/* Right Column: Merged PDF Preview */}
        <div className="md:col-span-2">
          {mergedPdfURL ? (
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Merged PDF Preview</h3>
              <iframe
                src={mergedPdfURL}
                title="Merged PDF"
                className="w-full min-h-[500px] md:min-h-screen border rounded-lg"
              />
              <button
                className="w-full mt-5 font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text border hover:border-secondary p-2 rounded-lg"
                onClick={downloadMergedPDF}
              >
                Download Merged PDF
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 p-4 rounded-lg text-gray-600">
              <p>
                No merged PDF available. Upload and merge PDFs to see a preview.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MergePDFs;
