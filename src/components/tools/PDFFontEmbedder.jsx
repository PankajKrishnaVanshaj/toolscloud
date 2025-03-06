// app/components/PDFFontEmbedder.jsx
'use client'
import React, { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFFontEmbedder = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [previewPage, setPreviewPage] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [embeddingSettings, setEmbeddingSettings] = useState({
    embedAll: true,
    customFonts: [],
    subsetFonts: true,
    compressionLevel: 'medium',
  })
  const [availableFonts, setAvailableFonts] = useState([
    'Arial', 'Times New Roman', 'Helvetica', 'Courier', 'Verdana',
    'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Trebuchet MS'
  ])

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
    setEmbeddingSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFontSelection = (font) => {
    setEmbeddingSettings(prev => ({
      ...prev,
      customFonts: prev.customFonts.includes(font)
        ? prev.customFonts.filter(f => f !== font)
        : [...prev.customFonts, font]
    }))
  }

  const embedFonts = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      // This is where actual font embedding would occur
      // For demo, we'll simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create download link
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = `font_embedded_${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Font embedding failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Font Embedder</h1>

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

        {/* Embedding Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compression Level
            </label>
            <select
              name="compressionLevel"
              value={embeddingSettings.compressionLevel}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="embedAll"
                checked={embeddingSettings.embedAll}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Embed All Fonts</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="subsetFonts"
                checked={embeddingSettings.subsetFonts}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Subset Fonts</span>
            </label>
          </div>

          {!embeddingSettings.embedAll && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Fonts to Embed
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                {availableFonts.map(font => (
                  <label key={font} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={embeddingSettings.customFonts.includes(font)}
                      onChange={() => handleFontSelection(font)}
                      className="mr-2"
                    />
                    <span className="text-sm">{font}</span>
                  </label>
                ))}
              </div>
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

        {/* Embed Button */}
        <button
          onClick={embedFonts}
          disabled={!file || isProcessing}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Embed Fonts and Download'}
        </button>
      </div>
    </div>
  )
}

export default PDFFontEmbedder