'use client'
import React, { useState } from 'react'

const PhoneNumberGenerator = () => {
  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [count, setCount] = useState(10)
  const [country, setCountry] = useState('us') // us, uk, fr, generic
  const [format, setFormat] = useState('standard') // standard, international, digits
  const [isCopied, setIsCopied] = useState(false)

  // Phone number generation logic for different countries
  const generatePhoneNumber = () => {
    const generateDigits = (length) => 
      Array.from({ length }, () => Math.floor(Math.random() * 10)).join('')

    switch (country) {
      case 'us':
        const usArea = Math.floor(Math.random() * 900) + 100 // 100-999
        const usPrefix = Math.floor(Math.random() * 900) + 100
        const usLine = generateDigits(4)
        if (format === 'standard') return `(${usArea}) ${usPrefix}-${usLine}`
        if (format === 'international') return `+1${usArea}${usPrefix}${usLine}`
        return `${usArea}${usPrefix}${usLine}`

      case 'uk':
        const ukMobile = ['07'][Math.floor(Math.random() * 1)] // Simplified mobile prefix
        const ukNumber = generateDigits(9)
        if (format === 'standard') return `${ukMobile}${ukNumber.slice(0, 3)} ${ukNumber.slice(3)}`
        if (format === 'international') return `+44${ukMobile}${ukNumber}`
        return `${ukMobile}${ukNumber}`

      case 'fr':
        const frMobile = ['06', '07'][Math.floor(Math.random() * 2)]
        const frNumber = generateDigits(8)
        if (format === 'standard') return `${frMobile} ${frNumber.match(/.{1,2}/g).join(' ')}`
        if (format === 'international') return `+33${frMobile.slice(1)}${frNumber}`
        return `${frMobile}${frNumber}`

      case 'generic':
      default:
        const genericCode = Math.floor(Math.random() * 900) + 100
        const genericNumber = generateDigits(7)
        if (format === 'standard') return `${genericCode}-${genericNumber.slice(0, 3)}-${genericNumber.slice(3)}`
        if (format === 'international') return `+${genericCode}${genericNumber}`
        return `${genericCode}${genericNumber}`
    }
  }

  const generatePhoneNumbers = () => {
    const newPhoneNumbers = Array.from({ length: Math.min(count, 1000) }, generatePhoneNumber)
    setPhoneNumbers(newPhoneNumbers)
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    const text = phoneNumbers.join('\n')
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const text = phoneNumbers.join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `phone-numbers-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearPhoneNumbers = () => {
    setPhoneNumbers([])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Phone Number Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Phone Numbers (1-1000)
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
              Country Format
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="us">United States</option>
              <option value="uk">United Kingdom</option>
              <option value="fr">France</option>
              <option value="generic">Generic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="standard">Standard (country-specific)</option>
              <option value="international">International (+ country code)</option>
              <option value="digits">Digits Only</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generatePhoneNumbers}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Numbers
          </button>

          {phoneNumbers.length > 0 && (
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
                onClick={clearPhoneNumbers}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {phoneNumbers.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Phone Numbers ({phoneNumbers.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <ul className="list-decimal list-inside text-gray-800 font-mono">
                {phoneNumbers.map((number, index) => (
                  <li key={index} className="py-1">{number}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PhoneNumberGenerator