// app/components/PDFRedactionTool.jsx
'use client'
import React, { useState, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFRedactionTool = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [redactions, setRedactions] = useState([])
  const [redactionMode, setRedactionMode] = useState('rectangle') // rectangle or text
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState(null)
  const canvasRef = useRef(null)

  // Handle file upload
  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setRedactions([])
      setCurrentPage(1)
    }
  }

  // Handle PDF load success
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  // Handle mouse events for rectangle redaction
  const handleMouseDown = (e) => {
    if (redactionMode !== 'rectangle') return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    setStartPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setIsDrawing(true)
  }

  const handleMouseMove = (e) => {
    if (!isDrawing || redactionMode !== 'rectangle') return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top
    
    // Draw preview (this would need canvas implementation in a real app)
    console.log('Drawing rectangle from', startPos, 'to', { x: currentX, y: currentY })
  }

  const handleMouseUp = (e) => {
    if (!isDrawing || redactionMode !== 'rectangle') return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const endX = e.clientX - rect.left
    const endY = e.clientY - rect.top

    setRedactions(prev => [...prev, {
      page: currentPage,
      type: 'rectangle',
      x: Math.min(startPos.x, endX),
      y: Math.min(startPos.y, endY),
      width: Math.abs(endX - startPos.x),
      height: Math.abs(endY - startPos.y)
    }])
    
    setIsDrawing(false)
    setStartPos(null)
  }

  // Handle text selection for redaction
  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection.rangeCount > 0 && redactionMode === 'text') {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      
      setRedactions(prev => [...prev, {
        page: currentPage,
        type: 'text',
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        text: selection.toString()
      }])
      selection.removeAllRanges()
    }
  }

  // Export redacted PDF
  const exportRedactedPDF = async () => {
    if (!file) return
    
    // This is a placeholder - actual implementation would require pdf-lib or similar
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = `redacted_${file.name}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Redaction Tool</h1>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="file"
            accept=".pdf"
            onChange={onFileChange}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          
          <select
            value={redactionMode}
            onChange={(e) => setRedactionMode(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="rectangle">Rectangle Redaction</option>
            <option value="text">Text Selection</option>
          </select>

          <button
            onClick={() => setRedactions([])}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Clear Redactions
          </button>

          <button
            onClick={exportRedactedPDF}
            disabled={!file || redactions.length === 0}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Export Redacted PDF
          </button>
        </div>

        {/* PDF Viewer */}
        {file && (
          <div className="relative">
            <div 
              className="relative border bg-gray-50 rounded-md overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => setIsDrawing(false)}
            >
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                onClick={handleTextSelection}
              >
                <Page 
                  pageNumber={currentPage} 
                  width={800}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
              
              {/* Redaction Overlays */}
              {redactions
                .filter(r => r.page === currentPage)
                .map((redaction, index) => (
                  <div
                    key={index}
                    className="absolute bg-black"
                    style={{
                      left: redaction.x,
                      top: redaction.y,
                      width: redaction.width,
                      height: redaction.height,
                      opacity: 0.8
                    }}
                  />
                ))}
              
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 pointer-events-none"
                width={800}
                height={1000}
              />
            </div>

            {/* Navigation */}
            {numPages && (
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="py-2">
                  Page {currentPage} of {numPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                  disabled={currentPage === numPages}
                  className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Redaction List */}
        {redactions.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Redactions ({redactions.length})</h2>
            <div className="max-h-40 overflow-y-auto">
              {redactions.map((r, index) => (
                <div key={index} className="p-2 bg-gray-100 rounded-md mb-2">
                  Page {r.page}: {r.type === 'text' ? `Text: "${r.text.substring(0, 20)}..."` : 'Rectangle'}
                  <button
                    onClick={() => setRedactions(prev => prev.filter((_, i) => i !== index))}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PDFRedactionTool