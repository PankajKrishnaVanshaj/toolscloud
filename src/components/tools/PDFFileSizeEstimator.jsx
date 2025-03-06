// components/PDFFileSizeEstimator.jsx
'use client'
import React, { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFFileSizeEstimator = () => {
  const [file, setFile] = useState(null)
  const [pdfStats, setPdfStats] = useState(null)
  const [compressionLevel, setCompressionLevel] = useState(50)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      analyzePDF(selectedFile)
    }
  }

  const analyzePDF = async (pdfFile) => {
    setIsAnalyzing(true)
    try {
      // Get file size
      const fileSizeMB = (pdfFile.size / (1024 * 1024)).toFixed(2)
      
      // Load PDF for analysis
      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdf = await pdfjs.getDocument(arrayBuffer).promise
      const numPages = pdf.numPages

      // Estimate content breakdown (simplified)
      const estimatedStats = {
        originalSize: fileSizeMB,
        pageCount: numPages,
        images: Math.min(Math.round(fileSizeMB * 0.7), 50), // Rough estimation
        text: Math.min(Math.round(fileSizeMB * 0.2), 20),
        metadata: Math.min(Math.round(fileSizeMB * 0.1), 10),
        estimatedCompressedSize: (fileSizeMB * (1 - compressionLevel / 100)).toFixed(2)
      }

      setPdfStats(estimatedStats)
    } catch (error) {
      console.error('PDF analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const formatSize = (size) => `${size} MB`

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF File Size Estimator</h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload PDF File
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={onFileChange}
            disabled={isAnalyzing}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:file:bg-gray-200 disabled:cursor-not-allowed"
          />
        </div>

        {/* Compression Level Slider */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Compression Level: {compressionLevel}%
          </label>
          <input
            type="range"
            min="0"
            max="90"
            value={compressionLevel}
            onChange={(e) => {
              setCompressionLevel(e.target.value)
              if (file && pdfStats) {
                setPdfStats(prev => ({
                  ...prev,
                  estimatedCompressedSize: (prev.originalSize * (1 - e.target.value / 100)).toFixed(2)
                }))
              }
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Analysis Results */}
        {isAnalyzing && (
          <div className="text-center text-gray-600 mb-6">Analyzing PDF...</div>
        )}

        {pdfStats && !isAnalyzing && (
          <div className="space-y-6">
            {/* Size Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800">Original Size</h3>
                <p className="text-2xl font-bold text-blue-900">{formatSize(pdfStats.originalSize)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-800">Estimated Compressed Size</h3>
                <p className="text-2xl font-bold text-green-900">{formatSize(pdfStats.estimatedCompressedSize)}</p>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Content Breakdown</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pages</span>
                  <span className="font-medium">{pdfStats.pageCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Images (~{Math.round(pdfStats.images / pdfStats.originalSize * 100)}%)</span>
                  <span className="font-medium">{formatSize(pdfStats.images)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Text (~{Math.round(pdfStats.text / pdfStats.originalSize * 100)}%)</span>
                  <span className="font-medium">{formatSize(pdfStats.text)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Metadata (~{Math.round(pdfStats.metadata / pdfStats.originalSize * 100)}%)</span>
                  <span className="font-medium">{formatSize(pdfStats.metadata)}</span>
                </div>
              </div>
            </div>

            {/* Size Visualization */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Size Visualization</h2>
              <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden flex">
                <div 
                  style={{ width: `${(pdfStats.images / pdfStats.originalSize) * 100}%` }}
                  className="h-full bg-blue-500"
                  title={`Images: ${formatSize(pdfStats.images)}`}
                ></div>
                <div 
                  style={{ width: `${(pdfStats.text / pdfStats.originalSize) * 100}%` }}
                  className="h-full bg-green-500"
                  title={`Text: ${formatSize(pdfStats.text)}`}
                ></div>
                <div 
                  style={{ width: `${(pdfStats.metadata / pdfStats.originalSize) * 100}%` }}
                  className="h-full bg-yellow-500"
                  title={`Metadata: ${formatSize(pdfStats.metadata)}`}
                ></div>
              </div>
              <div className="mt-2 flex justify-between text-sm text-gray-600">
                <span>Images</span>
                <span>Text</span>
                <span>Metadata</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PDFFileSizeEstimator