'use client'
import React, { useState } from 'react'

const RandomAddressGenerator = () => {
  const [addresses, setAddresses] = useState([])
  const [count, setCount] = useState(1)
  const [country, setCountry] = useState('us') // us, uk, generic
  const [includeZip, setIncludeZip] = useState(true)
  const [isCopied, setIsCopied] = useState(false)

  // Sample data for address generation
  const addressData = {
    us: {
      streets: ['Main St', 'Oak Ave', 'Pine Rd', 'Cedar Ln', 'Maple Dr'],
      cities: ['Springfield', 'Riverside', 'Fairview', 'Hillsboro', 'Lakewood'],
      states: ['CA', 'TX', 'NY', 'FL', 'IL'],
      zipFormat: () => `${Math.floor(Math.random() * 90000) + 10000}`
    },
    uk: {
      streets: ['High St', 'Church Rd', 'Station Ln', 'Park Ave', 'Green Way'],
      cities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Bristol'],
      states: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
      zipFormat: () => {
        const parts = [
          String.fromCharCode(65 + Math.floor(Math.random() * 26)),
          String.fromCharCode(65 + Math.floor(Math.random() * 26)),
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
          String.fromCharCode(65 + Math.floor(Math.random() * 26)),
          String.fromCharCode(65 + Math.floor(Math.random() * 26))
        ]
        return `${parts[0]}${parts[1]}${parts[2]} ${parts[3]}${parts[4]}${parts[5]}`
      }
    },
    generic: {
      streets: ['Central St', 'North Rd', 'South Ave', 'West Ln', 'East Dr'],
      cities: ['Metropolis', 'Gotham', 'Star City', 'Emerald Town', 'Silver City'],
      states: ['Region A', 'Region B', 'Region C'],
      zipFormat: () => `${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 900) + 100}`
    }
  }

  const generateAddresses = () => {
    const data = addressData[country]
    const newAddresses = Array.from({ length: Math.min(count, 100) }, () => {
      const number = Math.floor(Math.random() * 999) + 1
      const street = data.streets[Math.floor(Math.random() * data.streets.length)]
      const city = data.cities[Math.floor(Math.random() * data.cities.length)]
      const state = data.states[Math.floor(Math.random() * data.states.length)]
      const zip = includeZip ? data.zipFormat() : ''

      return country === 'uk'
        ? `${number} ${street}\n${city}\n${state}${zip ? '\n' + zip : ''}`
        : `${number} ${street}\n${city}, ${state}${zip ? ' ' + zip : ''}`
    })

    setAddresses(newAddresses)
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    const text = addresses.join('\n\n')
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const text = addresses.join('\n\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `addresses-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearAddresses = () => {
    setAddresses([])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Random Address Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Addresses (1-100)
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
              Country Format
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="us">United States</option>
              <option value="uk">United Kingdom</option>
              <option value="generic">Generic</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeZip"
              checked={includeZip}
              onChange={(e) => setIncludeZip(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeZip" className="ml-2 block text-sm text-gray-700">
              Include ZIP/Postal Code
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateAddresses}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Addresses
          </button>

          {addresses.length > 0 && (
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
                onClick={clearAddresses}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {addresses.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Addresses ({addresses.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <div className="space-y-4">
                {addresses.map((address, index) => (
                  <pre key={index} className="text-sm text-gray-800 whitespace-pre-wrap">
                    {address}
                  </pre>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RandomAddressGenerator