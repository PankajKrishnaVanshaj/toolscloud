// components/PDFComparisonTool.jsx
'use client'
import React, { useState, useCallback } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

const PDFComparisonTool = () => {
  const [files, setFiles] = useState({ original: null, modified: null })
  const [numPages, setNumPages] = useState({ original: null, modified: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [comparisonMode, setComparisonMode] = useState('side-by-side')
  const [showDifferences, setShowDifferences] = useState(true)
  const [zoom, setZoom] = useState(1.0)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (type) => (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'application/pdf') {
      setFiles(prev => ({ ...prev, [type]: file }))
    }
  }

  const onDocumentLoadSuccess = (type) => ({ numPages }) => {
    setNumPages(prev => ({ ...prev, [type]: numPages }))
  }

  const changePage = (offset) => {
    setCurrentPage(prev => Math.min(
      Math.max(1, prev + offset),
      Math.min(numPages.original || Infinity, numPages.modified || Infinity)
    ))
  }

  const renderPDF = (file, type) => (
    <Document
      file={file}
      onLoadSuccess={onDocumentLoadSuccess(type)}
      className="border rounded-lg overflow-hidden"
    >
      <Page
        pageNumber={currentPage}
        scale={zoom}
        renderAnnotationLayer={false}
        renderTextLayer={comparisonMode === 'text'}
        className={showDifferences && type === 'modified' ? 'difference-highlight' : ''}
      />
    </Document>
  )

  const comparePDFs = useCallback(async () => {
    if (!files.original || !files.modified) return
    
    setIsLoading(true)
    // Simulate PDF comparison - in a real implementation, this would:
    // 1. Extract text/images from both PDFs
    // 2. Compare content
    // 3. Generate difference data
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
  }, [files])

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Comparison Tool</h1>

        {/* File Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Original PDF
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange('original')}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modified PDF
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange('modified')}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        {/* Comparison Settings */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comparison Mode
              </label>
              <select
                value={comparisonMode}
                onChange={(e) => setComparisonMode(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="side-by-side">Side by Side</option>
                <option value="overlay">Overlay</option>
                <option value="text">Text Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zoom
              </label>
              <input
                type="number"
                value={zoom}
                onChange={(e) => setZoom(Math.max(0.1, Math.min(2.0, e.target.value)))}
                step="0.1"
                min="0.1"
                max="2.0"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showDifferences}
                  onChange={(e) => setShowDifferences(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Highlight Differences</span>
              </label>
            </div>
          </div>
        </div>

        {/* PDF Display */}
        {files.original && files.modified && (
          <div className="mb-6">
            <div className={`grid gap-4 ${
              comparisonMode === 'side-by-side' ? 'grid-cols-2' : 'grid-cols-1'
            }`}>
              {comparisonMode !== 'overlay' ? (
                <>
                  <div className="relative">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Original</h3>
                    {renderPDF(files.original, 'original')}
                  </div>
                  <div className="relative">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Modified</h3>
                    {renderPDF(files.modified, 'modified')}
                  </div>
                </>
              ) : (
                <div className="relative">
                  <div className="relative">
                    {renderPDF(files.original, 'original')}
                    <div className="absolute top-0 left-0 opacity-50">
                      {renderPDF(files.modified, 'modified')}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="mt-4 flex justify-center items-center space-x-4">
              <button
                onClick={() => changePage(-1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {currentPage} of {Math.min(numPages.original || 0, numPages.modified || 0)}
              </span>
              <button
                onClick={() => changePage(1)}
                disabled={currentPage === Math.min(numPages.original || 0, numPages.modified || 0)}
                className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Compare Button */}
        <button
          onClick={comparePDFs}
          disabled={!files.original || !files.modified || isLoading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Comparing...' : 'Compare PDFs'}
        </button>
      </div>

      {/* Custom CSS for difference highlighting */}
      <style jsx>{`
        .difference-highlight {
          background-color: rgba(255, 0, 0, 0.1);
          position: relative;
        }
        .difference-highlight::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border: 2px solid rgba(255, 0, 0, 0.3);
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

export default PDFComparisonTool