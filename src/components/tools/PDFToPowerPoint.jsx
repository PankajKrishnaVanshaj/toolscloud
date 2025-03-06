// app/components/PDFToPowerPoint.jsx
'use client'
import React, { useState } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

const PDFToPowerPoint = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [previewPage, setPreviewPage] = useState(1)
  const [isConverting, setIsConverting] = useState(false)
  const [conversionSettings, setConversionSettings] = useState({
    slidePerPage: true,
    includeNotes: false,
    template: 'default',
    transition: 'none',
    customRange: '',
    pageRange: 'all'
  })

  // Handle file upload
  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
    }
  }

  // Handle PDF load success
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  // Handle settings changes
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target
    setConversionSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Convert PDF to PowerPoint
  const convertToPowerPoint = async () => {
    if (!file) return

    setIsConverting(true)
    try {
      // Simulate conversion process
      // In a real implementation, this would use a library like pptxgenjs
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create a blob for demo purposes (in reality, this would be a .pptx file)
      const blob = new Blob([file], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `converted_${file.name.replace('.pdf', '.pptx')}`
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
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF to PowerPoint Converter</h1>

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

        {/* Conversion Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slide Layout
            </label>
            <select
              name="slidePerPage"
              value={conversionSettings.slidePerPage}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value={true}>One Slide per Page</option>
              <option value={false}>Fit Content</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slide Template
            </label>
            <select
              name="template"
              value={conversionSettings.template}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="default">Default</option>
              <option value="modern">Modern</option>
              <option value="professional">Professional</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transition Effect
            </label>
            <select
              name="transition"
              value={conversionSettings.transition}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="none">None</option>
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
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

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includeNotes"
                checked={conversionSettings.includeNotes}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Include Speaker Notes</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        {file && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Slide Preview</h2>
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
                    Slide {previewPage} of {numPages}
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
          onClick={convertToPowerPoint}
          disabled={!file || isConverting}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isConverting ? 'Converting...' : 'Convert and Download'}
        </button>
      </div>
    </div>
  )
}

export default PDFToPowerPoint