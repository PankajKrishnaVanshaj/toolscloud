// app/components/PDFToExcel.jsx
'use client'
import React, { useState } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

const PDFToExcel = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [previewPage, setPreviewPage] = useState(1)
  const [isConverting, setIsConverting] = useState(false)
  const [conversionSettings, setConversionSettings] = useState({
    pageRange: 'all',
    customRange: '',
    detectTables: true,
    mergeTables: false,
    outputFormat: 'xlsx',
    includeFormatting: true
  })
  const [previewData, setPreviewData] = useState(null)

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setPreviewData(null)
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

  const convertToExcel = async () => {
    if (!file) return

    setIsConverting(true)
    try {
      // Simulate PDF to Excel conversion
      // In a real implementation, you'd use a library like pdf-parse and xlsx
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate sample preview data
      const sampleData = [
        ['Header 1', 'Header 2', 'Header 3'],
        ['Data 1', 'Data 2', 'Data 3'],
        ['Data 4', 'Data 5', 'Data 6']
      ]
      setPreviewData(sampleData)

      // Create and download Excel file
      const blob = new Blob([JSON.stringify(sampleData)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `converted_${file.name.split('.')[0]}.${conversionSettings.outputFormat}`
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
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF to Excel Converter</h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload PDF File
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
        </div>

        {/* Conversion Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Output Format
            </label>
            <select
              name="outputFormat"
              value={conversionSettings.outputFormat}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="xlsx">XLSX (Excel)</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="detectTables"
                checked={conversionSettings.detectTables}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Detect Tables</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="mergeTables"
                checked={conversionSettings.mergeTables}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Merge Tables</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includeFormatting"
                checked={conversionSettings.includeFormatting}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Include Formatting</span>
            </label>
          </div>
        </div>

        {/* PDF Preview */}
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

        {/* Excel Preview */}
        {previewData && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Excel Preview</h2>
            <div className="overflow-x-auto border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody>
                  {previewData.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gray-50' : ''}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-2 border text-sm text-gray-700"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Convert Button */}
        <button
          onClick={convertToExcel}
          disabled={!file || isConverting}
          className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isConverting ? 'Converting...' : 'Convert and Download'}
        </button>
      </div>
    </div>
  )
}

export default PDFToExcel