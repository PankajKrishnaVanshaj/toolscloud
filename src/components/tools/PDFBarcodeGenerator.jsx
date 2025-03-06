// app/components/PDFBarcodeGenerator.jsx
'use client'
import React, { useState, useRef } from 'react'
import JsBarcode from 'jsbarcode'
import { PDFDocument } from 'pdf-lib'
import { saveAs } from 'file-saver'

const PDFBarcodeGenerator = () => {
  const canvasRef = useRef(null)
  const [barcodeData, setBarcodeData] = useState({
    value: '',
    format: 'CODE128',
    width: 2,
    height: 100,
    text: true,
    fontSize: 20,
    background: '#ffffff',
    lineColor: '#000000',
    copies: 1,
    pageSize: 'A4'
  })
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const barcodeFormats = [
    'CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 
    'ITF', 'MSI', 'PHARMACODE', 'CODABAR'
  ]

  const pageSizes = {
    A4: [595.28, 841.89], // in points (1/72 inch)
    Letter: [612, 792],
    Legal: [612, 1008]
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setBarcodeData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const generatePreview = () => {
    if (!barcodeData.value) return
    
    try {
      JsBarcode(canvasRef.current, barcodeData.value, {
        format: barcodeData.format,
        width: Number(barcodeData.width),
        height: Number(barcodeData.height),
        displayValue: barcodeData.text,
        fontSize: Number(barcodeData.fontSize),
        background: barcodeData.background,
        lineColor: barcodeData.lineColor
      })
      setPreviewUrl(canvasRef.current.toDataURL())
    } catch (error) {
      console.error('Barcode generation failed:', error)
    }
  }

  const generatePDF = async () => {
    if (!barcodeData.value) return
    
    setIsGenerating(true)
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create()
      const [pageWidth, pageHeight] = pageSizes[barcodeData.pageSize]
      
      // Generate barcode image
      const canvas = canvasRef.current
      JsBarcode(canvas, barcodeData.value, {
        format: barcodeData.format,
        width: Number(barcodeData.width),
        height: Number(barcodeData.height),
        displayValue: barcodeData.text,
        fontSize: Number(barcodeData.fontSize),
        background: barcodeData.background,
        lineColor: barcodeData.lineColor
      })
      
      const barcodeImageData = canvas.toDataURL('image/png')
      const barcodeImageBytes = await fetch(barcodeImageData).then(res => res.arrayBuffer())
      const barcodeImage = await pdfDoc.embedPng(barcodeImageBytes)

      // Calculate layout
      const barcodeWidth = barcodeImage.width * 0.5
      const barcodeHeight = barcodeImage.height * 0.5
      const spacing = 20
      const itemsPerRow = Math.floor(pageWidth / (barcodeWidth + spacing))
      const rowsPerPage = Math.floor(pageHeight / (barcodeHeight + spacing))
      const itemsPerPage = itemsPerRow * rowsPerPage
      const totalPages = Math.ceil(barcodeData.copies / itemsPerPage)

      // Add barcodes to PDF
      for (let i = 0; i < barcodeData.copies; i++) {
        const pageIndex = Math.floor(i / itemsPerPage)
        const itemIndex = i % itemsPerPage
        const row = Math.floor(itemIndex / itemsPerRow)
        const col = itemIndex % itemsPerRow

        if (i % itemsPerPage === 0) {
          pdfDoc.addPage([pageWidth, pageHeight])
        }

        const page = pdfDoc.getPage(pageIndex)
        const x = col * (barcodeWidth + spacing) + spacing
        const y = pageHeight - ((row + 1) * (barcodeHeight + spacing))

        page.drawImage(barcodeImage, {
          x,
          y,
          width: barcodeWidth,
          height: barcodeHeight
        })
      }

      // Save PDF
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      saveAs(blob, `barcodes_${barcodeData.value}.pdf`)
    } catch (error) {
      console.error('PDF generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Barcode Generator</h1>

        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Barcode Value
            </label>
            <input
              type="text"
              name="value"
              value={barcodeData.value}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              placeholder="Enter barcode value"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Barcode Format
            </label>
            <select
              name="format"
              value={barcodeData.format}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            >
              {barcodeFormats.map(format => (
                <option key={format} value={format}>{format}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Width
            </label>
            <input
              type="number"
              name="width"
              value={barcodeData.width}
              onChange={handleInputChange}
              min="1"
              max="10"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height
            </label>
            <input
              type="number"
              name="height"
              value={barcodeData.height}
              onChange={handleInputChange}
              min="20"
              max="200"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size
            </label>
            <input
              type="number"
              name="fontSize"
              value={barcodeData.fontSize}
              onChange={handleInputChange}
              min="10"
              max="40"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Copies
            </label>
            <input
              type="number"
              name="copies"
              value={barcodeData.copies}
              onChange={handleInputChange}
              min="1"
              max="100"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Size
            </label>
            <select
              name="pageSize"
              value={barcodeData.pageSize}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            >
              {Object.keys(pageSizes).map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="text"
                checked={barcodeData.text}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Show Text</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Color
            </label>
            <input
              type="color"
              name="background"
              value={barcodeData.background}
              onChange={handleInputChange}
              className="w-full h-10 p-1 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Line Color
            </label>
            <input
              type="color"
              name="lineColor"
              value={barcodeData.lineColor}
              onChange={handleInputChange}
              className="w-full h-10 p-1 border rounded-md"
            />
          </div>
        </div>

        {/* Preview and Controls */}
        <div className="mb-6">
          <button
            onClick={generatePreview}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Generate Preview
          </button>
          
          <canvas ref={canvasRef} className="hidden" />
          {previewUrl && (
            <div className="border p-4 bg-gray-50 rounded-md">
              <img src={previewUrl} alt="Barcode Preview" className="mx-auto" />
            </div>
          )}
        </div>

        {/* Generate PDF Button */}
        <button
          onClick={generatePDF}
          disabled={!barcodeData.value || isGenerating}
          className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Generate PDF'}
        </button>
      </div>
    </div>
  )
}

export default PDFBarcodeGenerator