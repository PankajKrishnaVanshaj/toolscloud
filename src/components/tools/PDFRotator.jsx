// app/components/PDFRotator.jsx
'use client'
import React, { useState } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

const PDFRotator = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [previewPage, setPreviewPage] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [rotations, setRotations] = useState({})
  const [bulkRotation, setBulkRotation] = useState(0)

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setRotations({})
      setBulkRotation(0)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const rotatePage = (pageNumber, degrees) => {
    setRotations(prev => ({
      ...prev,
      [pageNumber]: ((prev[pageNumber] || 0) + degrees) % 360
    }))
  }

  const rotateAllPages = (degrees) => {
    setBulkRotation((prev) => (prev + degrees) % 360)
    setRotations({})
  }

  const getPageRotation = (pageNumber) => {
    return (rotations[pageNumber] || 0) + bulkRotation
  }

  const saveRotatedPDF = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      // This is where actual PDF rotation would be implemented
      // For demo, we'll simulate processing and download original
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = `rotated_${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Rotation failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Rotator</h1>

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

        {/* Rotation Controls */}
        {file && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Rotation Controls</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bulk Rotation */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Rotate All Pages</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => rotateAllPages(-90)}
                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    -90°
                  </button>
                  <button
                    onClick={() => rotateAllPages(90)}
                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    90°
                  </button>
                  <button
                    onClick={() => rotateAllPages(180)}
                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    180°
                  </button>
                </div>
              </div>

              {/* Current Page Rotation */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Rotate Current Page</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => rotatePage(previewPage, -90)}
                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    -90°
                  </button>
                  <button
                    onClick={() => rotatePage(previewPage, 90)}
                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    90°
                  </button>
                  <button
                    onClick={() => rotatePage(previewPage, 180)}
                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    180°
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        {file && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Preview</h2>
            <div className="border p-4 bg-gray-50 rounded-md">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex justify-center"
              >
                <Page
                  pageNumber={previewPage}
                  width={400}
                  rotate={getPageRotation(previewPage)}
                />
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
                    Page {previewPage} of {numPages} (Rotated: {getPageRotation(previewPage)}°)
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
        )}

        {/* Save Button */}
        <button
          onClick={saveRotatedPDF}
          disabled={!file || isProcessing}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Save Rotated PDF'}
        </button>
      </div>
    </div>
  )
}

export default PDFRotator