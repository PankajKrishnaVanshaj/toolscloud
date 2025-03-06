// app/components/ImageToPDF.jsx
'use client'
import React, { useState, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const ImageToPDF = () => {
  const [images, setImages] = useState([])
  const [pdfUrl, setPdfUrl] = useState(null)
  const [settings, setSettings] = useState({
    pageSize: 'A4',
    orientation: 'portrait',
    quality: 80,
    margin: 10,
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef(null)

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const validImages = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
    )
    
    Promise.all(validImages.map(file => 
      new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve({ file, preview: e.target.result })
        reader.readAsDataURL(file)
      })
    )).then(newImages => {
      setImages(prev => [...prev, ...newImages])
    })
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSettingsChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({ ...prev, [name]: value }))
  }

  const convertToPDF = async () => {
    if (images.length === 0) return

    setIsProcessing(true)
    try {
      const { PDFDocument } = await import('pdf-lib')
      const pdfDoc = await PDFDocument.create()
      
      for (const image of images) {
        const imgBuffer = await image.file.arrayBuffer()
        let pdfImage
        
        if (image.file.type === 'image/jpeg') {
          pdfImage = await pdfDoc.embedJpg(imgBuffer)
        } else if (image.file.type === 'image/png') {
          pdfImage = await pdfDoc.embedPng(imgBuffer)
        }

        const page = pdfDoc.addPage()
        const { width, height } = getPageDimensions()
        
        const imgDims = scaleDimensions(
          pdfImage.width,
          pdfImage.height,
          width - settings.margin * 2,
          height - settings.margin * 2
        )

        page.drawImage(pdfImage, {
          x: settings.margin + (width - imgDims.width) / 2,
          y: settings.margin + (height - imgDims.height) / 2,
          width: imgDims.width,
          height: imgDims.height,
        })
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)

      // Download option
      const link = document.createElement('a')
      link.href = url
      link.download = 'converted-images.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Conversion failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getPageDimensions = () => {
    const sizes = {
      A4: settings.orientation === 'portrait' ? [595.28, 841.89] : [841.89, 595.28],
      Letter: settings.orientation === 'portrait' ? [612, 792] : [792, 612],
    }
    return { width: sizes[settings.pageSize][0], height: sizes[settings.pageSize][1] }
  }

  const scaleDimensions = (width, height, maxWidth, maxHeight) => {
    const ratio = Math.min(maxWidth / width, maxHeight / height)
    return { width: width * ratio, height: height * ratio }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Image to PDF Converter</h1>

        {/* Image Upload */}
        <div className="mb-6">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Upload Images
          </button>
          <p className="text-sm text-gray-500 mt-2">Supports multiple images (max 10MB each)</p>
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-md"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Size
            </label>
            <select
              name="pageSize"
              value={settings.pageSize}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="A4">A4</option>
              <option value="Letter">Letter</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Orientation
            </label>
            <select
              name="orientation"
              value={settings.orientation}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality (%)
            </label>
            <input
              type="number"
              name="quality"
              value={settings.quality}
              onChange={handleSettingsChange}
              min="10"
              max="100"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Margin (mm)
            </label>
            <input
              type="number"
              name="margin"
              value={settings.margin}
              onChange={handleSettingsChange}
              min="0"
              max="50"
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        {/* Convert Button */}
        <button
          onClick={convertToPDF}
          disabled={images.length === 0 || isProcessing}
          className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Converting...' : 'Convert to PDF'}
        </button>

        {/* PDF Preview */}
        {pdfUrl && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">PDF Preview</h2>
            <div className="border p-4 bg-gray-50 rounded-md">
              <Document file={pdfUrl}>
                <Page pageNumber={1} width={400} />
              </Document>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageToPDF