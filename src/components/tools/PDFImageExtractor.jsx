// app/components/PDFImageExtractor.jsx
'use client'
import React, { useState, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFImageExtractor = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [images, setImages] = useState([])
  const [selectedImages, setSelectedImages] = useState(new Set())
  const [isProcessing, setIsProcessing] = useState(false)
  const [settings, setSettings] = useState({
    minWidth: 100,
    minHeight: 100,
    format: 'png'
  })

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setImages([])
      setSelectedImages(new Set())
    }
  }

  const onDocumentLoadSuccess = async ({ numPages }) => {
    setNumPages(numPages)
    await extractImages()
  }

  const extractImages = useCallback(async () => {
    if (!file) return

    setIsProcessing(true)
    const extractedImages = []

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjs.getDocument(arrayBuffer).promise

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const ops = await page.getOperatorList()
        const viewport = page.getViewport({ scale: 1.5 })

        for (let j = 0; j < ops.fnArray.length; j++) {
          if (ops.fnArray[j] === pdfjs.OPS.paintImageXObject) {
            const imgKey = ops.argsArray[j][0]
            const img = await page.objs.get(imgKey)
            
            if (img && img.width >= settings.minWidth && img.height >= settings.minHeight) {
              const canvas = document.createElement('canvas')
              canvas.width = img.width
              canvas.height = img.height
              const ctx = canvas.getContext('2d')
              ctx.putImageData(img, 0, 0)
              
              extractedImages.push({
                src: canvas.toDataURL(`image/${settings.format}`),
                page: i,
                width: img.width,
                height: img.height,
                id: `${i}-${j}`
              })
            }
          }
        }
      }

      setImages(extractedImages)
    } catch (error) {
      console.error('Image extraction failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [file, settings])

  const toggleImageSelection = (id) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const downloadImages = async () => {
    if (!images.length || !selectedImages.size) return

    setIsProcessing(true)
    const zip = new JSZip()
    
    images
      .filter(img => selectedImages.has(img.id))
      .forEach((img, index) => {
        const base64 = img.src.split(',')[1]
        zip.file(`image_page${img.page}_${index}.${settings.format}`, base64, { base64: true })
      })

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, `pdf_images_${Date.now()}.zip`)
    setIsProcessing(false)
  }

  const handleSettingsChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Image Extractor</h1>

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

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Width (px)
            </label>
            <input
              type="number"
              name="minWidth"
              value={settings.minWidth}
              onChange={handleSettingsChange}
              min="10"
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Height (px)
            </label>
            <input
              type="number"
              name="minHeight"
              value={settings.minHeight}
              onChange={handleSettingsChange}
              min="10"
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Output Format
            </label>
            <select
              name="format"
              value={settings.format}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
            </select>
          </div>
        </div>

        {/* Image Preview */}
        {isProcessing && (
          <div className="text-center mb-6">Processing PDF...</div>
        )}
        {images.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Found {images.length} Images
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {images.map((img) => (
                <div
                  key={img.id}
                  className={`relative border-2 rounded-md p-2 cursor-pointer ${
                    selectedImages.has(img.id) ? 'border-blue-500' : 'border-gray-200'
                  }`}
                  onClick={() => toggleImageSelection(img.id)}
                >
                  <img src={img.src} alt={`Page ${img.page}`} className="w-full h-auto" />
                  <p className="text-xs text-gray-600 mt-1">
                    Page {img.page} ({img.width}x{img.height})
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {images.length > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Selected: {selectedImages.size} images
            </span>
            <button
              onClick={downloadImages}
              disabled={isProcessing || !selectedImages.size}
              className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Download Selected Images'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PDFImageExtractor