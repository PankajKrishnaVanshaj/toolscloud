// app/components/PDFBatchConverter.jsx
'use client'
import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

const PDFBatchConverter = () => {
  const [files, setFiles] = useState([])
  const [conversionSettings, setConversionSettings] = useState({
    outputFormat: 'docx',
    quality: 100,
    mergeOutput: false,
    includeAnnotations: true,
  })
  const [conversionProgress, setConversionProgress] = useState({})
  const [isConverting, setIsConverting] = useState(false)

  // Handle file drop
  const onDrop = useCallback((acceptedFiles) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf')
    setFiles(prev => [...prev, ...pdfFiles.map(file => ({
      file,
      status: 'pending',
      preview: URL.createObjectURL(file)
    }))])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true
  })

  // Handle settings change
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target
    setConversionSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Remove file from list
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Simulate conversion process
  const convertFiles = async () => {
    if (!files.length) return

    setIsConverting(true)
    setConversionProgress({})

    try {
      for (let i = 0; i < files.length; i++) {
        setConversionProgress(prev => ({
          ...prev,
          [i]: 0
        }))

        // Simulate conversion progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 300))
          setConversionProgress(prev => ({
            ...prev,
            [i]: progress
          }))
        }

        // Update file status
        setFiles(prev => prev.map((file, idx) => 
          idx === i ? { ...file, status: 'completed' } : file
        ))

        // Create download link (simulated)
        const url = URL.createObjectURL(files[i].file)
        const link = document.createElement('a')
        link.href = url
        link.download = `${files[i].file.name.split('.')[0]}.${conversionSettings.outputFormat}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Conversion failed:', error)
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Batch Converter</h1>

        {/* Dropzone */}
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-6 mb-6 text-center ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-gray-600">
            {isDragActive 
              ? 'Drop the PDF files here...' 
              : 'Drag & drop PDF files here, or click to select files'}
          </p>
          <p className="text-sm text-gray-500 mt-2">Supports multiple PDF files</p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Selected Files</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {files.map((fileObj, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <span className="text-sm truncate flex-1">{fileObj.file.name}</span>
                  <div className="flex items-center space-x-2">
                    {conversionProgress[index] !== undefined && (
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${conversionProgress[index]}%` }}
                        />
                      </div>
                    )}
                    <span className="text-sm text-gray-600">
                      {fileObj.status === 'completed' ? 'Done' : 'Pending'}
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                      disabled={isConverting}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversion Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Output Format
            </label>
            <select
              name="outputFormat"
              value={conversionSettings.outputFormat}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
              disabled={isConverting}
            >
              <option value="docx">Word (.docx)</option>
              <option value="png">Image (.png)</option>
              <option value="jpg">Image (.jpg)</option>
              <option value="txt">Text (.txt)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality (%)
            </label>
            <input
              type="number"
              name="quality"
              value={conversionSettings.quality}
              onChange={handleSettingsChange}
              min="10"
              max="100"
              className="w-full p-2 border rounded-md"
              disabled={isConverting}
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="mergeOutput"
                checked={conversionSettings.mergeOutput}
                onChange={handleSettingsChange}
                className="mr-2"
                disabled={isConverting}
              />
              <span className="text-sm text-gray-700">Merge into single file</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includeAnnotations"
                checked={conversionSettings.includeAnnotations}
                onChange={handleSettingsChange}
                className="mr-2"
                disabled={isConverting}
              />
              <span className="text-sm text-gray-700">Include annotations</span>
            </label>
          </div>
        </div>

        {/* Convert Button */}
        <button
          onClick={convertFiles}
          disabled={!files.length || isConverting}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isConverting ? 'Converting...' : 'Convert and Download'}
        </button>
      </div>
    </div>
  )
}

export default PDFBatchConverter