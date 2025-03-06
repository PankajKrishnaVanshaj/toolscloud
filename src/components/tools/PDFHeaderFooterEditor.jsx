// components/PDFHeaderFooterEditor.jsx
'use client'
import React, { useState, useRef } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

const PDFHeaderFooterEditor = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [previewPage, setPreviewPage] = useState(1)
  const [headerSettings, setHeaderSettings] = useState({
    text: '',
    position: 'center',
    fontSize: 12,
    enabled: false,
    pageNumber: false
  })
  const [footerSettings, setFooterSettings] = useState({
    text: '',
    position: 'center',
    fontSize: 12,
    enabled: false,
    pageNumber: false
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const handleSettingsChange = (type, e) => {
    const { name, value, type: inputType, checked } = e.target
    const setter = type === 'header' ? setHeaderSettings : setFooterSettings
    
    setter(prev => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value
    }))
  }

  const applyHeaderFooter = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      // Simulate PDF processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, you'd use pdf-lib or similar to modify the PDF
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = `modified_${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Processing failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Header & Footer Editor</h1>

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

        {/* Header Settings */}
        <div className="mb-6 border p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Header Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="enabled"
                checked={headerSettings.enabled}
                onChange={(e) => handleSettingsChange('header', e)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Enable Header</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
              <input
                type="text"
                name="text"
                value={headerSettings.text}
                onChange={(e) => handleSettingsChange('header', e)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter header text"
                disabled={!headerSettings.enabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <select
                name="position"
                value={headerSettings.position}
                onChange={(e) => handleSettingsChange('header', e)}
                className="w-full p-2 border rounded-md"
                disabled={!headerSettings.enabled}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
              <input
                type="number"
                name="fontSize"
                value={headerSettings.fontSize}
                onChange={(e) => handleSettingsChange('header', e)}
                min="8"
                max="24"
                className="w-full p-2 border rounded-md"
                disabled={!headerSettings.enabled}
              />
            </div>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="pageNumber"
                checked={headerSettings.pageNumber}
                onChange={(e) => handleSettingsChange('header', e)}
                className="mr-2"
                disabled={!headerSettings.enabled}
              />
              <span className="text-sm text-gray-700">Include Page Number</span>
            </label>
          </div>
        </div>

        {/* Footer Settings */}
        <div className="mb-6 border p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Footer Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="enabled"
                checked={footerSettings.enabled}
                onChange={(e) => handleSettingsChange('footer', e)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Enable Footer</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
              <input
                type="text"
                name="text"
                value={footerSettings.text}
                onChange={(e) => handleSettingsChange('footer', e)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter footer text"
                disabled={!footerSettings.enabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <select
                name="position"
                value={footerSettings.position}
                onChange={(e) => handleSettingsChange('footer', e)}
                className="w-full p-2 border rounded-md"
                disabled={!footerSettings.enabled}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
              <input
                type="number"
                name="fontSize"
                value={footerSettings.fontSize}
                onChange={(e) => handleSettingsChange('footer', e)}
                min="8"
                max="24"
                className="w-full p-2 border rounded-md"
                disabled={!footerSettings.enabled}
              />
            </div>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="pageNumber"
                checked={footerSettings.pageNumber}
                onChange={(e) => handleSettingsChange('footer', e)}
                className="mr-2"
                disabled={!footerSettings.enabled}
              />
              <span className="text-sm text-gray-700">Include Page Number</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        {file && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Preview</h2>
            <div className="border p-4 bg-gray-50 rounded-md relative">
              {/* Header Preview */}
              {headerSettings.enabled && (
                <div 
                  className={`absolute top-2 w-full text-center text-[${headerSettings.fontSize}px]`}
                  style={{ 
                    textAlign: headerSettings.position,
                    fontSize: `${headerSettings.fontSize}px`
                  }}
                >
                  {headerSettings.text}
                  {headerSettings.pageNumber && ` - Page ${previewPage}`}
                </div>
              )}
              
              {/* PDF Document */}
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex justify-center"
              >
                <Page pageNumber={previewPage} width={600} />
              </Document>

              {/* Footer Preview */}
              {footerSettings.enabled && (
                <div 
                  className={`absolute bottom-2 w-full text-center text-[${footerSettings.fontSize}px]`}
                  style={{ 
                    textAlign: footerSettings.position,
                    fontSize: `${footerSettings.fontSize}px`
                  }}
                >
                  {footerSettings.text}
                  {footerSettings.pageNumber && ` - Page ${previewPage}`}
                </div>
              )}

              {/* Page Navigation */}
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

        {/* Apply Button */}
        <button
          onClick={applyHeaderFooter}
          disabled={!file || isProcessing}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Apply and Download'}
        </button>
      </div>
    </div>
  )
}

export default PDFHeaderFooterEditor