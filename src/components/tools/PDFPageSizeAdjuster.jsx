// app/components/PDFPageSizeAdjuster.jsx
'use client'
import React, { useState } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

const PDFPageSizeAdjuster = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [previewPage, setPreviewPage] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [sizeSettings, setSizeSettings] = useState({
    preset: 'A4',
    width: 595,  // A4 width in points (210mm)
    height: 842, // A4 height in points (297mm)
    unit: 'pt',
    maintainAspect: true,
    applyTo: 'all'
  })

  const pageSizes = {
    A4: { width: 595, height: 842 },
    Letter: { width: 612, height: 792 },
    Legal: { width: 612, height: 1008 },
    A3: { width: 842, height: 1191 },
    Custom: { width: 595, height: 842 }
  }

  const units = {
    pt: 1,
    mm: 2.83465,
    in: 72
  }

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
    const { name, value, type, checked } = e.target
    setSizeSettings(prev => {
      if (name === 'preset') {
        const { width, height } = pageSizes[value]
        return { ...prev, preset: value, width, height }
      }
      if (name === 'width' || name === 'height') {
        let newWidth = name === 'width' ? parseFloat(value) : prev.width
        let newHeight = name === 'height' ? parseFloat(value) : prev.height
        
        if (prev.maintainAspect && file) {
          const aspectRatio = prev.width / prev.height
          if (name === 'width') {
            newHeight = newWidth / aspectRatio
          } else {
            newWidth = newHeight * aspectRatio
          }
        }
        
        return { ...prev, [name]: value, width: newWidth, height: newHeight }
      }
      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }
    })
  }

  const adjustPageSize = async () => {
    if (!file) return
    
    setIsProcessing(true)
    try {
      // Simulate processing - in real implementation, use pdf-lib or similar
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = `resized_${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Page size adjustment failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const convertToPoints = (value, unit) => {
    return value * units[unit]
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Page Size Adjuster</h1>

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

        {/* Size Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Size Preset
            </label>
            <select
              name="preset"
              value={sizeSettings.preset}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              {Object.keys(pageSizes).map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit
            </label>
            <select
              name="unit"
              value={sizeSettings.unit}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="pt">Points (pt)</option>
              <option value="mm">Millimeters (mm)</option>
              <option value="in">Inches (in)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Width
            </label>
            <input
              type="number"
              name="width"
              value={Math.round(convertToPoints(sizeSettings.width, sizeSettings.unit) / units[sizeSettings.unit] * 100) / 100}
              onChange={handleSettingsChange}
              min="1"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height
            </label>
            <input
              type="number"
              name="height"
              value={Math.round(convertToPoints(sizeSettings.height, sizeSettings.unit) / units[sizeSettings.unit] * 100) / 100}
              onChange={handleSettingsChange}
              min="1"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="maintainAspect"
                checked={sizeSettings.maintainAspect}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Maintain Aspect Ratio</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apply To
            </label>
            <select
              name="applyTo"
              value={sizeSettings.applyTo}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Pages</option>
              <option value="first">First Page Only</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
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
                <Page 
                  pageNumber={previewPage} 
                  width={Math.min(400, sizeSettings.width)}
                  height={sizeSettings.height * (400 / sizeSettings.width)}
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

        {/* Adjust Button */}
        <button
          onClick={adjustPageSize}
          disabled={!file || isProcessing}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Adjust Size and Download'}
        </button>
      </div>
    </div>
  )
}

export default PDFPageSizeAdjuster