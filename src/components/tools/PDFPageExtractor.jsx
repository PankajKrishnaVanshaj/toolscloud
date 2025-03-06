// app/components/PDFPageExtractor.jsx
'use client'
import React, { useState, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFPageExtractor = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [selectedPages, setSelectedPages] = useState(new Set())
  const [previewPage, setPreviewPage] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [rangeInput, setRangeInput] = useState('')

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setSelectedPages(new Set())
      setPreviewPage(1)
      setRangeInput('')
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const togglePageSelection = (pageNumber) => {
    setSelectedPages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(pageNumber)) {
        newSet.delete(pageNumber)
      } else {
        newSet.add(pageNumber)
      }
      return newSet
    })
  }

  const handleRangeInput = (e) => {
    setRangeInput(e.target.value)
    const pages = parsePageRange(e.target.value, numPages)
    setSelectedPages(new Set(pages))
  }

  const parsePageRange = (range, totalPages) => {
    const pages = new Set()
    const parts = range.split(',')
    
    parts.forEach(part => {
      const trimmed = part.trim()
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(n => parseInt(n))
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
            pages.add(i)
          }
        }
      } else {
        const num = parseInt(trimmed)
        if (!isNaN(num) && num >= 1 && num <= totalPages) {
          pages.add(num)
        }
      }
    })
    return pages
  }

  const extractPages = useCallback(async () => {
    if (!file || selectedPages.size === 0) return

    setIsProcessing(true)
    try {
      const pdfBytes = await file.arrayBuffer()
      const pdfDoc = await pdfjs.getDocument(pdfBytes).promise
      const newPdfDoc = await pdfjs.createDocument()

      const sortedPages = Array.from(selectedPages).sort((a, b) => a - b)
      
      for (const pageNum of sortedPages) {
        const page = await pdfDoc.getPage(pageNum)
        await newPdfDoc.addPage(page)
      }

      const pdfBytesExtracted = await newPdfDoc.save()
      const blob = new Blob([pdfBytesExtracted], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `extracted_${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Extraction failed:', error)
      alert('An error occurred while extracting pages')
    } finally {
      setIsProcessing(false)
    }
  }, [file, selectedPages])

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Page Extractor</h1>

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

        {/* Page Selection */}
        {file && numPages && (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Range Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Range (e.g., 1-3, 5, 7-9)
                </label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={handleRangeInput}
                  placeholder="e.g., 1-3, 5, 7-9"
                  className="w-full p-2 border rounded-md"
                />
              </div>

              {/* Quick Select */}
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedPages(new Set([...Array(numPages)].map((_, i) => i + 1)))}
                  className="w-full py-2 px-4 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedPages(new Set())}
                  className="w-full py-2 px-4 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Clear Selection
                </button>
              </div>
            </div>

            {/* Page Grid */}
            <div className="mt-4 grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-64 overflow-y-auto">
              {[...Array(numPages)].map((_, index) => {
                const pageNum = index + 1
                const isSelected = selectedPages.has(pageNum)
                return (
                  <button
                    key={pageNum}
                    onClick={() => togglePageSelection(pageNum)}
                    className={`p-2 border rounded-md text-sm ${
                      isSelected 
                        ? 'bg-blue-500 text-white border-blue-600' 
                        : 'bg-white border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Preview */}
        {file && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Preview</h2>
            <div className="border p-4 bg-gray-50 rounded-md">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex justify-center"
              >
                <Page pageNumber={previewPage} width={400} />
              </Document>
              {numPages && (
                <div className="mt-2 text-center">
                  <button
                    onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                    disabled={previewPage === 1}
                    className="px-2 py-1 bg-gray-200 rounded-l-md disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4">
                    Page {previewPage} of {numPages}
                  </span>
                  <button
                    onClick={() => setPreviewPage(Math.min(numPages, previewPage + 1))}
                    disabled={previewPage === numPages}
                    className="px-2 py-1 bg-gray-200 rounded-r-md disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Extract Button */}
        <button
          onClick={extractPages}
          disabled={!file || selectedPages.size === 0 || isProcessing}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : `Extract ${selectedPages.size} Page${selectedPages.size !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  )
}

export default PDFPageExtractor