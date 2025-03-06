// app/components/HTMLToPDF.jsx
'use client'
import React, { useState, useRef } from 'react'
import { jsPDF } from 'jspdf'
import { LiveProvider, LiveEditor, LivePreview } from 'react-live'

const HTMLToPDF = () => {
  const [htmlContent, setHtmlContent] = useState('<h1>Hello World</h1>')
  const [pdfSettings, setPdfSettings] = useState({
    format: 'a4',
    orientation: 'portrait',
    margin: 10,
    fontSize: 12,
    quality: 100,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const previewRef = useRef(null)

  const scope = { React } // For LivePreview

  const handleSettingsChange = (e) => {
    const { name, value } = e.target
    setPdfSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      const doc = new jsPDF({
        orientation: pdfSettings.orientation,
        unit: 'mm',
        format: pdfSettings.format,
        putOnlyUsedFonts: true,
        floatPrecision: 16
      })

      // Add content to PDF
      await doc.html(previewRef.current, {
        callback: (pdf) => {
          pdf.save('converted-document.pdf')
        },
        margin: pdfSettings.margin,
        html2canvas: {
          scale: pdfSettings.quality / 100,
          useCORS: true,
        },
        jsPDF: {
          unit: 'mm',
          format: pdfSettings.format,
          orientation: pdfSettings.orientation
        }
      })
    } catch (error) {
      console.error('PDF generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">HTML to PDF Converter</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* HTML Editor */}
          <div>
            <h2 className="text-lg font-semibold mb-2">HTML Editor</h2>
            <LiveProvider code={htmlContent} scope={scope}>
              <div className="border rounded-md overflow-hidden">
                <LiveEditor
                  onChange={(code) => setHtmlContent(code)}
                  className="h-[400px] font-mono text-sm"
                  style={{ minHeight: '400px' }}
                />
              </div>
            </LiveProvider>
          </div>

          {/* Preview */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Preview</h2>
            <div className="border p-4 bg-white rounded-md h-[400px] overflow-auto">
              <div ref={previewRef}>
                <LivePreview />
              </div>
            </div>
          </div>
        </div>

        {/* PDF Settings */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paper Format
            </label>
            <select
              name="format"
              value={pdfSettings.format}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="a4">A4</option>
              <option value="letter">Letter</option>
              <option value="legal">Legal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orientation
            </label>
            <select
              name="orientation"
              value={pdfSettings.orientation}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Margin (mm)
            </label>
            <input
              type="number"
              name="margin"
              value={pdfSettings.margin}
              onChange={handleSettingsChange}
              min="0"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Size (pt)
            </label>
            <input
              type="number"
              name="fontSize"
              value={pdfSettings.fontSize}
              onChange={handleSettingsChange}
              min="8"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quality (%)
            </label>
            <input
              type="number"
              name="quality"
              value={pdfSettings.quality}
              onChange={handleSettingsChange}
              min="10"
              max="100"
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className="mt-6 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Generate PDF'}
        </button>
      </div>
    </div>
  )
}

export default HTMLToPDF