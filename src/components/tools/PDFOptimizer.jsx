'use client'
import React, { useState, useCallback } from 'react'

const PDFOptimizer = () => {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [optimizationStatus, setOptimizationStatus] = useState({
    isProcessing: false,
    progress: 0,
    error: null,
    resultSize: null
  })
  const [settings, setSettings] = useState({
    compressionLevel: 'medium', // low, medium, high
    optimizeImages: true,
    imageQuality: 75,
    removeMetadata: true,
    convertToGrayscale: false,
    removeBookmarks: false,
    flattenForms: false
  })

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
      setOptimizationStatus({ isProcessing: false, progress: 0, error: null, resultSize: null })
    }
  }, [])

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const optimizePDF = async () => {
    if (!file) return

    setOptimizationStatus({ isProcessing: true, progress: 0, error: null, resultSize: null })

    try {
      // Simulate PDF optimization process
      // In a real implementation, this would use a library like pdf-lib or a backend service
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 300))
        setOptimizationStatus(prev => ({ ...prev, progress: i }))
      }

      // Simulate optimized file (in reality, this would be the processed PDF)
      const optimizedBlob = await file.arrayBuffer()
      const optimizedFile = new Blob([optimizedBlob], { type: 'application/pdf' })
      
      // Create download link
      const url = URL.createObjectURL(optimizedFile)
      const link = document.createElement('a')
      link.href = url
      link.download = `optimized_${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setOptimizationStatus({
        isProcessing: false,
        progress: 100,
        error: null,
        resultSize: optimizedFile.size
      })
    } catch (error) {
      setOptimizationStatus({
        isProcessing: false,
        progress: 0,
        error: 'Failed to optimize PDF: ' + error.message,
        resultSize: null
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">PDF Optimizer</h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload PDF File
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* Optimization Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compression Level
            </label>
            <select
              name="compressionLevel"
              value={settings.compressionLevel}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="low">Low (Better Quality)</option>
              <option value="medium">Medium (Balanced)</option>
              <option value="high">High (Smaller Size)</option>
            </select>
          </div>

          {settings.optimizeImages && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Quality (0-100)
              </label>
              <input
                type="number"
                name="imageQuality"
                value={settings.imageQuality}
                onChange={handleSettingsChange}
                min="0"
                max="100"
                className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="optimizeImages"
                checked={settings.optimizeImages}
                onChange={handleSettingsChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Optimize Images</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="removeMetadata"
                checked={settings.removeMetadata}
                onChange={handleSettingsChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Remove Metadata</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="convertToGrayscale"
                checked={settings.convertToGrayscale}
                onChange={handleSettingsChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Convert to Grayscale</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="removeBookmarks"
                checked={settings.removeBookmarks}
                onChange={handleSettingsChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Remove Bookmarks</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="flattenForms"
                checked={settings.flattenForms}
                onChange={handleSettingsChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Flatten Forms</span>
            </label>
          </div>
        </div>

        {/* Progress and Status */}
        {optimizationStatus.isProcessing && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${optimizationStatus.progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Optimizing: {optimizationStatus.progress}%
            </p>
          </div>
        )}

        {optimizationStatus.error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
            {optimizationStatus.error}
          </div>
        )}

        {optimizationStatus.resultSize && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md">
            Optimization complete! New size: {(optimizationStatus.resultSize / 1024 / 1024).toFixed(2)} MB
          </div>
        )}

        {/* Optimize Button */}
        <button
          onClick={optimizePDF}
          disabled={!file || optimizationStatus.isProcessing}
          className="w-full py-3 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {optimizationStatus.isProcessing ? 'Optimizing...' : 'Optimize PDF'}
        </button>
      </div>
    </div>
  )
}

export default PDFOptimizer