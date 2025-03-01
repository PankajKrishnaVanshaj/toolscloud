'use client'
import React, { useState } from 'react'

const OTPGenerator = () => {
  const [otps, setOtps] = useState([])
  const [count, setCount] = useState(10)
  const [length, setLength] = useState(6)
  const [format, setFormat] = useState('numeric') // numeric, alphanumeric
  const [isCopied, setIsCopied] = useState(false)

  const generateOTP = () => {
    const numericChars = '0123456789'
    const alphaNumericChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const chars = format === 'numeric' ? numericChars : alphaNumericChars
    
    return Array.from({ length: Math.min(length, 12) }, () => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('')
  }

  const generateOTPs = () => {
    const newOtps = Array.from({ length: Math.min(count, 1000) }, generateOTP)
    setOtps(newOtps)
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    const text = otps.join('\n')
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const text = otps.join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `otps-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearOTPs = () => {
    setOtps([])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          OTP Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of OTPs (1-1000)
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
              OTP Length (4-12)
            </label>
            <input
              type="number"
              min="4"
              max="12"
              value={length}
              onChange={(e) => setLength(Math.max(4, Math.min(12, Number(e.target.value))))}
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
              <option value="numeric">Numeric (0-9)</option>
              <option value="alphanumeric">Alphanumeric (0-9, A-Z)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateOTPs}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate OTPs
          </button>

          {otps.length > 0 && (
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
                onClick={clearOTPs}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {otps.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated OTPs ({otps.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <ul className="list-decimal list-inside text-gray-800 font-mono">
                {otps.map((otp, index) => (
                  <li key={index} className="py-1">{otp}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Note:</strong> These are randomly generated OTPs for testing purposes only. For production use, implement secure OTP generation with proper validation.</p>
        </div>
      </div>
    </div>
  )
}

export default OTPGenerator