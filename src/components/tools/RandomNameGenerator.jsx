'use client'
import React, { useState } from 'react'

const RandomNameGenerator = () => {
  const [names, setNames] = useState([])
  const [count, setCount] = useState(1)
  const [culture, setCulture] = useState('generic') // generic, english, spanish, japanese
  const [format, setFormat] = useState('full') // full, first, last
  const [isCopied, setIsCopied] = useState(false)

  // Name data for different cultures
  const nameData = {
    generic: {
      first: ['Alex', 'Jordan', 'Taylor', 'Casey', 'Riley'],
      last: ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson']
    },
    english: {
      first: ['James', 'Emma', 'William', 'Olivia', 'Henry'],
      last: ['Thompson', 'Harris', 'Lewis', 'Clark', 'Walker']
    },
    spanish: {
      first: ['Carlos', 'Sofia', 'Juan', 'Isabella', 'Miguel'],
      last: ['Garcia', 'Martinez', 'Lopez', 'Rodriguez', 'Perez']
    },
    japanese: {
      first: ['Hiro', 'Sakura', 'Yuki', 'Aiko', 'Ren'],
      last: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe']
    }
  }

  const generateNames = () => {
    const data = nameData[culture]
    const newNames = Array.from({ length: Math.min(count, 100) }, () => {
      const first = data.first[Math.floor(Math.random() * data.first.length)]
      const last = data.last[Math.floor(Math.random() * data.last.length)]

      switch (format) {
        case 'first':
          return first
        case 'last':
          return last
        case 'full':
        default:
          return `${first} ${last}`
      }
    })

    setNames(newNames)
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    const text = names.join('\n')
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const text = names.join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `names-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearNames = () => {
    setNames([])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Random Name Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Names (1-100)
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
              Culture
            </label>
            <select
              value={culture}
              onChange={(e) => setCulture(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="generic">Generic</option>
              <option value="english">English</option>
              <option value="spanish">Spanish</option>
              <option value="japanese">Japanese</option>
            </select>
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
              <option value="full">Full Name</option>
              <option value="first">First Name Only</option>
              <option value="last">Last Name Only</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateNames}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Names
          </button>

          {names.length > 0 && (
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
                onClick={clearNames}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {names.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Names ({names.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <ul className="list-decimal list-inside text-gray-800">
                {names.map((name, index) => (
                  <li key={index} className="py-1">{name}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RandomNameGenerator