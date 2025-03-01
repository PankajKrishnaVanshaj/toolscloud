'use client'
import React, { useState } from 'react'

const TokenGenerator = () => {
  const [tokens, setTokens] = useState([])
  const [count, setCount] = useState(10)
  const [length, setLength] = useState(32)
  const [format, setFormat] = useState('alphanumeric') // alphanumeric, hex, base64
  const [separator, setSeparator] = useState('none') // none, hyphen, underscore
  const [prefix, setPrefix] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  const generateToken = () => {
    let characters
    switch (format) {
      case 'alphanumeric':
        characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        break
      case 'hex':
        characters = '0123456789ABCDEF'
        break
      case 'base64':
        characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
        break
      default:
        characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    }

    const tokenLength = Math.min(length, 128) - prefix.length
    const sep = separator === 'hyphen' ? '-' : separator === 'underscore' ? '_' : ''
    let token = prefix

    // Generate segments if separator is used, otherwise single string
    if (sep) {
      const segmentLength = Math.floor(tokenLength / 4)
      const segments = []
      for (let i = 0; i < 4; i++) {
        const remaining = tokenLength - (segments.length * segmentLength)
        const currentLength = i === 3 ? remaining : segmentLength
        if (currentLength > 0) {
          segments.push(
            Array.from({ length: currentLength }, () => 
              characters.charAt(Math.floor(Math.random() * characters.length))
            ).join('')
          )
        }
      }
      token += segments.join(sep)
    } else {
      token += Array.from({ length: tokenLength }, () => 
        characters.charAt(Math.floor(Math.random() * characters.length))
      ).join('')
    }

    return token
  }

  const generateTokens = () => {
    const newTokens = Array.from({ length: Math.min(count, 1000) }, generateToken)
    setTokens(newTokens)
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    const text = tokens.join('\n')
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const text = tokens.join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tokens-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearTokens = () => {
    setTokens([])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Token Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Tokens (1-1000)
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
              Token Length (8-128)
            </label>
            <input
              type="number"
              min="8"
              max="128"
              value={length}
              onChange={(e) => setLength(Math.max(8, Math.min(128, Number(e.target.value))))}
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
              <option value="alphanumeric">Alphanumeric (A-Z, a-z, 0-9)</option>
              <option value="hex">Hexadecimal (0-9, A-F)</option>
              <option value="base64">Base64 (A-Z, a-z, 0-9, +, /)</option>
            </select>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prefix (optional)
            </label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., token_"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateTokens}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Tokens
          </button>

          {tokens.length > 0 && (
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
                onClick={clearTokens}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {tokens.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Tokens ({tokens.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <ul className="list-decimal list-inside text-gray-800 font-mono">
                {tokens.map((token, index) => (
                  <li key={index} className="py-1 break-all">{token}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Note:</strong> These are randomly generated tokens for testing purposes only. For production use, use cryptographically secure methods.</p>
        </div>
      </div>
    </div>
  )
}

export default TokenGenerator