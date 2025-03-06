// app/components/PDFSignatureAdder.jsx
'use client'
import React, { useState, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFSignatureAdder = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [signature, setSignature] = useState(null)
  const [signaturePosition, setSignaturePosition] = useState({ x: 0, y: 0 })
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef(null)
  const [signatureSize, setSignatureSize] = useState(150)

  // File handling
  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  // Signature upload
  const onSignatureUpload = (event) => {
    const sigFile = event.target.files[0]
    if (sigFile && sigFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setSignature(e.target.result)
      reader.readAsDataURL(sigFile)
    }
  }

  // Drawing signature
  const startDrawing = (e) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
  }

  const draw = (e) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    setSignature(canvas.toDataURL())
  }

  // Signature positioning
  const handleSignatureDrag = (e) => {
    e.preventDefault()
    setSignaturePosition({
      x: e.nativeEvent.offsetX - signatureSize / 2,
      y: e.nativeEvent.offsetY - signatureSize / 2
    })
  }

  // Add signature and download
  const addSignatureToPDF = async () => {
    if (!file || !signature) return

    // Here you would implement actual PDF modification
    // This is a placeholder for the real implementation
    try {
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = `signed_${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error adding signature:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Signature Adder</h1>

        {/* File Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload PDF
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={onFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Signature (Image)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onSignatureUpload}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        {/* Signature Drawing */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Or Draw Signature</h2>
          <canvas
            ref={canvasRef}
            width={300}
            height={150}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            className="border border-gray-300 rounded-md bg-white"
          />
        </div>

        {/* Signature Settings */}
        {signature && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Signature Size: {signatureSize}px
            </label>
            <input
              type="range"
              min="50"
              max="300"
              value={signatureSize}
              onChange={(e) => setSignatureSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        {/* PDF Preview with Signature */}
        {file && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Preview</h2>
            <div className="relative border p-4 bg-gray-50 rounded-md">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex justify-center"
              >
                <div
                  onMouseMove={signature ? handleSignatureDrag : undefined}
                  className="relative"
                >
                  <Page pageNumber={currentPage} width={600} />
                  {signature && (
                    <img
                      src={signature}
                      alt="Signature"
                      className="absolute pointer-events-none"
                      style={{
                        left: signaturePosition.x,
                        top: signaturePosition.y,
                        width: signatureSize,
                        height: 'auto'
                      }}
                    />
                  )}
                </div>
              </Document>
              {numPages && (
                <div className="mt-2 text-center">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 bg-gray-200 rounded-l-md disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4">
                    Page {currentPage} of {numPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                    disabled={currentPage === numPages}
                    className="px-2 py-1 bg-gray-200 rounded-r-md disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Signature Button */}
        <button
          onClick={addSignatureToPDF}
          disabled={!file || !signature}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Add Signature and Download
        </button>
      </div>
    </div>
  )
}

export default PDFSignatureAdder