// app/components/PDFPageReorder.jsx
'use client'
import React, { useState, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import { useDropzone } from 'react-dropzone'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

// Set pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PageItem = ({ pageNumber, index, movePage, totalPages }) => {
  const [, drag] = useDrag({
    type: 'PAGE',
    item: { index }
  })

  const [, drop] = useDrop({
    accept: 'PAGE',
    hover: (item) => {
      if (item.index !== index) {
        movePage(item.index, index)
        item.index = index
      }
    }
  })

  return (
    <div
      ref={(node) => drag(drop(node))}
      className="flex items-center space-x-2 p-2 bg-white rounded-md shadow-sm hover:bg-gray-50 cursor-move"
    >
      <div className="w-24 h-32 bg-gray-100 flex items-center justify-center">
        <Page pageNumber={pageNumber} width={80} />
      </div>
      <span className="text-sm text-gray-600">
        Page {pageNumber} of {totalPages}
      </span>
    </div>
  )
}

const PDFPageReorder = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [pages, setPages] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback((acceptedFiles) => {
    const pdfFile = acceptedFiles[0]
    if (pdfFile && pdfFile.type === 'application/pdf') {
      setFile(pdfFile)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  })

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
    setPages(Array.from({ length: numPages }, (_, i) => i + 1))
  }

  const movePage = useCallback((fromIndex, toIndex) => {
    setPages(prevPages => {
      const newPages = [...prevPages]
      const [movedPage] = newPages.splice(fromIndex, 1)
      newPages.splice(toIndex, 0, movedPage)
      return newPages
    })
  }, [])

  const reorderAndDownload = async () => {
    if (!file || !pages.length) return

    setIsProcessing(true)
    try {
      // This is a simulation. In a real implementation, you'd use pdf-lib or similar
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = `reordered_${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Reordering failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Page Reorder</h1>

        {/* File Dropzone */}
        {!file && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-md p-8 text-center ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-gray-600">
              Drag and drop a PDF file here, or click to select
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Only PDF files are supported
            </p>
          </div>
        )}

        {/* Page Reordering Interface */}
        {file && (
          <DndProvider backend={HTML5Backend}>
            <div className="space-y-4">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                className="hidden"
              >
                {pages.map((pageNumber, index) => (
                  <PageItem
                    key={pageNumber}
                    pageNumber={pageNumber}
                    index={index}
                    movePage={movePage}
                    totalPages={numPages}
                  />
                ))}
              </Document>

              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setFile(null)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                  Reset
                </button>
                <button
                  onClick={reorderAndDownload}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Download Reordered PDF'}
                </button>
              </div>
            </div>
          </DndProvider>
        )}
      </div>
    </div>
  )
}

export default PDFPageReorder