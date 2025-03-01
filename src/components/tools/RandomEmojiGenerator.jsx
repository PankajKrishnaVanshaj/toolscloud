'use client'
import React, { useState } from 'react'

const RandomEmojiGenerator = () => {
  const [emojis, setEmojis] = useState([])
  const [count, setCount] = useState(10)
  const [category, setCategory] = useState('all')
  const [isCopied, setIsCopied] = useState(false)

  // Emoji categories with sample emojis (you can expand these)
  const emojiCategories = {
    all: ['😀', '😂', '😍', '😢', '😡', '👍', '👎', '❤️', '⭐', '🌟', '🍎', '🍕', '🐱', '🐶', '🌍', '🚀'],
    faces: ['😀', '😂', '😍', '😢', '😡', '😊', '😳', '🥳', '😴', '🤓'],
    gestures: ['👍', '👎', '👋', '✌️', '👌', '🤝', '🙏', '✊', '👊'],
    objects: ['❤️', '⭐', '🌟', '🍎', '🍕', '📱', '💻', '🎮', '🎸', '⚽'],
    animals: ['🐱', '🐶', '🐰', '🦊', '🐻', '🐼', '🐸', '🐵', '🦁', '🐘'],
    travel: ['🌍', '🚀', '✈️', '🚗', '🚢', '🏖️', '⛰️', '🏰', '🌋', '🏝️']
  }

  const generateEmojis = () => {
    const availableEmojis = emojiCategories[category]
    const newEmojis = Array.from({ length: Math.min(count, 100) }, () => {
      return availableEmojis[Math.floor(Math.random() * availableEmojis.length)]
    })
    setEmojis(newEmojis)
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    const text = emojis.join(' ')
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const blob = new Blob([emojis.join(' ')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `emojis-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearEmojis = () => {
    setEmojis([])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Random Emoji Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Emojis (1-100)
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
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="faces">Faces & Emotions</option>
              <option value="gestures">Gestures & Hands</option>
              <option value="objects">Objects & Symbols</option>
              <option value="animals">Animals</option>
              <option value="travel">Travel & Places</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateEmojis}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Emojis
          </button>

          {emojis.length > 0 && (
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
                onClick={clearEmojis}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {emojis.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Emojis ({emojis.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <div className="flex flex-wrap gap-2 text-2xl">
                {emojis.map((emoji, index) => (
                  <span key={index} title={`Emoji ${index + 1}`}>
                    {emoji}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RandomEmojiGenerator