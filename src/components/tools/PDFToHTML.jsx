// app/components/PDFToHTML.jsx
'use client'
import React, { useState } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

const PDFToHTML = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [previewPage, setPreviewPage] = useState(1)
  const [htmlPreview, setHtmlPreview] = useState('')
  const [isConverting, setIsConverting] = useState(false)
  const [conversionSettings, setConversionSettings] = useState({
    includeImages: true,
    extractText: true,
    preserveFormatting: true,
    pageRange: 'all',
    customRange: '',
    cssStyling: 'basic'
  })

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setHtmlPreview('')
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target
    setConversionSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const convertToHTML = async () => {
    if (!file) return

    setIsConverting(true)
    try {
      // Simulate PDF to HTML conversion
      // In a real implementation, you'd use a library like pdf2json or a backend service
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock HTML generation based on settings
      let generatedHTML = '<!DOCTYPE html><html><head><title>Converted PDF</title>'
      if (conversionSettings.cssStyling !== 'none') {
        generatedHTML += `
          <style>
            body {
              font-family: Arial, sans-serif;
              ${conversionSettings.cssStyling === 'modern' ? 'max-width: 800px; margin: 0 auto; padding: 20px;' : ''}
            }
            .page { 
              margin-bottom: 20px;
              ${conversionSettings.preserveFormatting ? 'white-space: pre-wrap;' : ''}
            }
          </style>`
      }
      generatedHTML += '</head><body>'

      const pagesToConvert = conversionSettings.pageRange === 'custom' && conversionSettings.customRange
        ? parsePageRange(conversionSettings.customRange, numPages)
        : Array.from({ length: numPages }, (_, i) => i + 1)

      pagesToConvert.forEach(pageNum => {
        generatedHTML += `<div class="page">`
        if (conversionSettings.extractText) {
          generatedHTML += `<h2>Page ${pageNum}</h2><p>Sample text content from page ${pageNum}</p>`
        }
        if (conversionSettings.includeImages) {
          generatedHTML += `<img src="placeholder-image.jpg" alt="Page ${pageNum} image" />`
        }
        generatedHTML += `</div>`
      })

      generatedHTML += '</body></html>'
      setHtmlPreview(generatedHTML)

      // Create download
      const blob = new Blob([generatedHTML], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${file.name.split('.pdf')[0]}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Conversion failed:', error)
      setHtmlPreview('Error during conversion')
    } finally {
      setIsConverting(false)
    }
  }

  const parsePageRange = (rangeStr, maxPages) => {
    const pages = new Set()
    const ranges = rangeStr.split(',')
    ranges.forEach(range => {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(num => parseInt(num.trim()))
        for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
          pages.add(i)
        }
      } else {
        const page = parseInt(range.trim())
        if (page >= 1 && page <= maxPages) pages.add(page)
      }
    })
    return Array.from(pages).sort((a, b) => a - b)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF to HTML Converter</h1>

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includeImages"
                checked={conversionSettings.includeImages}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Include Images</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="extractText"
                checked={conversionSettings.extractText}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Extract Text</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="preserveFormatting"
                checked={conversionSettings.preserveFormatting}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Preserve Formatting</span>
            </label>
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
            {conversionSettings.pageRange === 'custom' && (
              <input
                type="text"
                name="customRange"
                value={conversionSettings.customRange}
                onChange={handleSettingsChange}
                className="w-full p-2 border rounded-md mt-2"
                placeholder="e.g., 1-5, 7"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSS Styling
            </label>
            <select
              name="cssStyling"
              value={conversionSettings.cssStyling}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="none">None</option>
              <option value="basic">Basic</option>
              <option value="modern">Modern</option>
            </select>
          </div>
        </div>

        {/* Preview Section */}
        {file && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
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

            <div>
              <h2 className="text-lg font-semibold mb-2">HTML Preview</h2>
              <div className="border p-4 bg-gray-50 rounded-md h-[400px] overflow-auto">
                {htmlPreview ? (
                  <iframe
                    srcDoc={htmlPreview}
                    className="w-full h-full border-none"
                    title="HTML Preview"
                  />
                ) : (
                  <p className="text-gray-500">Convert to see HTML preview</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Convert Button */}
        <button
          onClick={convertToHTML}
          disabled={!file || isConverting}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isConverting ? 'Converting...' : 'Convert to HTML'}
        </button>
      </div>
    </div>
  )
}

export default PDFToHTML