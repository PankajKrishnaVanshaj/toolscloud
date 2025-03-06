// app/components/PDFOCRTool.jsx
'use client'
import React, { useState } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

const PDFOCRTool = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [previewPage, setPreviewPage] = useState(1)
  const [ocrText, setOcrText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [settings, setSettings] = useState({
    language: 'eng',
    pageRange: 'all',
    customRange: '',
    outputFormat: 'text'
  })

  const languageOptions = [
    { value: 'eng', label: 'English' },
    { value: 'spa', label: 'Spanish' },
    { value: 'fra', label: 'French' },
    { value: 'deu', label: 'German' },
    { value: 'ita', label: 'Italian' }
  ]

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setOcrText('')
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const handleSettingsChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const performOCR = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      // Note: Actual OCR would require a library like Tesseract.js or a backend service
      // This is a simulation of the OCR process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulated OCR result
      const simulatedText = `Extracted text from ${file.name}\nPage ${previewPage}\nLanguage: ${settings.language}\n\nSample OCR content goes here...`
      setOcrText(simulatedText)
    } catch (error) {
      console.error('OCR failed:', error)
      setOcrText('Error performing OCR')
    } finally {
      setIsProcessing(false)
    }
  }

  const exportResult = () => {
    if (!ocrText) return

    let blob
    switch (settings.outputFormat) {
      case 'text':
        blob = new Blob([ocrText], { type: 'text/plain' })
        break
      case 'pdf':
        // Would need pdf-lib or similar library for real PDF creation
        blob = new Blob([ocrText], { type: 'application/pdf' })
        break
      case 'docx':
        // Would need docx library for real DOCX creation
        blob = new Blob([ocrText], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
        break
    }

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ocr_result_${file?.name.split('.')[0]}.${settings.outputFormat}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF OCR Tool</h1>

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              name="language"
              value={settings.language}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              {languageOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

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
              <option value="text">Plain Text (.txt)</option>
              <option value="pdf">PDF (.pdf)</option>
              <option value="docx">Word (.docx)</option>
            </select>
          </div>

          {settings.pageRange === 'custom' && (
            <div className="md:col-span-3">
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
        </div>

        {/* Preview and Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* PDF Preview */}
          {file && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Preview</h2>
              <div className="border p-4 bg-gray-50 rounded-md">
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="flex justify-center"
                >
                  <Page pageNumber={previewPage} width={300} />
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

          {/* OCR Results */}
          <div>
            <h2 className="text-lg font-semibold mb-2">OCR Results</h2>
            <textarea
              value={ocrText}
              readOnly
              className="w-full h-64 p-2 border rounded-md resize-none"
              placeholder="OCR results will appear here after processing..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={performOCR}
            disabled={!file || isProcessing}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Perform OCR'}
          </button>
          <button
            onClick={exportResult}
            disabled={!ocrText || isProcessing}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Export Result
          </button>
        </div>
      </div>
    </div>
  )
}

export default PDFOCRTool