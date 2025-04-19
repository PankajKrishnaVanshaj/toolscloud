"use client";
import React, { useState, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { FaSave, FaUndo, FaRedo, FaTrash, FaSync } from "react-icons/fa";

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFEditor = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [annotations, setAnnotations] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [editorState, setEditorState] = useState({
    textTool: false,
    highlightTool: false,
    drawTool: false,
    rotation: 0,
    scale: 1.0,
  });
  const canvasRef = useRef(null);

  // File handling
  const onFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setCurrentPage(1);
      setAnnotations([]);
      setHistory([]);
      setHistoryIndex(-1);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Save to history
  const saveToHistory = useCallback(() => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push([...annotations]);
      return newHistory.slice(-10); // Limit to 10 states
    });
    setHistoryIndex((prev) => prev + 1);
  }, [annotations, historyIndex]);

  // Annotation handling
  const addAnnotation = useCallback(
    (type, position) => {
      saveToHistory();
      setAnnotations((prev) => [
        ...prev,
        {
          id: Date.now(),
          type,
          position,
          page: currentPage,
          content: type === "text" ? "" : type === "draw" ? [] : undefined,
          color: type === "highlight" ? "rgba(255, 255, 0, 0.5)" : "black",
        },
      ]);
    },
    [currentPage, saveToHistory]
  );

  // Undo/Redo
  const undo = () => {
    if (historyIndex > 0) {
      setAnnotations(history[historyIndex - 1]);
      setHistoryIndex((prev) => prev - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setAnnotations(history[historyIndex + 1]);
      setHistoryIndex((prev) => prev + 1);
    }
  };

  // Page controls
  const rotatePage = () => {
    setEditorState((prev) => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  };

  const zoomIn = () => {
    setEditorState((prev) => ({
      ...prev,
      scale: Math.min(prev.scale + 0.2, 3.0),
    }));
  };

  const zoomOut = () => {
    setEditorState((prev) => ({
      ...prev,
      scale: Math.max(prev.scale - 0.2, 0.5),
    }));
  };

  const reset = () => {
    setFile(null);
    setAnnotations([]);
    setHistory([]);
    setHistoryIndex(-1);
    setCurrentPage(1);
    setEditorState({
      textTool: false,
      highlightTool: false,
      drawTool: false,
      rotation: 0,
      scale: 1.0,
    });
  };

  // Save PDF with annotations (basic canvas overlay)
  const savePDF = useCallback(() => {
    if (!file || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const pdfDoc = new Document({ file });
    pdfDoc.onLoadSuccess = ({ numPages }) => {
      const page = new Page({ pageNumber: currentPage });
      page.onRenderSuccess = () => {
        canvas.width = page.width * editorState.scale;
        canvas.height = page.height * editorState.scale;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale(editorState.scale, editorState.scale);
        ctx.drawImage(page.getViewport({ scale: 1 }).convertToCanvas(), 0, 0);

        // Render annotations
        annotations
          .filter((ann) => ann.page === currentPage)
          .forEach((ann) => {
            ctx.save();
            ctx.translate(ann.position.x, ann.position.y);
            if (ann.type === "text") {
              ctx.font = "16px Arial";
              ctx.fillStyle = ann.color;
              ctx.fillText(ann.content || "", 0, 0);
            } else if (ann.type === "highlight") {
              ctx.fillStyle = ann.color;
              ctx.fillRect(0, 0, 150, 20);
            }
            ctx.restore();
          });

        const link = document.createElement("a");
        link.download = `edited_${file.name.split(".")[0]}_${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      };
    };
  }, [file, currentPage, annotations, editorState.scale]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">PDF Editor</h1>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
          <input
            type="file"
            accept=".pdf"
            onChange={onFileChange}
            className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            onClick={() => setEditorState((prev) => ({ ...prev, textTool: !prev.textTool }))}
            className={`px-4 py-2 rounded-md ${editorState.textTool ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Text
          </button>
          <button
            onClick={() => setEditorState((prev) => ({ ...prev, highlightTool: !prev.highlightTool }))}
            className={`px-4 py-2 rounded-md ${editorState.highlightTool ? "bg-yellow-400" : "bg-gray-200"}`}
          >
            Highlight
          </button>
          <button
            onClick={() => setEditorState((prev) => ({ ...prev, drawTool: !prev.drawTool }))}
            className={`px-4 py-2 rounded-md ${editorState.drawTool ? "bg-red-500 text-white" : "bg-gray-200"}`}
          >
            Draw
          </button>
          <button onClick={rotatePage} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
            Rotate
          </button>
          <button onClick={zoomIn} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
            Zoom In
          </button>
          <button onClick={zoomOut} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
            Zoom Out
          </button>
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 flex items-center"
          >
            <FaUndo className="mr-2" /> Undo
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 flex items-center"
          >
            <FaRedo className="mr-2" /> Redo
          </button>
          <button
            onClick={savePDF}
            disabled={!file}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
            <FaSave className="mr-2" /> Save
          </button>
          <button
            onClick={reset}
            disabled={!file}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Main Editor Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Page Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Pages</h3>
              <div className="max-h-[70vh] overflow-y-auto space-y-2 p-2 bg-gray-50 rounded-lg">
                {Array.from({ length: numPages || 0 }, (_, i) => (
                  <div
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`cursor-pointer p-2 rounded-md ${
                      currentPage === i + 1 ? "bg-blue-100 border-blue-500" : "bg-white"
                    } border hover:bg-blue-50 transition-colors`}
                  >
                    <Document file={file}>
                      <Page
                        pageNumber={i + 1}
                        width={100}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </Document>
                    <span className="block text-center text-sm text-gray-600">Page {i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Editor Canvas */}
          <div className="lg:col-span-3 relative">
            {file ? (
              <div className="relative border bg-white p-4 rounded-lg shadow-inner overflow-auto max-h-[70vh]">
                <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                  <Page
                    pageNumber={currentPage}
                    scale={editorState.scale}
                    rotate={editorState.rotation}
                    onClick={(e) => {
                      const rect = e.target.getBoundingClientRect();
                      const position = {
                        x: (e.clientX - rect.left) / editorState.scale,
                        y: (e.clientY - rect.top) / editorState.scale,
                      };
                      if (editorState.textTool) addAnnotation("text", position);
                      if (editorState.highlightTool) addAnnotation("highlight", position);
                      if (editorState.drawTool) addAnnotation("draw", position);
                    }}
                  />
                </Document>

                {/* Render Annotations */}
                {annotations
                  .filter((ann) => ann.page === currentPage)
                  .map((ann) => (
                    <div
                      key={ann.id}
                      style={{
                        position: "absolute",
                        left: ann.position.x * editorState.scale,
                        top: ann.position.y * editorState.scale,
                        transform: `rotate(${editorState.rotation}deg)`,
                        transformOrigin: "top left",
                      }}
                    >
                      {ann.type === "text" ? (
                        <input
                          type="text"
                          className="border p-1 rounded text-sm"
                          value={ann.content || ""}
                          onChange={(e) =>
                            setAnnotations((prev) =>
                              prev.map((a) => (a.id === ann.id ? { ...a, content: e.target.value } : a))
                            )
                          }
                        />
                      ) : ann.type === "highlight" ? (
                        <div
                          className="w-40 h-6"
                          style={{ backgroundColor: ann.color }}
                        />
                      ) : ann.type === "draw" ? (
                        <div className="w-10 h-10 bg-red-500 rounded-full opacity-50" />
                      ) : null}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="h-[70vh] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
                Please upload a PDF to begin editing
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>

        {/* Page Controls */}
        {numPages && (
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="py-2 text-gray-700">Page {currentPage} of {numPages}</span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(numPages, prev + 1))}
              disabled={currentPage === numPages}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Add text and highlight annotations</li>
            <li>Basic drawing tool</li>
            <li>Rotate and zoom functionality</li>
            <li>Undo/redo history</li>
            <li>Page navigation with thumbnails</li>
            <li>Save as PNG with annotations</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFEditor;