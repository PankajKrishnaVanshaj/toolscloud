'use client'
import React, { useState } from 'react'

const FileNameGenerator = () => {
  const [fileNames, setFileNames] = useState([])
  const [count, setCount] = useState(10)
  const [prefix, setPrefix] = useState('')
  const [suffix, setSuffix] = useState('')
  const [extension, setExtension] = useState('.txt')
  const [includeDate, setIncludeDate] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // Sample words for file name generation
  const words = [
    'document', 'report', 'image', 'data', 'project',
    'backup', 'log', 'config', 'test', 'output'
  ]

  const generateFileNames = () => {
    const newFileNames = Array.from({ length: Math.min(count, 1000) }, () => {
      const randomWord = words[Math.floor(Math.random() * words.length)]
      const randomNum = Math.floor(Math.random() * 1000)
      const datePart = includeDate 
        ? `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_`
        : ''
      
      return `${prefix}${datePart}${randomWord}${randomNum}${suffix}${extension}`
    })
    
    setFileNames(newFileNames)
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    const text = fileNames.join('\n')
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const text = fileNames.join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `filenames-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearFileNames = () => {
    setFileNames([])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          File Name Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of File Names (1-1000)
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(1000, Number(e.target.value))))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prefix (optional)
            </label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., user_"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suffix (optional)
            </label>
            <input
              type="text"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., _v1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Extension
            </label>
            <select
              value={extension}
              onChange={(e) => setExtension(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value=".txt">.txt</option>
              <option value=".csv">.csv</option>
              <option value=".jpg">.jpg</option>
              <option value=".png">.png</option>
              <option value=".pdf">.pdf</option>
              <option value=".docx">.docx</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeDate"
              checked={includeDate}
              onChange={(e) => setIncludeDate(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeDate" className="ml-2 block text-sm text-gray-700">
              Include Date (YYYYMMDD)
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateFileNames}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate File Names
          </button>

          {fileNames.length > 0 && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isCopied
                    ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                    : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
                }`}
              >
                {isCopied ? 'Copied!' : 'Copy to Clipboard'}
              </button>

              <button
                onClick={downloadAsText}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download as TXT
              </button>

              <button
                onClick={clearFileNames}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {fileNames.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated File Names ({fileNames.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <ul className="list-decimal list-inside text-gray-800 font-mono">
                {fileNames.map((name, index) => (
                  <li key={index} className="py-1">{name}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileNameGenerator