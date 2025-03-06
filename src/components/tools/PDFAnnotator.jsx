// app/components/PDFAnnotator.jsx
'use client'
import React, { useState, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFAnnotator = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [tool, setTool] = useState('select') // select, highlight, note, draw
  const [annotations, setAnnotations] = useState([])
  const [scale, setScale] = useState(1.0)
  const canvasRef = useRef(null)

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setAnnotations([])
      setCurrentPage(1)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const addAnnotation = (type, data) => {
    setAnnotations(prev => [...prev, {
      id: Date.now(),
      type,
      page: currentPage,
      ...data
    }])
  }

  const handleCanvasClick = (e) => {
    if (!canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale

    switch (tool) {
      case 'highlight':
        addAnnotation('highlight', { x, y, width: 200, height: 20 })
        break
      case 'note':
        addAnnotation('note', { x, y, text: 'New note' })
        break
      case 'draw':
        addAnnotation('draw', { x, y, points: [{ x, y }] })
        break
    }
  }

  const saveAnnotations = () => {
    const data = JSON.stringify({
      fileName: file?.name,
      annotations
    })
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${file?.name || 'document'}_annotations.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const renderAnnotations = () => {
    return annotations
      .filter(ann => ann.page === currentPage)
      .map(ann => {
        switch (ann.type) {
          case 'highlight':
            return (
              <div
                key={ann.id}
                className="absolute bg-yellow-200 opacity-50"
                style={{
                  left: ann.x * scale,
                  top: ann.y * scale,
                  width: ann.width * scale,
                  height: ann.height * scale
                }}
              />
            )
          case 'note':
            return (
              <div
                key={ann.id}
                className="absolute bg-blue-100 p-2 rounded shadow"
                style={{
                  left: ann.x * scale,
                  top: ann.y * scale
                }}
              >
                {ann.text}
              </div>
            )
          case 'draw':
            return (
              <svg
                key={ann.id}
                className="absolute"
                style={{
                  left: ann.x * scale,
                  top: ann.y * scale
                }}
              >
                <polyline
                  points={ann.points.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="red"
                  strokeWidth="2"
                />
              </svg>
            )
        }
      })
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Annotator</h1>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setTool('select')}
            className={`px-4 py-2 rounded ${tool === 'select' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Select
          </button>
          <button
            onClick={() => setTool('highlight')}
            className={`px-4 py-2 rounded ${tool === 'highlight' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Highlight
          </button>
          <button
            onClick={() => setTool('note')}
            className={`px-4 py-2 rounded ${tool === 'note' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Note
          </button>
          <button
            onClick={() => setTool('draw')}
            className={`px-4 py-2 rounded ${tool === 'draw' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Draw
          </button>
          <select
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="p-2 border rounded"
          >
            <option value="0.5">50%</option>
            <option value="1.0">100%</option>
            <option value="1.5">150%</option>
            <option value="2.0">200%</option>
          </select>
          <button
            onClick={saveAnnotations}
            disabled={!file || annotations.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Save Annotations
          </button>
          <input
            type="file"
            accept=".pdf"
            onChange={onFileChange}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700"
          />
        </div>

        {/* PDF Viewer */}
        {file && (
          <div className="relative">
            <div className="overflow-auto max-h-[80vh] border bg-gray-50 rounded">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                className="relative"
              >
                <div
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="relative"
                >
                  <Page
                    pageNumber={currentPage}
                    scale={scale}
                    renderAnnotationLayer={false}
                    renderTextLayer={true}
                  />
                  {renderAnnotations()}
                </div>
              </Document>
            </div>

            {/* Navigation */}
            {numPages && (
              <div className="mt-4 flex justify-center items-center gap-4">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {numPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                  disabled={currentPage === numPages}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PDFAnnotator