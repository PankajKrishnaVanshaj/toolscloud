// app/components/PDFThumbnailGenerator.jsx
'use client'
import React, { useState, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

// Set pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFThumbnailGenerator = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [thumbnails, setThumbnails] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [settings, setSettings] = useState({
    thumbnailWidth: 200,
    format: 'png',
    pages: 'all',
    customPages: '',
    quality: 100,
  })
  const canvasRefs = useRef([])

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile)
      setThumbnails([])
      setNumPages(null)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
    canvasRefs.current = Array(numPages).fill(null).map(() => React.createRef())
  }

  const handleSettingsChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({ ...prev, [name]: value }))
  }

  const parsePageRange = (rangeStr, maxPages) => {
    if (!rangeStr) return []
    const pages = new Set()
    rangeStr.split(',').forEach(part => {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number)
        for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
          pages.add(i)
        }
      } else {
        const num = Number(part)
        if (num >= 1 && num <= maxPages) pages.add(num)
      }
    })
    return Array.from(pages).sort((a, b) => a - b)
  }

  const generateThumbnails = async () => {
    if (!file || !numPages) return

    setIsGenerating(true)
    const pdfUrl = URL.createObjectURL(file)
    const pdf = await pdfjs.getDocument(pdfUrl).promise
    const newThumbnails = []

    const pagesToRender = settings.pages === 'all'
      ? Array.from({ length: numPages }, (_, i) => i + 1)
      : parsePageRange(settings.customPages, numPages)

    try {
      for (const pageNum of pagesToRender) {
        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 1 })
        const scale = settings.thumbnailWidth / viewport.width
        const scaledViewport = page.getViewport({ scale })

        const canvas = canvasRefs.current[pageNum - 1].current
        const context = canvas.getContext('2d')
        
        canvas.width = scaledViewport.width
        canvas.height = scaledViewport.height

        await page.render({
          canvasContext: context,
          viewport: scaledViewport
        }).promise

        newThumbnails.push({
          page: pageNum,
          dataUrl: canvas.toDataURL(`image/${settings.format}`, settings.quality / 100)
        })
      }
      setThumbnails(newThumbnails)
    } catch (error) {
      console.error('Thumbnail generation failed:', error)
    } finally {
      setIsGenerating(false)
      URL.revokeObjectURL(pdfUrl)
    }
  }

  const downloadThumbnails = () => {
    thumbnails.forEach((thumb) => {
      const link = document.createElement('a')
      link.href = thumb.dataUrl
      link.download = `thumbnail_page_${thumb.page}.${settings.format}`
      link.click()
      link.remove()
    })
  }

  const downloadZip = async () => {
    try {
      // Dynamic import of jszip only when needed
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      
      thumbnails.forEach((thumb) => {
        const base64Data = thumb.dataUrl.split(',')[1]
        zip.file(`thumbnail_page_${thumb.page}.${settings.format}`, base64Data, { base64: true })
      })

      const content = await zip.generateAsync({ type: 'blob' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(content)
      link.download = 'thumbnails.zip'
      link.click()
      link.remove()
    } catch (error) {
      console.error('Failed to create ZIP:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Thumbnail Generator</h1>

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Width (px)</label>
            <input
              type="number"
              name="thumbnailWidth"
              value={settings.thumbnailWidth}
              onChange={handleSettingsChange}
              min="50"
              max="1000"
              className="w-full p-2 border rounded-md"
              disabled={isGenerating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <select
              name="format"
              value={settings.format}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
              disabled={isGenerating}
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quality (%)</label>
            <input
              type="number"
              name="quality"
              value={settings.quality}
              onChange={handleSettingsChange}
              min="10"
              max="100"
              className="w-full p-2 border rounded-md"
              disabled={isGenerating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pages</label>
            <select
              name="pages"
              value={settings.pages}
              onChange={handleSettingsChange}
              className="w-full p-2 border rounded-md"
              disabled={isGenerating}
            >
              <option value="all">All Pages</option>
              <option value="custom">Custom Pages</option>
            </select>
          </div>

          {settings.pages === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pages (e.g., 1,3,5-7)
              </label>
              <input
                type="text"
                name="customPages"
                value={settings.customPages}
                onChange={handleSettingsChange}
                className="w-full p-2 border rounded-md"
                placeholder="e.g., 1,3,5-7"
                disabled={isGenerating}
              />
            </div>
          )}
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={generateThumbnails}
            disabled={!file || isGenerating}
            className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : 'Generate Thumbnails'}
          </button>
          {thumbnails.length > 0 && (
            <>
              <button
                onClick={downloadThumbnails}
                className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
                disabled={isGenerating}
              >
                Download All
              </button>
              <button
                onClick={downloadZip}
                className="py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                disabled={isGenerating}
              >
                Download as ZIP
              </button>
            </>
          )}
        </div>

        {thumbnails.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {thumbnails.map((thumb) => (
              <div key={thumb.page} className="border rounded-md p-2 bg-gray-50">
                <img src={thumb.dataUrl} alt={`Page ${thumb.page}`} className="w-full" />
                <p className="text-center text-sm mt-2">Page {thumb.page}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'none' }}>
          {Array.from({ length: numPages || 0 }, (_, i) => (
            <canvas key={i} ref={canvasRefs.current[i]} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default PDFThumbnailGenerator