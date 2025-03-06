// app/components/EPUBToPDF.jsx
'use client'
import React, { useState } from 'react'

const EPUBToPDF = () => {
  const [file, setFile] = useState(null)
  const [conversionSettings, setConversionSettings] = useState({
    pageSize: 'A4',
    fontSize: 12,
    margins: 20,
    includeImages: true,
    includeMetadata: true,
  })
  const [progress, setProgress] = useState(0)
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState(null)

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/epub+zip') {
      setFile(selectedFile)
      setError(null)
    } else {
      setError('Please upload a valid EPUB file')
      setFile(null)
    }
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
    setError(null)
    setProgress(0)

    try {
      // Simulate conversion process
      // In a real implementation, you'd use a library like epubjs and pdfkit
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setProgress(i)
      }

      // Create a blob for demo purposes
      // In reality, this would be the converted PDF
      const blob = new Blob([file], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${file.name.replace('.epub', '')}_converted.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (err) {
      setError('Conversion failed: ' + err.message)
    } finally {
      setIsConverting(false)
      setProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">EPUB to PDF Converter</h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload EPUB File
          </label>
          <input
            type="file"
            accept=".epub,application/epub+zip"
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={isConverting}
          />
        </div>

        {/* Conversion Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Size
            </label>
            <select
              name="pageSize"
              value={conversionSettings.pageSize}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
              disabled={isConverting}
            >
              <option value="A4">A4</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size (pt)
            </label>
            <input
              type="number"
              name="fontSize"
              value={conversionSettings.fontSize}
              onChange={handleSettingsChange}
              min="8"
              max="24"
              className="w-full p-2 border rounded-md"
              disabled={isConverting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Margins (mm)
            </label>
            <input
              type="number"
              name="margins"
              value={conversionSettings.margins}
              onChange={handleSettingsChange}
              min="0"
              max="50"
              className="w-full p-2 border rounded-md"
              disabled={isConverting}
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includeImages"
                checked={conversionSettings.includeImages}
                onChange={handleSettingsChange}
                className="mr-2"
                disabled={isConverting}
              />
              <span className="text-sm text-gray-700">Include Images</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includeMetadata"
                checked={conversionSettings.includeMetadata}
                onChange={handleSettingsChange}
                className="mr-2"
                disabled={isConverting}
              />
              <span className="text-sm text-gray-700">Include Metadata</span>
            </label>
          </div>
        </div>

        {/* Progress Bar */}
        {isConverting && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">Converting: {progress}%</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Convert Button */}
        <button
          onClick={convertToPDF}
          disabled={!file || isConverting}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isConverting ? 'Converting...' : 'Convert to PDF'}
        </button>
      </div>
    </div>
  )
}

export default EPUBToPDF