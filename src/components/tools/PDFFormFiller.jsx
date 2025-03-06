// app/components/PDFFormFiller.jsx
'use client'
import React, { useState, useCallback } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

const PDFFormFiller = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [formFields, setFormFields] = useState([])
  const [selectedField, setSelectedField] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Handle file upload
  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      detectFormFields(selectedFile)
    }
  }

  // Simulate form field detection (in real app, use PDF parsing library)
  const detectFormFields = useCallback(async (pdfFile) => {
    // This is a mock implementation
    // In production, you'd use a library like pdf-lib or pdf.js to detect actual form fields
    const mockFields = [
      { id: 'name', type: 'text', page: 1, x: 100, y: 100, width: 200, value: '' },
      { id: 'email', type: 'text', page: 1, x: 100, y: 150, width: 200, value: '' },
      { id: 'agree', type: 'checkbox', page: 1, x: 100, y: 200, width: 20, value: false }
    ]
    setFormFields(mockFields)
  }, [])

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  // Handle field value changes
  const updateFieldValue = (fieldId, value) => {
    setFormFields(prev =>
      prev.map(field =>
        field.id === fieldId ? { ...field, value } : field
      )
    )
  }

  // Generate filled PDF
  const generateFilledPDF = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      // In a real implementation, you'd use pdf-lib to fill the form
      // This is a simulation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = `filled_${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDF generation failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        {/* Left Panel - Form Fields */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:col-span-1">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Form Filler</h1>
          
          {/* File Upload */}
          <div className="mb-6">
            <input
              type="file"
              accept=".pdf"
              onChange={onFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Form Fields List */}
          {formFields.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Form Fields</h2>
              {formFields.map(field => (
                <div
                  key={field.id}
                  className={`p-3 rounded-md border ${selectedField?.id === field.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  onClick={() => setSelectedField(field)}
                >
                  <label className="block text-sm font-medium text-gray-700">
                    {field.id}
                  </label>
                  {field.type === 'text' ? (
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => updateFieldValue(field.id, e.target.value)}
                      className="mt-1 w-full p-2 border rounded-md"
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => updateFieldValue(field.id, e.target.checked)}
                      className="mt-1"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Generate Button */}
          {file && (
            <button
              onClick={generateFilledPDF}
              disabled={isProcessing}
              className="w-full mt-6 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Generate Filled PDF'}
            </button>
          )}
        </div>

        {/* Right Panel - PDF Preview */}
        {file && (
          <div className="bg-white rounded-lg shadow-lg p-6 md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Preview</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  Page {currentPage} of {numPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
                  disabled={currentPage === numPages}
                  className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="relative">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                className="relative"
              >
                <Page pageNumber={currentPage} width={700} />
                {/* Render form field overlays */}
                {formFields
                  .filter(field => field.page === currentPage)
                  .map(field => (
                    <div
                      key={field.id}
                      className={`absolute border-2 ${selectedField?.id === field.id ? 'border-blue-500' : 'border-dashed border-gray-400'}`}
                      style={{
                        left: field.x,
                        top: field.y,
                        width: field.width,
                        height: field.type === 'checkbox' ? 20 : 30,
                      }}
                      onClick={() => setSelectedField(field)}
                    >
                      {field.type === 'text' && (
                        <div className="p-1 bg-white/80 text-sm">
                          {field.value || 'Enter text'}
                        </div>
                      )}
                    </div>
                  ))}
              </Document>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PDFFormFiller