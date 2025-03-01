'use client'
import React, { useState } from 'react'

const RegexGenerator = () => {
  const [patternType, setPatternType] = useState('email') // email, phone, url, etc.
  const [options, setOptions] = useState({
    caseInsensitive: false,
    global: false,
    multiline: false
  })
  const [regex, setRegex] = useState('')
  const [testInput, setTestInput] = useState('')
  const [matches, setMatches] = useState([])
  const [isCopied, setIsCopied] = useState(false)

  // Predefined regex patterns
  const patterns = {
    email: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/,
    phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
    url: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
    number: /\d+/,
    date: /\b\d{4}-\d{2}-\d{2}\b/,
    alphanumeric: /[a-zA-Z0-9]+/
  }

  const generateRegex = () => {
    let flags = ''
    if (options.caseInsensitive) flags += 'i'
    if (options.global) flags += 'g'
    if (options.multiline) flags += 'm'

    const basePattern = patterns[patternType]
    const regexString = flags ? `/${basePattern.source}/${flags}` : `/${basePattern.source}/`
    setRegex(regexString)
    testRegex(regexString)
    setIsCopied(false)
  }

  const testRegex = (regexString) => {
    try {
      const regexObj = new RegExp(regexString.slice(1, -1), regexString.split('/')[2] || '')
      const foundMatches = testInput.match(regexObj) || []
      setMatches(foundMatches)
    } catch (err) {
      setMatches([`Error: ${err.message}`])
    }
  }

  const handleOptionChange = (option) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }))
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(regex)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const clearAll = () => {
    setRegex('')
    setTestInput('')
    setMatches([])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Regex Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pattern Type
            </label>
            <select
              value={patternType}
              onChange={(e) => setPatternType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="email">Email</option>
              <option value="phone">Phone Number</option>
              <option value="url">URL</option>
              <option value="number">Number</option>
              <option value="date">Date (YYYY-MM-DD)</option>
              <option value="alphanumeric">Alphanumeric</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Regex Options
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="caseInsensitive"
                  checked={options.caseInsensitive}
                  onChange={() => handleOptionChange('caseInsensitive')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="caseInsensitive" className="ml-2 text-sm text-gray-700">
                  Case Insensitive (i)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="global"
                  checked={options.global}
                  onChange={() => handleOptionChange('global')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="global" className="ml-2 text-sm text-gray-700">
                  Global Match (g)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="multiline"
                  checked={options.multiline}
                  onChange={() => handleOptionChange('multiline')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="multiline" className="ml-2 text-sm text-gray-700">
                  Multiline (m)
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Input
            </label>
            <textarea
              value={testInput}
              onChange={(e) => {
                setTestInput(e.target.value)
                if (regex) testRegex(regex)
              }}
              className="w-full h-24 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter text to test the regex against"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateRegex}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Regex
          </button>

          {regex && (
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
                onClick={clearAll}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {regex && (
          <div className="mt-4 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Generated Regex:
              </h2>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <pre className="text-sm font-mono text-gray-800">{regex}</pre>
              </div>
            </div>

            {testInput && (
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                  Matches ({matches.length || 0}):
                </h2>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-48 overflow-auto">
                  {matches.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-800">
                      {matches.map((match, index) => (
                        <li key={index} className="py-1">{match}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600">No matches found</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default RegexGenerator