'use client'
import React, { useState } from 'react'

const RandomStringGenerator = () => {
  const [strings, setStrings] = useState([])
  const [count, setCount] = useState(10)
  const [length, setLength] = useState(16)
  const [charSet, setCharSet] = useState('alphanumeric') // alphanumeric, letters, numbers, custom
  const [customChars, setCustomChars] = useState('')
  const [separator, setSeparator] = useState('none') // none, hyphen, underscore
  const [isCopied, setIsCopied] = useState(false)

  const characterSets = {
    alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789'
  }

  const generateString = () => {
    let chars = charSet === 'custom' && customChars ? customChars : characterSets[charSet]
    if (!chars) {
      chars = characterSets.alphanumeric // Fallback if custom is empty
    }

    const stringLength = Math.min(length, 128)
    const sep = separator === 'hyphen' ? '-' : separator === 'underscore' ? '_' : ''

    if (sep) {
      const segmentLength = Math.floor(stringLength / 4)
      const segments = []
      for (let i = 0; i < 4; i++) {
        const remaining = stringLength - (segments.length * segmentLength)
        const currentLength = i === 3 ? remaining : segmentLength
        if (currentLength > 0) {
          segments.push(
            Array.from({ length: currentLength }, () => 
              chars.charAt(Math.floor(Math.random() * chars.length))
            ).join('')
          )
        }
      }
      return segments.join(sep)
    } else {
      return Array.from({ length: stringLength }, () => 
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join('')
    }
  }

  const generateStrings = () => {
    const newStrings = Array.from({ length: Math.min(count, 1000) }, generateString)
    setStrings(newStrings)
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    const text = strings.join('\n')
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const text = strings.join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `strings-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearStrings = () => {
    setStrings([])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Random String Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Strings (1-1000)
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
              String Length (4-128)
            </label>
            <input
              type="number"
              min="4"
              max="128"
              value={length}
              onChange={(e) => setLength(Math.max(4, Math.min(128, Number(e.target.value))))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Character Set
            </label>
            <select
              value={charSet}
              onChange={(e) => setCharSet(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="alphanumeric">Alphanumeric (A-Z, a-z, 0-9)</option>
              <option value="letters">Letters Only (A-Z, a-z)</option>
              <option value="numbers">Numbers Only (0-9)</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {charSet === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Characters
              </label>
              <input
                type="text"
                value={customChars}
                onChange={(e) => setCustomChars(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., ABC123!@#"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Separator
            </label>
            <select
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">None</option>
              <option value="hyphen">Hyphen (-)</option>
              <option value="underscore">Underscore (_)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateStrings}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Strings
          </button>

          {strings.length > 0 && (
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
                onClick={clearStrings}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {strings.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Strings ({strings.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <ul className="list-decimal list-inside text-gray-800 font-mono">
                {strings.map((str, index) => (
                  <li key={index} className="py-1 break-all">{str}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RandomStringGenerator