// app/components/PDFLinkExtractor.jsx
'use client'
import React, { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFLinkExtractor = () => {
  const [file, setFile] = useState(null)
  const [links, setLinks] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [filter, setFilter] = useState('')
  const [settings, setSettings] = useState({
    extractEmails: true,
    extractURLs: true,
    includeText: false
  })
  const [previewPage, setPreviewPage] = useState(1)
  const [numPages, setNumPages] = useState(null)

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      extractLinks(selectedFile)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const extractLinks = async (pdfFile) => {
    setIsProcessing(true)
    setLinks([])
    
    try {
      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdf = await pdfjs.getDocument(arrayBuffer).promise
      const extractedLinks = []

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const annotations = await page.getAnnotations()

        // Extract from text content
        const text = textContent.items.map(item => item.str).join(' ')
        
        if (settings.extractURLs) {
          const urlRegex = /(https?:\/\/[^\s]+)/g
          const urls = text.match(urlRegex) || []
          urls.forEach(url => extractedLinks.push({
            type: 'URL',
            value: url,
            page: i,
            context: settings.includeText ? text.substring(Math.max(0, text.indexOf(url) - 20), text.indexOf(url) + url.length + 20) : ''
          }))
        }

        if (settings.extractEmails) {
          const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
          const emails = text.match(emailRegex) || []
          emails.forEach(email => extractedLinks.push({
            type: 'Email',
            value: email,
            page: i,
            context: settings.includeText ? text.substring(Math.max(0, text.indexOf(email) - 20), text.indexOf(email) + email.length + 20) : ''
          }))
        }

        // Extract from annotations (clickable links)
        annotations.forEach(anno => {
          if (anno.url) {
            extractedLinks.push({
              type: 'URL',
              value: anno.url,
              page: i,
              context: 'Annotation Link'
            })
          }
        })
      }

      setLinks(extractedLinks)
    } catch (error) {
      console.error('Link extraction failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSettingsChange = (e) => {
    const { name, checked } = e.target
    setSettings(prev => ({ ...prev, [name]: checked }))
  }

  const exportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Type,Value,Page,Context\n"
      + filteredLinks.map(link => `${link.type},${link.value},${link.page},"${link.context}"`).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "extracted_links.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredLinks = links.filter(link => 
    link.value.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Link Extractor</h1>

        {/* File Upload */}
        <div className="mb-6">
          <input
            type="file"
            accept=".pdf"
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Settings */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="extractURLs"
              checked={settings.extractURLs}
              onChange={handleSettingsChange}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Extract URLs</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="extractEmails"
              checked={settings.extractEmails}
              onChange={handleSettingsChange}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Extract Emails</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="includeText"
              checked={settings.includeText}
              onChange={handleSettingsChange}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Include Context</span>
          </label>
        </div>

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
                  <span className="px-4">Page {previewPage} of {numPages}</span>
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

        {/* Links Display */}
        {links.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Extracted Links ({filteredLinks.length})</h2>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Export to CSV
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Filter links..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-2 mb-4 border rounded-md"
            />

            <div className="max-h-96 overflow-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Value</th>
                    <th className="px-6 py-3">Page</th>
                    {settings.includeText && <th className="px-6 py-3">Context</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredLinks.map((link, index) => (
                    <tr key={index} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{link.type}</td>
                      <td className="px-6 py-4">
                        <a href={link.type === 'URL' ? link.value : `mailto:${link.value}`} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-blue-600 hover:underline"
                        >
                          {link.value}
                        </a>
                      </td>
                      <td className="px-6 py-4">{link.page}</td>
                      {settings.includeText && <td className="px-6 py-4">{link.context}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="text-center text-gray-600">Processing PDF...</div>
        )}
      </div>
    </div>
  )
}

export default PDFLinkExtractor