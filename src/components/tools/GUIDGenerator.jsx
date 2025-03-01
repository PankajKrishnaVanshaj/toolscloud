'use client'
import React, { useState } from 'react'

const GUIDGenerator = () => {
  const [guids, setGuids] = useState([])
  const [count, setCount] = useState(10)
  const [format, setFormat] = useState('standard') // standard, uppercase, no-dashes
  const [isCopied, setIsCopied] = useState(false)

  // Generate a version 4 UUID/GUID
  const generateGUID = () => {
    const hex = () => Math.floor(Math.random() * 16).toString(16)
    const guid = (
      Array(8).fill().map(hex).join('') + '-' +
      Array(4).fill().map(hex).join('') + '-' +
      '4' + Array(3).fill().map(hex).join('') + '-' + // Version 4
      ['8', '9', 'A', 'B'][Math.floor(Math.random() * 4)] + Array(3).fill().map(hex).join('') + '-' + // Variant
      Array(12).fill().map(hex).join('')
    )

    if (format === 'uppercase') return guid.toUpperCase()
    if (format === 'no-dashes') return guid.replace(/-/g, '')
    return guid
  }

  const generateGUIDs = () => {
    const newGuids = Array.from({ length: Math.min(count, 1000) }, generateGUID)
    setGuids(newGuids)
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    const text = guids.join('\n')
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const text = guids.join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `guids-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearGUIDs = () => {
    setGuids([])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          GUID Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of GUIDs (1-1000)
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
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="standard">Standard (e.g., 550e8400-e29b-41d4-a716-446655440000)</option>
              <option value="uppercase">Uppercase (e.g., 550E8400-E29B-41D4-A716-446655440000)</option>
              <option value="no-dashes">No Dashes (e.g., 550e8400e29b41d4a716446655440000)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateGUIDs}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate GUIDs
          </button>

          {guids.length > 0 && (
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
                onClick={clearGUIDs}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {guids.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated GUIDs ({guids.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <ul className="list-decimal list-inside text-gray-800 font-mono">
                {guids.map((guid, index) => (
                  <li key={index} className="py-1">{guid}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Note:</strong> These are randomly generated Version 4 UUIDs/GUIDs for testing purposes only.</p>
        </div>
      </div>
    </div>
  )
}

export default GUIDGenerator