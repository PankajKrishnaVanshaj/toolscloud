'use client'
import React, { useState } from 'react'

const RandomPINGenerator = () => {
  const [pins, setPins] = useState([])
  const [count, setCount] = useState(10)
  const [length, setLength] = useState(4)
  const [allowDuplicates, setAllowDuplicates] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const generatePINs = () => {
    const newPins = []
    
    for (let i = 0; i < Math.min(count, 1000); i++) {
      let pin = ''
      const digits = allowDuplicates 
        ? null 
        : Array.from({ length: 10 }, (_, i) => i)
      
      for (let j = 0; j < Math.min(length, 20); j++) {
        if (allowDuplicates) {
          pin += Math.floor(Math.random() * 10)
        } else {
          const randomIndex = Math.floor(Math.random() * digits.length)
          pin += digits[randomIndex]
          digits.splice(randomIndex, 1)
          if (digits.length === 0) break // Stop if we run out of unique digits
        }
      }
      newPins.push(pin)
    }
    
    setPins(newPins)
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    const text = pins.join('\n')
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const blob = new Blob([pins.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pins-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearPins = () => {
    setPins([])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Random PIN Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of PINs (1-1000)
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
              PIN Length (1-20)
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={length}
              onChange={(e) => setLength(Math.max(1, Math.min(20, Number(e.target.value))))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowDuplicates"
              checked={allowDuplicates}
              onChange={(e) => setAllowDuplicates(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="allowDuplicates" className="ml-2 block text-sm text-gray-700">
              Allow duplicate digits within PIN
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generatePINs}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate PINs
          </button>

          {pins.length > 0 && (
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
                onClick={clearPins}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {pins.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated PINs ({pins.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800">
                {pins.map((pin, index) => (
                  <div key={index} className="py-1">
                    {index + 1}. {pin}
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

export default RandomPINGenerator