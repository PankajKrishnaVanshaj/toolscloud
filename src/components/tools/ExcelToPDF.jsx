// app/components/ExcelToPDF.jsx
'use client'
import React, { useState } from 'react'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

const ExcelToPDF = () => {
  const [file, setFile] = useState(null)
  const [data, setData] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [conversionSettings, setConversionSettings] = useState({
    orientation: 'portrait',
    pageSize: 'A4',
    fontSize: 12,
    includeHeaders: true,
    fitToPage: false,
    addGrid: true
  })

  // Handle file upload and parsing
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0]
    if (!uploadedFile) return

    setFile(uploadedFile)
    const reader = new FileReader()

    reader.onload = (event) => {
      const binaryStr = event.target.result
      const workbook = XLSX.read(binaryStr, { type: 'binary' })
      const firstSheet = workbook.SheetNames[0]
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet])
      setData(sheetData)
    }

    reader.readAsBinaryString(uploadedFile)
  }

  // Handle settings change
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target
    setConversionSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Convert Excel data to PDF
  const convertToPDF = () => {
    if (!file || !data.length) return

    setIsProcessing(true)
    try {
      const doc = new jsPDF({
        orientation: conversionSettings.orientation,
        unit: 'pt',
        format: conversionSettings.pageSize
      })

      // Prepare table data
      const headers = conversionSettings.includeHeaders 
        ? [Object.keys(data[0])]
        : []
      const body = data.map(obj => Object.values(obj))

      // Generate table
      doc.autoTable({
        head: headers,
        body: body,
        startY: 20,
        theme: conversionSettings.addGrid ? 'grid' : 'plain',
        styles: {
          fontSize: conversionSettings.fontSize,
          cellPadding: 5,
        },
        margin: { top: 20 },
        didDrawPage: (data) => {
          // Add title
          doc.setFontSize(18)
          doc.text('Excel to PDF Conversion', 40, 15)
        },
        tableWidth: conversionSettings.fitToPage ? 'wrap' : 'auto'
      })

      // Download the PDF
      doc.save(`converted_${file.name.split('.')[0]}.pdf`)
    } catch (error) {
      console.error('Conversion failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Excel to PDF Converter</h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Excel File (.xlsx, .xls)
          </label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
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
              name="orientation"
              value={conversionSettings.orientation}
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
              <option value="A3">A3</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size
            </label>
            <input
              type="number"
              name="fontSize"
              value={conversionSettings.fontSize}
              onChange={handleSettingsChange}
              min="8"
              max="20"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includeHeaders"
                checked={conversionSettings.includeHeaders}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Include Headers</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="fitToPage"
                checked={conversionSettings.fitToPage}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Fit to Page</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="addGrid"
                checked={conversionSettings.addGrid}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Add Grid</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        {data.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Data Preview</h2>
            <div className="max-h-64 overflow-auto border rounded-md p-4 bg-gray-50">
              <table className="w-full text-sm">
                {conversionSettings.includeHeaders && (
                  <thead>
                    <tr className="bg-gray-200">
                      {Object.keys(data[0]).map((header, index) => (
                        <th key={index} className="p-2 border">{header}</th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {data.slice(0, 5).map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b">
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex} className="p-2 border">{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 5 && (
                <p className="text-sm text-gray-600 mt-2">
                  Showing 5 of {data.length} rows
                </p>
              )}
            </div>
          </div>
        )}

        {/* Convert Button */}
        <button
          onClick={convertToPDF}
          disabled={!file || isProcessing}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Converting...' : 'Convert to PDF'}
        </button>
      </div>
    </div>
  )
}

export default ExcelToPDF