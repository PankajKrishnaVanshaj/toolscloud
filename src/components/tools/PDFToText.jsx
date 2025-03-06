// app/components/PDFToText.jsx
'use client'
import React, { useState } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import { pdfjs } from 'react-pdf'

// Set worker for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFToText = () => {
  const [file, setFile] = useState(null)
  const [extractedText, setExtractedText] = useState('')
  const [numPages, setNumPages] = useState(null)
  const [previewPage, setPreviewPage] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [settings, setSettings] = useState({
    pageRange: 'all',
    customRange: '',
    includeFormatting: true,
    extractImages: false,
    outputFormat: 'plain'
  })

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setExtractedText('')
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const extractText = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      const pdfData = await file.arrayBuffer()
      const pdf = await pdfjs.getDocument({ data: pdfData }).promise
      
      let text = ''
      let pagesToProcess = []
      
      if (settings.pageRange === 'all') {
        pagesToProcess = Array.from({ length: pdf.numPages }, (_, i) => i + 1)
      } else {
        // Parse custom range (e.g., "1-3, 5")
        pagesToProcess = settings.customRange.split(',')
          .flatMap(range => {
            if (range.includes('-')) {
              const [start, end] = range.split('-').map(Number)
              return Array.from({ length: end - start + 1 }, (_, i) => start + i)
            }
            return [Number(range)]
          })
          .filter(page => page >= 1 && page <= pdf.numPages)
      }

      for (const pageNum of pagesToProcess) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        
        const pageText = textContent.items
          .map(item => item.str)
          .join(settings.includeFormatting ? ' ' : '')
        
        text += (settings.includeFormatting ? `\n\nPage ${pageNum}:\n` : '') + pageText
      }

      setExtractedText(text.trim())
    } catch (error) {
      console.error('Text extraction failed:', error)
      setExtractedText('Error extracting text from PDF')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${file.name.split('.')[0]}_extracted.${settings.outputFormat === 'plain' ? 'txt' : 'md'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF to Text Converter</h1>

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

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Range
            </label>
            <select
              name="pageRange"
              value={settings.pageRange}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Pages</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {settings.pageRange === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Range (e.g., 1-5, 7)
              </label>
              <input
                type="text"
                name="customRange"
                value={settings.customRange}
                onChange={handleSettingsChange}
                className="w-full p-2 border rounded-md"
                placeholder="e.g., 1-5, 7"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Output Format
            </label>
            <select
              name="outputFormat"
              value={settings.outputFormat}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="plain">Plain Text (.txt)</option>
              <option value="markdown">Markdown (.md)</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includeFormatting"
                checked={settings.includeFormatting}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Preserve Formatting</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="extractImages"
                checked={settings.extractImages}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Extract Images (Beta)</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        {file && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">PDF Preview</h2>
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

        {/* Extracted Text */}
        {extractedText && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Extracted Text</h2>
            <textarea
              value={extractedText}
              readOnly
              className="w-full h-48 p-2 border rounded-md bg-gray-50"
            />
          </div>
        )}

        {/* Controls */}
        <div className="flex space-x-4">
          <button
            onClick={extractText}
            disabled={!file || isProcessing}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Extracting...' : 'Extract Text'}
          </button>
          {extractedText && (
            <button
              onClick={downloadText}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Download Text
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PDFToText