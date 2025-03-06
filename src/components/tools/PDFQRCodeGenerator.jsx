// app/components/PDFQRCodeGenerator.jsx
'use client'
import React, { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { jsPDF } from 'jspdf'
import { saveAs } from 'file-saver'

// Dynamically import QRCode and extract the default export
const QRCode = dynamic(() => import('qrcode.react').then(mod => mod.default), {
  ssr: false
})

const PDFQRCodeGenerator = () => {
  const [qrValue, setQrValue] = useState('')
  const [settings, setSettings] = useState({
    size: 200,
    color: '#000000',
    bgColor: '#ffffff',
    margin: 10,
    title: '',
    position: 'center',
    pageSize: 'A4'
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const qrRef = useRef(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'qrValue') {
      setQrValue(value)
    } else {
      setSettings(prev => ({ ...prev, [name]: value }))
    }
  }

  const generatePDF = async () => {
    if (!qrValue) return

    setIsGenerating(true)
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: settings.pageSize
      })

      const canvas = qrRef.current?.querySelector('canvas')
      if (!canvas) throw new Error('QR Code canvas not found')

      const qrImage = canvas.toDataURL('image/png')

      const pageWidth = doc.internal.pageSize.getWidth()
      const qrSizeMM = settings.size / 3.78 // Convert px to mm (approx)
      let xPosition

      switch (settings.position) {
        case 'left':
          xPosition = settings.margin
          break
        case 'right':
          xPosition = pageWidth - qrSizeMM - settings.margin
          break
        default: // center
          xPosition = (pageWidth - qrSizeMM) / 2
      }

      if (settings.title) {
        doc.setFontSize(16)
        doc.text(settings.title, pageWidth / 2, 20, { align: 'center' })
      }

      doc.addImage(
        qrImage,
        'PNG',
        xPosition,
        settings.title ? 40 : 20,
        qrSizeMM,
        qrSizeMM
      )

      const pdfBlob = doc.output('blob')
      saveAs(pdfBlob, 'qrcode.pdf')
    } catch (error) {
      console.error('PDF generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF QR Code Generator</h1>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            QR Code Content
          </label>
          <input
            type="text"
            name="qrValue"
            value={qrValue}
            onChange={handleInputChange}
            placeholder="Enter URL, text, or any content"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              QR Code Size (px)
            </label>
            <input
              type="number"
              name="size"
              value={settings.size}
              onChange={handleInputChange}
              min="100"
              max="500"
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
              onChange={handleInputChange}
              min="0"
              max="50"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              QR Color
            </label>
            <input
              type="color"
              name="color"
              value={settings.color}
              onChange={handleInputChange}
              className="w-full h-10 p-1 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Color
            </label>
            <input
              type="color"
              name="bgColor"
              value={settings.bgColor}
              onChange={handleInputChange}
              className="w-full h-10 p-1 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position
            </label>
            <select
              name="position"
              value={settings.position}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Size
            </label>
            <select
              name="pageSize"
              value={settings.pageSize}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="A4">A4</option>
              <option value="Letter">Letter</option>
              <option value="A3">A3</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (optional)
            </label>
            <input
              type="text"
              name="title"
              value={settings.title}
              onChange={handleInputChange}
              placeholder="Enter title for PDF"
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        {qrValue && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Preview</h2>
            <div ref={qrRef} className="flex justify-center p-4 bg-gray-50 rounded-md">
              <QRCode
                value={qrValue}
                size={settings.size}
                fgColor={settings.color}
                bgColor={settings.bgColor}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>
        )}

        <button
          onClick={generatePDF}
          disabled={!qrValue || isGenerating}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate PDF'}
        </button>
      </div>
    </div>
  )
}

export default PDFQRCodeGenerator