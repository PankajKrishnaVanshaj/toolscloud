'use client'
import React, { useState } from 'react'

const APIKeyGenerator = () => {
  const [apiKeys, setApiKeys] = useState([])
  const [count, setCount] = useState(10)
  const [length, setLength] = useState(32)
  const [format, setFormat] = useState('alphanumeric') // alphanumeric, hex, base64
  const [prefix, setPrefix] = useState('api_')
  const [isCopied, setIsCopied] = useState(false)

  const generateAPIKey = () => {
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

    const keyLength = Math.min(length, 128) - prefix.length
    let key = prefix
    for (let i = 0; i < keyLength; i++) {
      key += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return key
  }

  const generateAPIKeys = () => {
    const newApiKeys = Array.from({ length: Math.min(count, 1000) }, generateAPIKey)
    setApiKeys(newApiKeys)
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    const text = apiKeys.join('\n')
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const text = apiKeys.join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `api-keys-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearAPIKeys = () => {
    setApiKeys([])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          API Key Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Keys (1-1000)
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
              Key Length (8-128)
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
              <option value="alphanumeric">Alphanumeric (A-Z, 0-9)</option>
              <option value="hex">Hexadecimal (0-9, A-F)</option>
              <option value="base64">Base64 (A-Z, a-z, 0-9, +, /)</option>
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
              placeholder="e.g., api_"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateAPIKeys}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Keys
          </button>

          {apiKeys.length > 0 && (
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
                onClick={clearAPIKeys}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {apiKeys.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated API Keys ({apiKeys.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <ul className="list-decimal list-inside text-gray-800 font-mono">
                {apiKeys.map((key, index) => (
                  <li key={index} className="py-1 break-all">{key}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Note:</strong> These are randomly generated API keys for testing purposes only. They should not be used in production environments without proper security measures.</p>
        </div>
      </div>
    </div>
  )
}

export default APIKeyGenerator