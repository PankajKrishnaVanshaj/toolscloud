// app/components/PDFPageNumberer.jsx
'use client'
import React, { useState } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

const PDFPageNumberer = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [previewPage, setPreviewPage] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [numberingSettings, setNumberingSettings] = useState({
    position: 'bottom-right',
    fontSize: 12,
    fontFamily: 'Arial',
    color: '#000000',
    startNumber: 1,
    format: 'number',
    prefix: '',
    suffix: '',
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
    const { name, value, type, checked } = e.target
    setNumberingSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const addPageNumbers = async () => {
    if (!file) return
    
    setIsProcessing(true)
    try {
      // This is where actual PDF numbering logic would go
      // For demo, we'll simulate processing and download original file
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = `numbered_${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Page numbering failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Page Numberer</h1>

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

        {/* Numbering Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position
            </label>
            <select
              name="position"
              value={numberingSettings.position}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="top-left">Top Left</option>
              <option value="top-center">Top Center</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-center">Bottom Center</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size (pt)
            </label>
            <input
              type="number"
              name="fontSize"
              value={numberingSettings.fontSize}
              onChange={handleSettingsChange}
              min="6"
              max="72"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Family
            </label>
            <select
              name="fontFamily"
              value={numberingSettings.fontFamily}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Courier">Courier</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <input
              type="color"
              name="color"
              value={numberingSettings.color}
              onChange={handleSettingsChange}
              className="w-full h-10 p-1 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Number
            </label>
            <input
              type="number"
              name="startNumber"
              value={numberingSettings.startNumber}
              onChange={handleSettingsChange}
              min="1"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number Format
            </label>
            <select
              name="format"
              value={numberingSettings.format}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="number">1, 2, 3...</option>
              <option value="roman">I, II, III...</option>
              <option value="letter">A, B, C...</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prefix
            </label>
            <input
              type="text"
              name="prefix"
              value={numberingSettings.prefix}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
              placeholder="e.g., Page "
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suffix
            </label>
            <input
              type="text"
              name="suffix"
              value={numberingSettings.suffix}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
              placeholder="e.g., /10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Range
            </label>
            <select
              name="pageRange"
              value={numberingSettings.pageRange}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Pages</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {numberingSettings.pageRange === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Range (e.g., 1-5, 7)
              </label>
              <input
                type="text"
                name="customRange"
                value={numberingSettings.customRange}
                onChange={handleSettingsChange}
                className="w-full p-2 border rounded-md"
                placeholder="e.g., 1-5, 7"
              />
            </div>
          )}
        </div>

        {/* Preview */}
        {file && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Preview</h2>
            <div className="border p-4 bg-gray-50 rounded-md relative">
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

        {/* Process Button */}
        <button
          onClick={addPageNumbers}
          disabled={!file || isProcessing}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Add Page Numbers and Download'}
        </button>
      </div>
    </div>
  )
}

export default PDFPageNumberer