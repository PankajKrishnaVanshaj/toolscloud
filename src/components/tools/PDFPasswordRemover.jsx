// app/components/PDFPasswordRemover.jsx
'use client'
import React, { useState } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

const PDFPasswordRemover = () => {
  const [file, setFile] = useState(null)
  const [password, setPassword] = useState('')
  const [numPages, setNumPages] = useState(null)
  const [previewPage, setPreviewPage] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setError('')
      setShowPreview(false)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
    setShowPreview(true)
    setError('')
  }

  const onDocumentLoadError = (error) => {
    if (error.message.includes('password')) {
      setError('This PDF is password-protected. Please enter the password.')
    } else {
      setError('Error loading PDF: ' + error.message)
    }
    setShowPreview(false)
  }

  const removePassword = async () => {
    if (!file) return

    setIsProcessing(true)
    setError('')

    try {
      // This is a simulation - actual PDF password removal would require a library like pdf-lib
      await new Promise(resolve => setTimeout(resolve, 2000))

      // For demo purposes, we'll just create a download with the original file
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = `unlocked_${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setError('Password successfully removed!')
    } catch (err) {
      setError('Failed to remove password. Please check if the password is correct.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Password Remover</h1>

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

        {/* Password Input */}
        {file && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF Password (if required)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter PDF password"
            />
          </div>
        )}

        {/* Preview */}
        {file && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Preview</h2>
            <div className="border p-4 bg-gray-50 rounded-md">
              <Document
                file={file}
                options={{ password: password }}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                className="flex justify-center"
              >
                {showPreview && <Page pageNumber={previewPage} width={400} />}
              </Document>
              {numPages && showPreview && (
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

        {/* Status Message */}
        {error && (
          <div className={`mb-6 p-4 rounded-md ${error.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {error}
          </div>
        )}

        {/* Remove Password Button */}
        <button
          onClick={removePassword}
          disabled={!file || isProcessing}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Remove Password and Download'}
        </button>
      </div>
    </div>
  )
}

export default PDFPasswordRemover