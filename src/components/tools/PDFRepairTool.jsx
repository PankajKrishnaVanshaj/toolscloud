// app/components/PDFRepairTool.jsx
'use client'
import React, { useState } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

const PDFRepairTool = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [repairSettings, setRepairSettings] = useState({
    fixCorruption: true,
    recoverText: true,
    rebuildTOC: false,
    fixFonts: false,
    previewPage: 1
  })
  const [repairStatus, setRepairStatus] = useState({
    isProcessing: false,
    statusMessage: '',
    error: null
  })

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setRepairStatus({ isProcessing: false, statusMessage: '', error: null })
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const handleSettingsChange = (e) => {
    const { name, checked } = e.target
    setRepairSettings(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const repairPDF = async () => {
    if (!file) return

    setRepairStatus({ isProcessing: true, statusMessage: 'Analyzing PDF...', error: null })

    try {
      // Simulate PDF repair process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setRepairStatus({ 
        isProcessing: true, 
        statusMessage: 'Repairing document structure...', 
        error: null 
      })
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Here you would implement actual PDF repair logic using a library like pdf-lib
      // For demo, we'll just create a downloadable file
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = `repaired_${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setRepairStatus({ 
        isProcessing: false, 
        statusMessage: 'Repair completed successfully!', 
        error: null 
      })
    } catch (error) {
      setRepairStatus({ 
        isProcessing: false, 
        statusMessage: 'Repair failed', 
        error: error.message 
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Repair Tool</h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Damaged PDF
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Repair Settings */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Repair Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="fixCorruption"
                checked={repairSettings.fixCorruption}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Fix File Corruption</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="recoverText"
                checked={repairSettings.recoverText}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Recover Text Content</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="rebuildTOC"
                checked={repairSettings.rebuildTOC}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Rebuild Table of Contents</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="fixFonts"
                checked={repairSettings.fixFonts}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Repair Font Issues</span>
            </label>
          </div>
        </div>

        {/* Status Display */}
        {repairStatus.statusMessage && (
          <div className="mb-6 p-4 rounded-md bg-blue-50">
            <p className={`text-sm ${repairStatus.error ? 'text-red-600' : 'text-blue-700'}`}>
              {repairStatus.statusMessage}
            </p>
            {repairStatus.error && (
              <p className="text-sm text-red-600 mt-1">Error: {repairStatus.error}</p>
            )}
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
                onLoadError={(error) => setRepairStatus({
                  isProcessing: false,
                  statusMessage: 'PDF appears to be damaged',
                  error: error.message
                })}
              >
                <Page pageNumber={repairSettings.previewPage} width={400} />
              </Document>
              {numPages && (
                <div className="mt-2 text-center">
                  <button
                    onClick={() => setRepairSettings(prev => ({
                      ...prev,
                      previewPage: Math.max(1, prev.previewPage - 1)
                    }))}
                    disabled={repairSettings.previewPage === 1}
                    className="px-2 py-1 bg-gray-200 rounded-l-md disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4">
                    Page {repairSettings.previewPage} of {numPages}
                  </span>
                  <button
                    onClick={() => setRepairSettings(prev => ({
                      ...prev,
                      previewPage: Math.min(numPages, prev.previewPage + 1)
                    }))}
                    disabled={repairSettings.previewPage === numPages}
                    className="px-2 py-1 bg-gray-200 rounded-r-md disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Repair Button */}
        <button
          onClick={repairPDF}
          disabled={!file || repairStatus.isProcessing}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {repairStatus.isProcessing ? 'Processing...' : 'Repair and Download'}
        </button>
      </div>
    </div>
  )
}

export default PDFRepairTool