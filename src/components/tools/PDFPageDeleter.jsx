// app/components/PDFPageDeleter.jsx
'use client'
import React, { useState, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

const PDFPageDeleter = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [selectedPages, setSelectedPages] = useState(new Set())
  const [previewPage, setPreviewPage] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setSelectedPages(new Set())
      setPreviewPage(1)
      setError(null)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const togglePageSelection = (page) => {
    setSelectedPages(prev => {
      const newSelection = new Set(prev)
      if (newSelection.has(page)) {
        newSelection.delete(page)
      } else {
        newSelection.add(page)
      }
      return newSelection
    })
  }

  const selectAllPages = () => {
    setSelectedPages(new Set(Array.from({ length: numPages }, (_, i) => i + 1)))
  }

  const clearSelection = () => {
    setSelectedPages(new Set())
  }

  const deletePages = useCallback(async () => {
    if (!file || selectedPages.size === 0) return

    setIsProcessing(true)
    setError(null)

    try {
      // Load the PDF
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await pdfjs.getDocument(arrayBuffer).promise
      
      // Create new PDF
      const newPdfDoc = await pdfjs.createDocument()
      const totalPages = pdfDoc.numPages

      // Copy pages that aren't selected for deletion
      for (let i = 1; i <= totalPages; i++) {
        if (!selectedPages.has(i)) {
          const [page] = await newPdfDoc.copyPages(pdfDoc, [i - 1])
          newPdfDoc.addPage(page)
        }
      }

      // Save and download new PDF
      const pdfBytes = await newPdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `modified_${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Update preview with new file
      setFile(blob)
      setSelectedPages(new Set())
    } catch (err) {
      setError('Failed to process PDF: ' + err.message)
    } finally {
      setIsProcessing(false)
    }
  }, [file, selectedPages])

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Page Deleter</h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload PDF File
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {file && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Page Selection */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Select Pages to Delete</h2>
                <div className="space-x-2">
                  <button
                    onClick={selectAllPages}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearSelection}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto border rounded-md p-2">
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: numPages || 0 }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => togglePageSelection(page)}
                      className={`p-2 text-sm rounded-md ${
                        selectedPages.has(page)
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Preview</h2>
              <div className="border p-4 bg-gray-50 rounded-md">
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="flex justify-center"
                >
                  <Page pageNumber={previewPage} width={300} />
                </Document>
                {numPages && (
                  <div className="mt-2 text-center">
                    <button
                      onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                      disabled={previewPage === 1}
                      className="px-2 py-1 bg-gray-200 rounded-l-md disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-4">
                      Page {previewPage} of {numPages}
                    </span>
                    <button
                      onClick={() => setPreviewPage(Math.min(numPages, previewPage + 1))}
                      disabled={previewPage === numPages}
                      className="px-2 py-1 bg-gray-200 rounded-r-md disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {file && (
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={deletePages}
              disabled={isProcessing || selectedPages.size === 0}
              className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : `Delete ${selectedPages.size} Page${selectedPages.size === 1 ? '' : 's'}`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PDFPageDeleter