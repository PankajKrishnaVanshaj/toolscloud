// app/components/PDFTextExtractor.jsx
'use client'
import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

const PDFTextExtractor = () => {
  const [file, setFile] = useState(null)
  const [extractedText, setExtractedText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [settings, setSettings] = useState({
    pageRange: 'all',
    customRange: '',
    includeFormatting: true,
    extractImages: false,
    outputFormat: 'plain'
  })
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setExtractedText('')
      setError('')
    }
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
    setError('')

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
      let text = ''
      const totalPages = pdf.numPages
      let pagesToProcess = []

      if (settings.pageRange === 'all') {
        pagesToProcess = Array.from({ length: totalPages }, (_, i) => i + 1)
      } else {
        // Parse custom range (e.g., "1-3, 5")
        pagesToProcess = parsePageRange(settings.customRange, totalPages)
      }

      for (const pageNum of pagesToProcess) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        
        let pageText = textContent.items
          .map(item => item.str)
          .join(settings.includeFormatting ? '\n' : ' ')
        
        text += `Page ${pageNum}:\n${pageText}\n\n`
      }

      // Format output based on selection
      let formattedText = text
      if (settings.outputFormat === 'json') {
        formattedText = JSON.stringify({ text: text.split('\n\n'), extractedAt: new Date() }, null, 2)
      } else if (settings.outputFormat === 'markdown') {
        formattedText = text.replace(/Page (\d+):/g, '# Page $1')
      }

      setExtractedText(formattedText)
    } catch (err) {
      setError('Error extracting text: ' + err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const parsePageRange = (rangeStr, maxPages) => {
    const pages = new Set()
    const ranges = rangeStr.split(',')

    for (const range of ranges) {
      const trimmed = range.trim()
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(num => parseInt(num))
        for (let i = Math.max(1, start); i <= Math.min(end, maxPages); i++) {
          pages.add(i)
        }
      } else {
        const page = parseInt(trimmed)
        if (page >= 1 && page <= maxPages) pages.add(page)
      }
    }
    return Array.from(pages).sort((a, b) => a - b)
  }

  const downloadText = () => {
    if (!extractedText) return

    const extension = settings.outputFormat === 'json' ? 'json' : 
                     settings.outputFormat === 'markdown' ? 'md' : 'txt'
    const blob = new Blob([extractedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `extracted_text.${extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Text Extractor</h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload PDF File
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Extraction Settings */}
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
              <option value="plain">Plain Text</option>
              <option value="json">JSON</option>
              <option value="markdown">Markdown</option>
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
              <span className="text-sm text-gray-700">Extract Images (WIP)</span>
            </label>
          </div>
        </div>

        {/* Extract Button */}
        <button
          onClick={extractText}
          disabled={!file || isProcessing}
          className="w-full py-2 px-4 mb-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Extracting...' : 'Extract Text'}
        </button>

        {/* Results */}
        {extractedText && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Extracted Text</h2>
              <button
                onClick={downloadText}
                className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Download
              </button>
            </div>
            <textarea
              value={extractedText}
              readOnly
              className="w-full h-64 p-2 border rounded-md font-mono text-sm"
            />
          </div>
        )}

        {error && (
          <div className="text-red-600 mb-4">{error}</div>
        )}
      </div>
    </div>
  )
}

export default PDFTextExtractor