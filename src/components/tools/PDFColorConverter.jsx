// components/PDFColorConverter.jsx
'use client'
import React, { useState } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

const PDFColorConverter = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [previewPage, setPreviewPage] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [conversionSettings, setConversionSettings] = useState({
    mode: 'grayscale', // grayscale, blackwhite, coloradjust
    threshold: 128, // for black & white conversion
    brightness: 0,
    contrast: 0,
    saturation: 0,
    pageRange: 'all',
    customRange: ''
  })

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const handleSettingsChange = (e) => {
    const { name, value, type } = e.target
    setConversionSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }))
  }

  const convertPDF = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      // Simulate PDF conversion process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For actual implementation, you'd need to:
      // 1. Process the PDF with a library like pdf-lib
      // 2. Apply color conversions based on settings
      // 3. Generate new PDF blob

      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = `converted_${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Conversion failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Color Converter</h1>

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
              Conversion Mode
            </label>
            <select
              name="mode"
              value={conversionSettings.mode}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="grayscale">Grayscale</option>
              <option value="blackwhite">Black & White</option>
              <option value="coloradjust">Color Adjustment</option>
            </select>
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

          {conversionSettings.mode === 'blackwhite' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                B&W Threshold (0-255)
              </label>
              <input
                type="number"
                name="threshold"
                value={conversionSettings.threshold}
                onChange={handleSettingsChange}
                min="0"
                max="255"
                className="w-full p-2 border rounded-md"
              />
            </div>
          )}

          {conversionSettings.mode === 'coloradjust' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brightness (-100 to 100)
                </label>
                <input
                  type="number"
                  name="brightness"
                  value={conversionSettings.brightness}
                  onChange={handleSettingsChange}
                  min="-100"
                  max="100"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contrast (-100 to 100)
                </label>
                <input
                  type="number"
                  name="contrast"
                  value={conversionSettings.contrast}
                  onChange={handleSettingsChange}
                  min="-100"
                  max="100"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saturation (-100 to 100)
                </label>
                <input
                  type="number"
                  name="saturation"
                  value={conversionSettings.saturation}
                  onChange={handleSettingsChange}
                  min="-100"
                  max="100"
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </>
          )}
        </div>

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
          onClick={convertPDF}
          disabled={!file || isProcessing}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Convert and Download'}
        </button>
      </div>
    </div>
  )
}

export default PDFColorConverter