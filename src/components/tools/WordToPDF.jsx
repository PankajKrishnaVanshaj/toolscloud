// app/components/WordToPDF.jsx
'use client'
import React, { useState } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

const WordToPDF = () => {
  const [file, setFile] = useState(null)
  const [convertedPDF, setConvertedPDF] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [previewPage, setPreviewPage] = useState(1)
  const [isConverting, setIsConverting] = useState(false)
  const [conversionSettings, setConversionSettings] = useState({
    includeComments: true,
    includeTrackChanges: false,
    pageOrientation: 'portrait',
    pageSize: 'A4',
  })

  const acceptedFileTypes = [
    '.doc',
    '.docx',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && acceptedFileTypes.includes(selectedFile.type) || 
        acceptedFileTypes.some(ext => selectedFile.name.endsWith(ext))) {
      setFile(selectedFile)
      setConvertedPDF(null)
    } else {
      alert('Please upload a valid Word document (.doc or .docx)')
    }
  }

  const onPDFLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target
    setConversionSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const convertToPDF = async () => {
    if (!file) return

    setIsConverting(true)
    try {
      // This is a simulation of the conversion process
      // In a real implementation, you'd need a backend service
      await new Promise(resolve => setTimeout(resolve, 2000))

      // For demo purposes, we'll create a blob
      const blob = await file.arrayBuffer()
      const pdfBlob = new Blob([blob], { type: 'application/pdf' })
      const pdfUrl = URL.createObjectURL(pdfBlob)
      
      setConvertedPDF(pdfUrl)

      // Create download link
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `${file.name.split('.')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Conversion failed:', error)
      alert('Error converting file. Please try again.')
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Word to PDF Converter</h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Word Document
          </label>
          <input
            type="file"
            accept=".doc,.docx"
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Conversion Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Orientation
            </label>
            <select
              name="pageOrientation"
              value={conversionSettings.pageOrientation}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Size
            </label>
            <select
              name="pageSize"
              value={conversionSettings.pageSize}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="A4">A4</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includeComments"
                checked={conversionSettings.includeComments}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Include Comments</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includeTrackChanges"
                checked={conversionSettings.includeTrackChanges}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Include Track Changes</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        {convertedPDF && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">PDF Preview</h2>
            <div className="border p-4 bg-gray-50 rounded-md">
              <Document
                file={convertedPDF}
                onLoadSuccess={onPDFLoadSuccess}
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
          onClick={convertToPDF}
          disabled={!file || isConverting}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isConverting ? 'Converting...' : 'Convert to PDF'}
        </button>

        {file && !convertedPDF && (
          <p className="mt-2 text-sm text-gray-600">
            Uploaded: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>
    </div>
  )
}

export default WordToPDF