// app/components/PDFMetadataEditor.jsx
'use client'
import React, { useState, useEffect } from 'react'
import { pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFMetadataEditor = () => {
  const [file, setFile] = useState(null)
  const [metadata, setMetadata] = useState({
    title: '',
    author: '',
    subject: '',
    keywords: '',
    creator: '',
    producer: '',
    creationDate: '',
    modDate: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isModified, setIsModified] = useState(false)

  // Handle file upload
  const onFileChange = async (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      await loadMetadata(selectedFile)
    }
  }

  // Load PDF metadata
  const loadMetadata = async (pdfFile) => {
    try {
      setIsLoading(true)
      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
      const meta = await pdf.getMetadata()

      setMetadata({
        title: meta.info.Title || '',
        author: meta.info.Author || '',
        subject: meta.info.Subject || '',
        keywords: meta.info.Keywords || '',
        creator: meta.info.Creator || '',
        producer: meta.info.Producer || '',
        creationDate: meta.info.CreationDate || '',
        modDate: meta.info.ModDate || ''
      })
    } catch (error) {
      console.error('Error loading metadata:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle metadata changes
  const handleMetadataChange = (e) => {
    const { name, value } = e.target
    setMetadata(prev => ({
      ...prev,
      [name]: value
    }))
    setIsModified(true)
  }

  // Save modified PDF
  const savePDF = async () => {
    if (!file || !isModified) return

    setIsLoading(true)
    try {
      // Note: Actual PDF modification requires server-side processing or a library like pdf-lib
      // This is a simulation of the save process
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = `metadata_edited_${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      setIsModified(false)
    } catch (error) {
      console.error('Error saving PDF:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Metadata Editor</h1>

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

        {/* Metadata Form */}
        {file && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                value={metadata.title}
                onChange={handleMetadataChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Author</label>
              <input
                type="text"
                name="author"
                value={metadata.author}
                onChange={handleMetadataChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <input
                type="text"
                name="subject"
                value={metadata.subject}
                onChange={handleMetadataChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Keywords</label>
              <input
                type="text"
                name="keywords"
                value={metadata.keywords}
                onChange={handleMetadataChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                disabled={isLoading}
                placeholder="Separate keywords with commas"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Creator</label>
                <input
                  type="text"
                  name="creator"
                  value={metadata.creator}
                  onChange={handleMetadataChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Producer</label>
                <input
                  type="text"
                  name="producer"
                  value={metadata.producer}
                  onChange={handleMetadataChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Creation Date</label>
                <input
                  type="text"
                  name="creationDate"
                  value={metadata.creationDate}
                  onChange={handleMetadataChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Modification Date</label>
                <input
                  type="text"
                  name="modDate"
                  value={metadata.modDate}
                  onChange={handleMetadataChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        {file && (
          <button
            onClick={savePDF}
            disabled={isLoading || !isModified}
            className="mt-6 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Processing...' : 'Save Modified PDF'}
          </button>
        )}
      </div>
    </div>
  )
}

export default PDFMetadataEditor