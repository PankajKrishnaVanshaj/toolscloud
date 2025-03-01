'use client'
import React, { useState } from 'react'

const UsernameGenerator = () => {
  const [usernames, setUsernames] = useState([])
  const [count, setCount] = useState(10)
  const [length, setLength] = useState(8)
  const [style, setStyle] = useState('random') // random, name-based, word-based
  const [includeNumbers, setIncludeNumbers] = useState(false)
  const [separator, setSeparator] = useState('none') // none, hyphen, underscore
  const [isCopied, setIsCopied] = useState(false)

  // Sample data for generation
  const firstNames = ['john', 'jane', 'alex', 'emma', 'chris', 'sophia', 'mike', 'lisa']
  const lastNames = ['smith', 'doe', 'johnson', 'brown', 'wilson', 'taylor', 'davis', 'clark']
  const words = ['cloud', 'star', 'river', 'forest', 'moon', 'sky', 'wind', 'stone']

  const generateUsername = () => {
    const getRandomString = (len) => {
      const chars = 'abcdefghijklmnopqrstuvwxyz'
      return Array.from({ length: len }, () => 
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join('')
    }

    const getNumber = () => Math.floor(Math.random() * 1000)

    let username = ''
    const sep = separator === 'hyphen' ? '-' : separator === 'underscore' ? '_' : ''

    switch (style) {
      case 'random':
        username = getRandomString(length)
        break
      case 'name-based':
        const first = firstNames[Math.floor(Math.random() * firstNames.length)]
        const last = lastNames[Math.floor(Math.random() * lastNames.length)]
        username = separator === 'none' ? `${first}${last}` : `${first}${sep}${last}`
        break
      case 'word-based':
        const word1 = words[Math.floor(Math.random() * words.length)]
        const word2 = words[Math.floor(Math.random() * words.length)]
        username = separator === 'none' ? `${word1}${word2}` : `${word1}${sep}${word2}`
        break
      default:
        username = getRandomString(length)
    }

    // Trim or pad to desired length
    if (username.length > length) {
      username = username.slice(0, length)
    } else if (username.length < length && !includeNumbers) {
      username += getRandomString(length - username.length)
    }

    if (includeNumbers) {
      const num = getNumber()
      username = separator === 'none' ? `${username}${num}` : `${username}${sep}${num}`
    }

    return username
  }

  const generateUsernames = () => {
    const newUsernames = Array.from({ length: Math.min(count, 1000) }, generateUsername)
    setUsernames(newUsernames)
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    const text = usernames.join('\n')
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const text = usernames.join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `usernames-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearUsernames = () => {
    setUsernames([])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Username Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Usernames (1-1000)
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
              Username Length (4-20)
            </label>
            <input
              type="number"
              min="4"
              max="20"
              value={length}
              onChange={(e) => setLength(Math.max(4, Math.min(20, Number(e.target.value))))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="random">Random (e.g., xk7p9m2n)</option>
              <option value="name-based">Name-Based (e.g., johnsmith)</option>
              <option value="word-based">Word-Based (e.g., cloudriver)</option>
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

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeNumbers"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeNumbers" className="ml-2 block text-sm text-gray-700">
              Include Numbers
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateUsernames}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Usernames
          </button>

          {usernames.length > 0 && (
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
                onClick={clearUsernames}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {usernames.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Usernames ({usernames.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <ul className="list-decimal list-inside text-gray-800">
                {usernames.map((username, index) => (
                  <li key={index} className="py-1">{username}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UsernameGenerator