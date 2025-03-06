// app/components/PDFMetadataViewer.jsx
'use client'
import React, { useState, useEffect } from 'react'
import { pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFMetadataViewer = () => {
  const [file, setFile] = useState(null)
  const [metadata, setMetadata] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editedMetadata, setEditedMetadata] = useState({})
  
  // Standard PDF metadata fields
  const metadataFields = [
    'Title',
    'Author',
    'Subject',
    'Keywords',
    'Creator',
    'Producer',
    'CreationDate',
    'ModDate'
  ]

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setError(null)
      extractMetadata(selectedFile)
    }
  }

  const extractMetadata = async (pdfFile) => {
    setIsLoading(true)
    try {
      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdf = await pdfjs.getDocument(arrayBuffer).promise
      const meta = await pdf.getMetadata()
      
      setMetadata({
        info: meta.info,
        metadata: meta.metadata
      })
      setEditedMetadata(meta.info)
    } catch (err) {
      setError('Failed to load PDF metadata: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMetadataChange = (field, value) => {
    setEditedMetadata(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const saveMetadata = async () => {
    if (!file) return
    
    setIsLoading(true)
    try {
      // This is a simplified version - actual implementation would require pdf-lib or similar
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = `metadata_updated_${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      setEditMode(false)
    } catch (err) {
      setError('Failed to save metadata: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Metadata Viewer</h1>

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

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-4 text-center text-gray-600">
            Loading metadata...
          </div>
        )}

        {/* Metadata Display/Edit */}
        {metadata && !isLoading && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Metadata</h2>
              <button
                onClick={() => setEditMode(!editMode)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editMode ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {metadataFields.map(field => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700">
                    {field}
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editedMetadata[field] || ''}
                      onChange={(e) => handleMetadataChange(field, e.target.value)}
                      className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Enter ${field}`}
                    />
                  ) : (
                    <div className="mt-1 p-2 bg-gray-50 rounded-md text-gray-700">
                      {metadata.info[field] || 'Not specified'}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Additional Metadata */}
            {metadata.metadata && (
              <div>
                <h3 className="text-md font-semibold mb-2">Extended Metadata</h3>
                <pre className="p-3 bg-gray-50 rounded-md text-sm text-gray-700 overflow-auto max-h-48">
                  {JSON.stringify(metadata.metadata, null, 2)}
                </pre>
              </div>
            )}

            {/* Save Button */}
            {editMode && (
              <button
                onClick={saveMetadata}
                disabled={isLoading}
                className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PDFMetadataViewer