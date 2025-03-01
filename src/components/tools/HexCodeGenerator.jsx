'use client'
import React, { useState } from 'react'

const HexCodeGenerator = () => {
  const [hexCodes, setHexCodes] = useState([])
  const [count, setCount] = useState(1)
  const [format, setFormat] = useState('full') // full, short, uppercase
  const [isCopied, setIsCopied] = useState(null) // null or index of copied code

  const generateHexCodes = () => {
    const newHexCodes = Array.from({ length: Math.min(count, 100) }, () => {
      // Generate random 6-digit hex code
      let hex = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
      
      if (format === 'short') {
        // Simplify to 3-digit if possible (e.g., #AABBCC -> #ABC)
        if (hex[0] === hex[1] && hex[2] === hex[3] && hex[4] === hex[5]) {
          hex = hex[0] + hex[2] + hex[4]
        }
      }
      
      if (format === 'uppercase') {
        hex = hex.toUpperCase()
      }
      
      return `#${hex}`
    })
    
    setHexCodes(newHexCodes)
    setIsCopied(null)
  }

  const copyToClipboard = (index) => {
    navigator.clipboard.writeText(hexCodes[index])
      .then(() => {
        setIsCopied(index)
        setTimeout(() => setIsCopied(null), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const text = hexCodes.join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `hex-codes-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearHexCodes = () => {
    setHexCodes([])
    setIsCopied(null)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Hex Code Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Hex Codes (1-100)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
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
              <option value="full">Full (#RRGGBB)</option>
              <option value="short">Short (#RGB when possible)</option>
              <option value="uppercase">Uppercase</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateHexCodes}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Hex Codes
          </button>

          {hexCodes.length > 0 && (
            <>
              <button
                onClick={downloadAsText}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download as TXT
              </button>

              <button
                onClick={clearHexCodes}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {hexCodes.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Hex Codes ({hexCodes.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <div className="space-y-2">
                {hexCodes.map((hex, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-md border border-gray-300 flex-shrink-0" 
                      style={{ backgroundColor: hex }}
                    />
                    <span className="font-mono text-sm text-gray-800 flex-1">
                      {hex}
                    </span>
                    <button
                      onClick={() => copyToClipboard(index)}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        isCopied === index
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                    >
                      {isCopied === index ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HexCodeGenerator