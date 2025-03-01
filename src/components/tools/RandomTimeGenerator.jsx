'use client'
import React, { useState } from 'react'

const RandomTimeGenerator = () => {
  const [times, setTimes] = useState([])
  const [count, setCount] = useState(1)
  const [startHour, setStartHour] = useState(0)
  const [endHour, setEndHour] = useState(23)
  const [format, setFormat] = useState('24h') // 24h or 12h
  const [includeSeconds, setIncludeSeconds] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const generateRandomTimes = () => {
    const newTimes = Array.from({ length: Math.min(count, 1000) }, () => {
      // Generate random hours within range
      const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour
      const minute = Math.floor(Math.random() * 60)
      const second = includeSeconds ? Math.floor(Math.random() * 60) : 0

      if (format === '24h') {
        const timeParts = [
          String(hour).padStart(2, '0'),
          String(minute).padStart(2, '0'),
        ]
        if (includeSeconds) {
          timeParts.push(String(second).padStart(2, '0'))
        }
        return timeParts.join(':')
      } else {
        // 12-hour format
        const period = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        const timeParts = [
          String(displayHour).padStart(2, '0'),
          String(minute).padStart(2, '0'),
        ]
        if (includeSeconds) {
          timeParts.push(String(second).padStart(2, '0'))
        }
        return `${timeParts.join(':')} ${period}`
      }
    })
    
    setTimes(newTimes)
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    const text = times.join('\n')
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const text = times.join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `times-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearTimes = () => {
    setTimes([])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Random Time Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Times (1-1000)
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Hour (0-23)
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={startHour}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(23, Number(e.target.value)))
                  setStartHour(val)
                  if (val > endHour) setEndHour(val)
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Hour (0-23)
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={endHour}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(23, Number(e.target.value)))
                  setEndHour(val)
                  if (val < startHour) setStartHour(val)
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
              <option value="24h">24-Hour (HH:MM)</option>
              <option value="12h">12-Hour (HH:MM AM/PM)</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeSeconds"
              checked={includeSeconds}
              onChange={(e) => setIncludeSeconds(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeSeconds" className="ml-2 block text-sm text-gray-700">
              Include Seconds
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateRandomTimes}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Times
          </button>

          {times.length > 0 && (
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
                onClick={clearTimes}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {times.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Times ({times.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <ul className="list-decimal list-inside text-gray-800 font-mono">
                {times.map((time, index) => (
                  <li key={index} className="py-1">{time}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RandomTimeGenerator