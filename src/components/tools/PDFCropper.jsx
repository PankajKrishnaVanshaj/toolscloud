// app/components/PDFCropper.jsx
'use client'
import React, { useState, useCallback } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

const PDFCropper = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [cropArea, setCropArea] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  })
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 })
  const [cropSettings, setCropSettings] = useState({
    applyToAll: false,
    units: 'px',
    margins: { top: 0, right: 0, bottom: 0, left: 0 }
  })

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setCurrentPage(1)
      setCropArea({ x: 0, y: 0, width: 0, height: 0 })
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const onPageLoadSuccess = (page) => {
    setPageDimensions({
      width: page.originalWidth,
      height: page.originalHeight
    })
  }

  const handleMouseDown = (e) => {
    const rect = e.target.getBoundingClientRect()
    setCropArea({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      width: 0,
      height: 0
    })
    setIsDragging(true)
  }

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    const rect = e.target.getBoundingClientRect()
    const newWidth = e.clientX - rect.left - cropArea.x
    const newHeight = e.clientY - rect.top - cropArea.y
    
    setCropArea(prev => ({
      ...prev,
      width: Math.max(0, newWidth),
      height: Math.max(0, newHeight)
    }))
  }, [isDragging, cropArea.x, cropArea.y])

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name in cropSettings.margins) {
      setCropSettings(prev => ({
        ...prev,
        margins: { ...prev.margins, [name]: Number(value) }
      }))
    } else {
      setCropSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const cropPDF = async () => {
    if (!file) return
    
    setIsProcessing(true)
    try {
      // This is where actual PDF cropping would happen
      // For demo, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = `cropped_${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Cropping failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Cropper</h1>

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

        {/* Main Content */}
        {file && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Preview Area */}
            <div className="md:col-span-2">
              <div className="relative" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
                <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                  <Page
                    pageNumber={currentPage}
                    onLoadSuccess={onPageLoadSuccess}
                    onMouseDown={handleMouseDown}
                    renderTextLayer={false}
                  />
                </Document>
                {cropArea.width > 0 && cropArea.height > 0 && (
                  <div
                    className="absolute border-2 border-blue-500 bg-blue-200/20"
                    style={{
                      left: cropArea.x,
                      top: cropArea.y,
                      width: cropArea.width,
                      height: cropArea.height
                    }}
                  />
                )}
              </div>
              <div className="mt-2 flex justify-center space-x-4">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <span>Page {currentPage} of {numPages}</span>
                <button
                  onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                  disabled={currentPage === numPages}
                  className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Crop Settings</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="applyToAll"
                      checked={cropSettings.applyToAll}
                      onChange={handleSettingsChange}
                      className="mr-2"
                    />
                    <span className="text-sm">Apply to all pages</span>
                  </label>
                  <select
                    name="units"
                    value={cropSettings.units}
                    onChange={handleSettingsChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="px">Pixels</option>
                    <option value="in">Inches</option>
                    <option value="cm">Centimeters</option>
                  </select>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Margins</h4>
                <div className="grid grid-cols-2 gap-2">
                  {['top', 'right', 'bottom', 'left'].map(side => (
                    <div key={side}>
                      <label className="text-sm capitalize">{side}</label>
                      <input
                        type="number"
                        name={side}
                        value={cropSettings.margins[side]}
                        onChange={handleSettingsChange}
                        min="0"
                        className="w-full p-1 border rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Crop Area</h4>
                <p className="text-sm">
                  X: {cropArea.x.toFixed(0)}, Y: {cropArea.y.toFixed(0)}
                  <br />
                  W: {cropArea.width.toFixed(0)}, H: {cropArea.height.toFixed(0)}
                </p>
              </div>

              <button
                onClick={cropPDF}
                disabled={isProcessing}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Crop and Download'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PDFCropper