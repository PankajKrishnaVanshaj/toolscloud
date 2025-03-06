// app/components/PDFEncryptionTool.jsx
'use client'
import React, { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFEncryptionTool = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [previewPage, setPreviewPage] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [encryptionSettings, setEncryptionSettings] = useState({
    userPassword: '',
    ownerPassword: '',
    encryptionLevel: '128',
    permissions: {
      printing: true,
      modifying: false,
      copying: false,
      annotating: false,
    }
  })

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setEncryptionSettings(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [name]: checked
        }
      }))
    } else {
      setEncryptionSettings(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const encryptPDF = async () => {
    if (!file || !encryptionSettings.userPassword) return
    
    setIsProcessing(true)
    try {
      // Load PDF document
      const fileReader = new FileReader()
      const pdfData = await new Promise((resolve) => {
        fileReader.onload = () => resolve(fileReader.result)
        fileReader.readAsArrayBuffer(file)
      })

      const pdfDoc = await pdfjs.getDocument(pdfData).promise
      
      // Create new PDF with encryption
      const pdfBytes = await pdfDoc.save({
        userPassword: encryptionSettings.userPassword,
        ownerPassword: encryptionSettings.ownerPassword || undefined,
        permissions: {
          printing: encryptionSettings.permissions.printing ? 'highResolution' : undefined,
          modifying: encryptionSettings.permissions.modifying,
          copying: encryptionSettings.permissions.copying,
          annotating: encryptionSettings.permissions.annotating,
        },
        encryptionLevel: parseInt(encryptionSettings.encryptionLevel)
      })

      // Create download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `encrypted_${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Encryption failed:', error)
      alert('Error during encryption: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Encryption Tool</h1>

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

        {/* Encryption Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Password (Required)
            </label>
            <input
              type="password"
              name="userPassword"
              value={encryptionSettings.userPassword}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
              placeholder="Enter password to open PDF"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Owner Password (Optional)
            </label>
            <input
              type="password"
              name="ownerPassword"
              value={encryptionSettings.ownerPassword}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
              placeholder="Enter owner password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Encryption Level
            </label>
            <select
              name="encryptionLevel"
              value={encryptionSettings.encryptionLevel}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="40">40-bit RC4</option>
              <option value="128">128-bit RC4</option>
              <option value="256">256-bit AES</option>
            </select>
          </div>
        </div>

        {/* Permissions */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Permissions</h3>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="printing"
                checked={encryptionSettings.permissions.printing}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Allow Printing</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="modifying"
                checked={encryptionSettings.permissions.modifying}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Allow Modifying</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="copying"
                checked={encryptionSettings.permissions.copying}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Allow Copying</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="annotating"
                checked={encryptionSettings.permissions.annotating}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Allow Annotating</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        {file && (
          <div className="mb-6">
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
        )}

        {/* Encrypt Button */}
        <button
          onClick={encryptPDF}
          disabled={!file || !encryptionSettings.userPassword || isProcessing}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Encrypting...' : 'Encrypt and Download'}
        </button>
      </div>
    </div>
  )
}

export default PDFEncryptionTool