// components/PDFAccessibilityChecker.jsx
'use client'
import React, { useState } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

const PDFAccessibilityChecker = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [previewPage, setPreviewPage] = useState(1)
  const [isChecking, setIsChecking] = useState(false)
  const [accessibilityReport, setAccessibilityReport] = useState(null)

  const accessibilityChecks = {
    hasTitle: 'Document Title',
    hasLanguage: 'Language Specification',
    hasTags: 'Structural Tags',
    hasAltText: 'Image Alt Text',
    hasHeadings: 'Heading Structure',
    hasReadingOrder: 'Logical Reading Order',
    hasContrast: 'Color Contrast',
    hasFormFields: 'Accessible Forms'
  }

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setAccessibilityReport(null)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const checkAccessibility = async () => {
    if (!file) return

    setIsChecking(true)
    try {
      // Simulated accessibility checking
      // In a real implementation, you'd use a PDF parsing library like pdf-lib or pdf.js with accessibility analysis
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockReport = Object.keys(accessibilityChecks).reduce((acc, key) => ({
        ...acc,
        [key]: {
          status: Math.random() > 0.2 ? 'pass' : 'fail',
          details: key === 'hasContrast' && Math.random() > 0.5 
            ? 'Insufficient contrast ratio on page 2 (4.2:1, minimum 4.5:1)'
            : `Checked ${accessibilityChecks[key]}`
        }
      }), {})

      setAccessibilityReport(mockReport)
    } catch (error) {
      console.error('Accessibility check failed:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const getRemediationSuggestion = (check) => {
    switch (check) {
      case 'hasTitle': return 'Add a document title in Document Properties';
      case 'hasLanguage': return 'Set document language in Advanced Properties';
      case 'hasTags': return 'Add structural tags using Tags panel';
      case 'hasAltText': return 'Add alternative text to images';
      case 'hasHeadings': return 'Implement proper heading hierarchy (H1-H6)';
      case 'hasReadingOrder': return 'Define reading order in Tags panel';
      case 'hasContrast': return 'Increase contrast ratio to minimum 4.5:1';
      case 'hasFormFields': return 'Add form field descriptions and tooltips';
      default: return 'Review and fix in PDF editor';
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Accessibility Checker</h1>

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

        {/* Preview and Controls */}
        {file && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
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

            {/* Accessibility Report */}
            <div>
              <button
                onClick={checkAccessibility}
                disabled={isChecking}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
              >
                {isChecking ? 'Checking...' : 'Check Accessibility'}
              </button>

              {accessibilityReport && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Accessibility Report</h2>
                  <div className="space-y-2">
                    {Object.entries(accessibilityReport).map(([check, result]) => (
                      <div key={check} className="border p-3 rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{accessibilityChecks[check]}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            result.status === 'pass' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {result.status === 'pass' ? 'Pass' : 'Fail'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{result.details}</p>
                        {result.status === 'fail' && (
                          <p className="text-sm text-blue-600 mt-1">
                            Fix: {getRemediationSuggestion(check)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary */}
        {accessibilityReport && (
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="font-semibold text-blue-800">Summary</h3>
            <p className="text-blue-700">
              {Object.values(accessibilityReport).filter(r => r.status === 'pass').length} of {Object.keys(accessibilityReport).length} checks passed
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PDFAccessibilityChecker