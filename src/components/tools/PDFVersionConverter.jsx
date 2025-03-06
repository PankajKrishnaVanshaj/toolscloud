// app/components/PDFVersionConverter.jsx
'use client'
import React, { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFVersionConverter = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [currentVersion, setCurrentVersion] = useState(null)
  const [targetVersion, setTargetVersion] = useState('1.7')
  const [previewPage, setPreviewPage] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [conversionOptions, setConversionOptions] = useState({
    maintainCompatibility: true,
    optimizeSize: false,
    encryptOutput: false,
    password: ''
  })

  const pdfVersions = [
    '1.0', '1.1', '1.2', '1.3', '1.4',
    '1.5', '1.6', '1.7', '1.8', '2.0'
  ]

  const onFileChange = async (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      // Detect current PDF version
      const arrayBuffer = await selectedFile.arrayBuffer()
      const pdf = await pdfjs.getDocument(arrayBuffer).promise
      const metadata = await pdf.getMetadata()
      setCurrentVersion(metadata.info.PDFVersion || 'Unknown')
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const handleOptionChange = (e) => {
    const { name, value, type, checked } = e.target
    setConversionOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const convertPDF = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      // This is a simulation - actual conversion would require server-side processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create download link (simulated converted file)
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = `converted_v${targetVersion}_${file.name}`
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
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Version Converter</h1>

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
          {currentVersion && (
            <p className="mt-2 text-sm text-gray-600">
              Current Version: {currentVersion}
            </p>
          )}
        </div>

        {/* Conversion Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target PDF Version
            </label>
            <select
              value={targetVersion}
              onChange={(e) => setTargetVersion(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {pdfVersions.map(version => (
                <option key={version} value={version}>
                  PDF {version}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Conversion Options
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="maintainCompatibility"
                checked={conversionOptions.maintainCompatibility}
                onChange={handleOptionChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Maintain Compatibility</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="optimizeSize"
                checked={conversionOptions.optimizeSize}
                onChange={handleOptionChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Optimize Size</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="encryptOutput"
                checked={conversionOptions.encryptOutput}
                onChange={handleOptionChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Encrypt Output</span>
            </label>
          </div>

          {conversionOptions.encryptOutput && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={conversionOptions.password}
                onChange={handleOptionChange}
                className="w-full p-2 border rounded-md"
                placeholder="Enter encryption password"
              />
            </div>
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
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Converting...' : 'Convert and Download'}
        </button>
      </div>
    </div>
  )
}

export default PDFVersionConverter