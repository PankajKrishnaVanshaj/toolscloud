// components/PDFSecurityAnalyzer.jsx
'use client'
import React, { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFSecurityAnalyzer = () => {
  const [file, setFile] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [previewPage, setPreviewPage] = useState(1)
  const [numPages, setNumPages] = useState(null)

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setAnalysisResult(null)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const analyzePDF = async () => {
    if (!file) return

    setIsAnalyzing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjs.getDocument(arrayBuffer).promise

      // Perform security analysis
      const metadata = await pdf.getMetadata()
      const jsActions = await pdf.getJavaScript()
      
      // Analyze encryption
      const isEncrypted = pdf.isEncrypted || false
      
      // Check for suspicious content
      const hasJavaScript = jsActions.length > 0
      const pagePromises = Array.from({ length: pdf.numPages }, (_, i) =>
        pdf.getPage(i + 1)
      )
      const pages = await Promise.all(pagePromises)
      const hasExternalLinks = pages.some(page => {
        const annotations = page.getAnnotations()
        return annotations.some(ann => ann.url || ann.unsafeUrl)
      })

      setAnalysisResult({
        fileName: file.name,
        fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        pageCount: pdf.numPages,
        isEncrypted,
        hasJavaScript,
        javascriptCount: jsActions.length,
        hasExternalLinks,
        metadata: {
          title: metadata.info?.Title,
          author: metadata.info?.Author,
          creationDate: metadata.info?.CreationDate,
          modifiedDate: metadata.info?.ModDate,
        },
        securityScore: calculateSecurityScore({
          isEncrypted,
          hasJavaScript,
          hasExternalLinks
        })
      })
    } catch (error) {
      console.error('Analysis failed:', error)
      setAnalysisResult({ error: 'Failed to analyze PDF: ' + error.message })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const calculateSecurityScore = ({ isEncrypted, hasJavaScript, hasExternalLinks }) => {
    let score = 100
    if (!isEncrypted) score -= 20
    if (hasJavaScript) score -= 30
    if (hasExternalLinks) score -= 20
    return Math.max(0, score)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Security Analyzer</h1>

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

        {/* Preview */}
        {file && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Document Preview</h2>
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

        {/* Analyze Button */}
        <button
          onClick={analyzePDF}
          disabled={!file || isAnalyzing}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed mb-6"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Security'}
        </button>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Analysis Results</h2>
            
            {analysisResult.error ? (
              <div className="p-4 bg-red-100 text-red-700 rounded-md">
                {analysisResult.error}
              </div>
            ) : (
              <>
                {/* Security Score */}
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 relative">
                    <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xl ${analysisResult.securityScore >= 70 ? 'bg-green-500' : analysisResult.securityScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                      {analysisResult.securityScore}%
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">Security Score</h3>
                    <p className="text-sm text-gray-600">Overall document security assessment</p>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">File Name</p>
                    <p className="font-medium">{analysisResult.fileName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">File Size</p>
                    <p className="font-medium">{analysisResult.fileSize}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Page Count</p>
                    <p className="font-medium">{analysisResult.pageCount}</p>
                  </div>
                </div>

                {/* Security Features */}
                <div>
                  <h3 className="font-semibold mb-2">Security Features</h3>
                  <div className="space-y-2">
                    <p className={analysisResult.isEncrypted ? 'text-green-600' : 'text-red-600'}>
                      Encryption: {analysisResult.isEncrypted ? 'Enabled' : 'Not Enabled'}
                    </p>
                    <p className={analysisResult.hasJavaScript ? 'text-red-600' : 'text-green-600'}>
                      JavaScript: {analysisResult.hasJavaScript ? `Detected (${analysisResult.javascriptCount} instances)` : 'Not Detected'}
                    </p>
                    <p className={analysisResult.hasExternalLinks ? 'text-yellow-600' : 'text-green-600'}>
                      External Links: {analysisResult.hasExternalLinks ? 'Detected' : 'Not Detected'}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div>
                  <h3 className="font-semibold mb-2">Metadata</h3>
                  <div className="space-y-2">
                    {Object.entries(analysisResult.metadata).map(([key, value]) => (
                      value && (
                        <p key={key} className="text-sm">
                          <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                          <span className="ml-2 font-medium">{value}</span>
                        </p>
                      )
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PDFSecurityAnalyzer