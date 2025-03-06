// app/components/PDFToEPUB.jsx
'use client'
import React, { useState } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

const PDFToEPUB = () => {
  const [pdfFile, setPdfFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [previewPage, setPreviewPage] = useState(1)
  const [isConverting, setIsConverting] = useState(false)
  const [conversionSettings, setConversionSettings] = useState({
    includeImages: true,
    toc: true,
    chapterDetection: true,
    pageRange: 'all',
    customRange: '',
    title: '',
    author: ''
  })

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setPdfFile(selectedFile)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target
    setConversionSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const convertToEPUB = async () => {
    if (!pdfFile) return

    setIsConverting(true)
    try {
      // Simulate EPUB conversion (actual implementation would require a library like pdf2epub)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For demo: Create a blob and trigger download
      const blob = new Blob([pdfFile], { type: 'application/epub+zip' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${conversionSettings.title || 'converted'}.epub`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Conversion failed:', error)
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF to EPUB Converter</h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload PDF File
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        {/* Conversion Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={conversionSettings.title}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
              placeholder="Enter EPUB title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author
            </label>
            <input
              type="text"
              name="author"
              value={conversionSettings.author}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
              placeholder="Enter author name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Range
            </label>
            <select
              name="pageRange"
              value={conversionSettings.pageRange}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Pages</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {conversionSettings.pageRange === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Range (e.g., 1-5, 7)
              </label>
              <input
                type="text"
                name="customRange"
                value={conversionSettings.customRange}
                onChange={handleSettingsChange}
                className="w-full p-2 border rounded-md"
                placeholder="e.g., 1-5, 7"
              />
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includeImages"
                checked={conversionSettings.includeImages}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Include Images</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="toc"
                checked={conversionSettings.toc}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Generate Table of Contents</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="chapterDetection"
                checked={conversionSettings.chapterDetection}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Auto-detect Chapters</span>
            </label>
          </div>
        </div>

        {/* PDF Preview */}
        {pdfFile && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">PDF Preview</h2>
            <div className="border p-4 bg-gray-50 rounded-md">
              <Document
                file={pdfFile}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex justify-center"
              >
                <Page pageNumber={previewPage} width={400} />
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
        )}

        {/* Convert Button */}
        <button
          onClick={convertToEPUB}
          disabled={!pdfFile || isConverting}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isConverting ? 'Converting...' : 'Convert to EPUB'}
        </button>
      </div>
    </div>
  )
}

export default PDFToEPUB