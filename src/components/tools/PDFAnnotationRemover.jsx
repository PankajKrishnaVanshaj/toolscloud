// app/components/PDFAnnotationRemover.jsx
'use client'
import React, { useState, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFAnnotationRemover = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [annotations, setAnnotations] = useState([])
  const [selectedAnnotations, setSelectedAnnotations] = useState(new Set())
  const [isProcessing, setIsProcessing] = useState(false)
  const [settings, setSettings] = useState({
    removeAll: false,
    removeTypes: {
      text: true,
      highlight: true,
      underline: true,
      stamp: true,
    }
  })

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setCurrentPage(1)
      setAnnotations([])
      setSelectedAnnotations(new Set())
    }
  }

  const onDocumentLoadSuccess = async ({ numPages }) => {
    setNumPages(numPages)
    await loadAnnotations(1)
  }

  const loadAnnotations = useCallback(async (pageNum) => {
    if (!file) return

    const pdf = await pdfjs.getDocument(URL.createObjectURL(file)).promise
    const page = await pdf.getPage(pageNum)
    const annots = await page.getAnnotations()
    setAnnotations(annots)
  }, [file])

  const handlePageChange = async (newPage) => {
    setCurrentPage(newPage)
    await loadAnnotations(newPage)
    setSelectedAnnotations(new Set())
  }

  const toggleAnnotationSelection = (annotId) => {
    setSelectedAnnotations(prev => {
      const newSet = new Set(prev)
      if (newSet.has(annotId)) {
        newSet.delete(annotId)
      } else {
        newSet.add(annotId)
      }
      return newSet
    })
  }

  const handleSettingsChange = (e) => {
    const { name, checked } = e.target
    if (name === 'removeAll') {
      setSettings(prev => ({ ...prev, removeAll: checked }))
    } else {
      setSettings(prev => ({
        ...prev,
        removeTypes: {
          ...prev.removeTypes,
          [name]: checked
        }
      }))
    }
  }

  const removeAnnotations = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      const pdfDoc = await pdfjs.getDocument(URL.createObjectURL(file)).promise
      const newPdf = await pdfjs.createDocument()

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i)
        const annotations = await page.getAnnotations()
        
        // Filter annotations based on settings
        const annotationsToRemove = settings.removeAll 
          ? annotations
          : annotations.filter(annot => 
              (settings.removeTypes.text && annot.subtype === 'Text') ||
              (settings.removeTypes.highlight && annot.subtype === 'Highlight') ||
              (settings.removeTypes.underline && annot.subtype === 'Underline') ||
              (settings.removeTypes.stamp && annot.subtype === 'Stamp') ||
              selectedAnnotations.has(annot.id)
            )

        if (annotationsToRemove.length === 0) {
          newPdf.addPage(page)
        } else {
          // Create new page without selected annotations
          const newPage = await newPdf.addPage(page)
          const remainingAnnotations = annotations.filter(
            annot => !annotationsToRemove.some(rem => rem.id === annot.id)
          )
          await newPage.addAnnotations(remainingAnnotations)
        }
      }

      const pdfBytes = await newPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `cleaned_${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Annotation removal failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Annotation Remover</h1>

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
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Removal Settings</h2>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="removeAll"
                checked={settings.removeAll}
                onChange={handleSettingsChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Remove All Annotations</span>
            </label>
            {!settings.removeAll && (
              <div className="grid grid-cols-2 gap-2 pl-6">
                {Object.entries(settings.removeTypes).map(([type, checked]) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      name={type}
                      checked={checked}
                      onChange={handleSettingsChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 capitalize">{type}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview and Annotation Selection */}
        {file && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Preview & Select Annotations</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-2 py-1">
                  Page {currentPage} of {numPages}
                </span>
                <button
                  onClick={() => handlePageChange(Math.min(numPages, currentPage + 1))}
                  disabled={currentPage === numPages}
                  className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
            <div className="border p-4 bg-gray-50 rounded-md">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex justify-center"
              >
                <Page pageNumber={currentPage} width={600} />
              </Document>
              {annotations.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700">Annotations on this page:</h3>
                  <div className="max-h-40 overflow-y-auto">
                    {annotations.map(annot => (
                      <label key={annot.id} className="flex items-center py-1">
                        <input
                          type="checkbox"
                          checked={selectedAnnotations.has(annot.id)}
                          onChange={() => toggleAnnotationSelection(annot.id)}
                          className="mr-2"
                          disabled={settings.removeAll}
                        />
                        <span className="text-sm text-gray-600">
                          {annot.subtype} - {annot.contents?.substring(0, 30) || 'No content'}...
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Process Button */}
        <button
          onClick={removeAnnotations}
          disabled={!file || isProcessing}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Remove Annotations and Download'}
        </button>
      </div>
    </div>
  )
}

export default PDFAnnotationRemover