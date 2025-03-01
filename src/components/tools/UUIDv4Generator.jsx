'use client'
import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const UUIDv4Generator = () => {
  const [uuids, setUuids] = useState([])
  const [count, setCount] = useState(1)
  const [format, setFormat] = useState('standard') // standard, uppercase, no-dashes
  const [isCopied, setIsCopied] = useState(false)

  const generateUUIDs = () => {
    const newUuids = Array.from({ length: Math.min(count, 1000) }, () => {
      let uuid = uuidv4()
      if (format === 'uppercase') uuid = uuid.toUpperCase()
      if (format === 'no-dashes') uuid = uuid.replace(/-/g, '')
      return uuid
    })
    setUuids(newUuids)
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    const text = uuids.join('\n')
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const blob = new Blob([uuids.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `uuidv4-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearUuids = () => {
    setUuids([])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          UUID v4 Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of UUIDs (1-1000)
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
              <option value="standard">Standard (8-4-4-4-12)</option>
              <option value="uppercase">Uppercase</option>
              <option value="no-dashes">No Dashes</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateUUIDs}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate UUIDs
          </button>

          {uuids.length > 0 && (
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
                onClick={clearUuids}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {uuids.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated UUID v4 ({uuids.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800">
                {uuids.map((uuid, index) => (
                  <div key={index} className="py-1">
                    {index + 1}. {uuid}
                  </div>
                ))}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UUIDv4Generator