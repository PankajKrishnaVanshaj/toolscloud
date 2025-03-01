'use client'
import React, { useState } from 'react'

const RandomWordGenerator = () => {
  const [words, setWords] = useState([])
  const [count, setCount] = useState(10)
  const [length, setLength] = useState(6) // Word length
  const [category, setCategory] = useState('general') // general, nouns, verbs, adjectives
  const [isCopied, setIsCopied] = useState(false)

  // Word generation logic
  const generateRandomWord = (wordLength) => {
    const vowels = 'aeiou'
    const consonants = 'bcdfghjklmnpqrstvwxyz'
    
    // Simple syllable structure: consonant-vowel-consonant or consonant-vowel
    const getSyllable = () => {
      const structure = Math.random() > 0.5 ? 'cvc' : 'cv'
      let syllable = ''
      for (let char of structure) {
        syllable += char === 'c' 
          ? consonants[Math.floor(Math.random() * consonants.length)]
          : vowels[Math.floor(Math.random() * vowels.length)]
      }
      return syllable
    }

    // Generate word based on approximate length
    let word = ''
    while (word.length < wordLength) {
      word += getSyllable()
    }
    // Trim or pad to exact length
    if (word.length > wordLength) {
      word = word.slice(0, wordLength)
    } else if (word.length < wordLength) {
      word += consonants[Math.floor(Math.random() * consonants.length)].repeat(wordLength - word.length)
    }

    return word
  }

  // Category-specific word generation (simplified)
  const generateCategorizedWord = () => {
    const word = generateRandomWord(length)
    switch (category) {
      case 'nouns':
        return word + (Math.random() > 0.5 ? 'ing' : 'er')
      case 'verbs':
        return (Math.random() > 0.5 ? 're' : 'un') + word
      case 'adjectives':
        return word + (Math.random() > 0.5 ? 'ful' : 'less')
      case 'general':
      default:
        return word
    }
  }

  const generateWords = () => {
    const newWords = Array.from({ length: Math.min(count, 1000) }, generateCategorizedWord)
    setWords(newWords)
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    const text = words.join('\n')
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const text = words.join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `words-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearWords = () => {
    setWords([])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Random Word Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Words (1-1000)
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
              Word Length (3-12)
            </label>
            <input
              type="number"
              min="3"
              max="12"
              value={length}
              onChange={(e) => setLength(Math.max(3, Math.min(12, Number(e.target.value))))}
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
              <option value="general">General</option>
              <option value="nouns">Nouns</option>
              <option value="verbs">Verbs</option>
              <option value="adjectives">Adjectives</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateWords}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Words
          </button>

          {words.length > 0 && (
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
                onClick={clearWords}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {words.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Words ({words.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <ul className="list-decimal list-inside text-gray-800">
                {words.map((word, index) => (
                  <li key={index} className="py-1">{word}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RandomWordGenerator