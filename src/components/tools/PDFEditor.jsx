// app/components/PDFEditor.jsx
'use client'
import React, { useState, useCallback } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

const PDFEditor = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [annotations, setAnnotations] = useState([])
  const [editorState, setEditorState] = useState({
    textTool: false,
    highlightTool: false,
    rotation: 0,
    scale: 1.0
  })

  // File handling
  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setCurrentPage(1)
      setAnnotations([])
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  // Annotation handling
  const addAnnotation = useCallback((type, position) => {
    setAnnotations(prev => [...prev, {
      id: Date.now(),
      type,
      position,
      page: currentPage,
      content: type === 'text' ? '' : undefined
    }])
  }, [currentPage])

  // Page controls
  const rotatePage = () => {
    setEditorState(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }))
  }

  const zoomIn = () => {
    setEditorState(prev => ({
      ...prev,
      scale: Math.min(prev.scale + 0.2, 3.0)
    }))
  }

  const zoomOut = () => {
    setEditorState(prev => ({
      ...prev,
      scale: Math.max(prev.scale - 0.2, 0.5)
    }))
  }

  const savePDF = () => {
    if (file) {
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = `edited_${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Editor</h1>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-md">
          <input
            type="file"
            accept=".pdf"
            onChange={onFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            onClick={() => setEditorState(prev => ({ ...prev, textTool: !prev.textTool }))}
            className={`px-4 py-2 rounded-md ${editorState.textTool ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Text
          </button>
          <button
            onClick={() => setEditorState(prev => ({ ...prev, highlightTool: !prev.highlightTool }))}
            className={`px-4 py-2 rounded-md ${editorState.highlightTool ? 'bg-yellow-400' : 'bg-gray-200'}`}
          >
            Highlight
          </button>
          <button onClick={rotatePage} className="px-4 py-2 bg-gray-200 rounded-md">
            Rotate
          </button>
          <button onClick={zoomIn} className="px-4 py-2 bg-gray-200 rounded-md">
            Zoom In
          </button>
          <button onClick={zoomOut} className="px-4 py-2 bg-gray-200 rounded-md">
            Zoom Out
          </button>
          <button onClick={savePDF} className="px-4 py-2 bg-green-600 text-white rounded-md">
            Save PDF
          </button>
        </div>

        {/* Main Editor Area */}
        <div className="grid grid-cols-4 gap-6">
          {/* Page Navigation */}
          <div className="col-span-1">
            <div className="sticky top-6">
              <h3 className="text-lg font-semibold mb-2">Pages</h3>
              <div className="max-h-[70vh] overflow-y-auto space-y-2">
                {Array.from({ length: numPages || 0 }, (_, i) => (
                  <div
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`cursor-pointer p-2 rounded-md ${currentPage === i + 1 ? 'bg-blue-100 border-blue-500' : 'bg-gray-50'} border`}
                  >
                    <Document file={file}>
                      <Page
                        pageNumber={i + 1}
                        width={100}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </Document>
                    <span className="block text-center text-sm">Page {i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Editor Canvas */}
          <div className="col-span-3 relative">
            {file ? (
              <div className="relative border bg-white p-4 rounded-md">
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                >
                  <Page
                    pageNumber={currentPage}
                    scale={editorState.scale}
                    rotate={editorState.rotation}
                    onClick={(e) => {
                      const rect = e.target.getBoundingClientRect()
                      const position = {
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top
                      }
                      if (editorState.textTool) addAnnotation('text', position)
                      if (editorState.highlightTool) addAnnotation('highlight', position)
                    }}
                  />
                </Document>

                {/* Render Annotations */}
                {annotations
                  .filter(ann => ann.page === currentPage)
                  .map(ann => (
                    <div
                      key={ann.id}
                      style={{
                        position: 'absolute',
                        left: ann.position.x,
                        top: ann.position.y,
                        transform: `scale(${editorState.scale}) rotate(${editorState.rotation}deg)`,
                        transformOrigin: 'top left'
                      }}
                    >
                      {ann.type === 'text' ? (
                        <input
                          type="text"
                          className="border p-1 rounded"
                          onChange={(e) => {
                            setAnnotations(prev => prev.map(a =>
                              a.id === ann.id ? { ...a, content: e.target.value } : a
                            ))
                          }}
                        />
                      ) : (
                        <div className="w-32 h-6 bg-yellow-300 opacity-50" />
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="h-[70vh] flex items-center justify-center text-gray-500">
                Please upload a PDF to begin editing
              </div>
            )}
          </div>
        </div>

        {/* Page Controls */}
        {numPages && (
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="py-2">Page {currentPage} of {numPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
              disabled={currentPage === numPages}
              className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PDFEditor