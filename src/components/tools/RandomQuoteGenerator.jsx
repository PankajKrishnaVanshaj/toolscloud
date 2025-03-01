'use client'
import React, { useState } from 'react'

const RandomQuoteGenerator = () => {
  const [quotes, setQuotes] = useState([])
  const [count, setCount] = useState(1)
  const [category, setCategory] = useState('all')
  const [isCopied, setIsCopied] = useState(false)

  // Sample quote collection (you can expand this)
  const quoteCollection = {
    all: [
      { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "motivation" },
      { text: "Be the change you wish to see in the world.", author: "Mahatma Gandhi", category: "inspiration" },
      { text: "I think, therefore I am.", author: "René Descartes", category: "philosophy" },
      { text: "Laughter is the best medicine.", author: "Unknown", category: "humor" },
      { text: "To be or not to be, that is the question.", author: "William Shakespeare", category: "literature" },
      { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu", category: "motivation" },
      { text: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: "life" },
    ],
    motivation: [
      { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
      { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
      { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    ],
    inspiration: [
      { text: "Be the change you wish to see in the world.", author: "Mahatma Gandhi" },
      { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    ],
    philosophy: [
      { text: "I think, therefore I am.", author: "René Descartes" },
      { text: "The unexamined life is not worth living.", author: "Socrates" },
    ],
    humor: [
      { text: "Laughter is the best medicine.", author: "Unknown" },
      { text: "I’m not arguing, I’m just explaining why I’m right.", author: "Unknown" },
    ],
    literature: [
      { text: "To be or not to be, that is the question.", author: "William Shakespeare" },
      { text: "It is a truth universally acknowledged...", author: "Jane Austen" },
    ],
  }

  const generateQuotes = () => {
    const availableQuotes = quoteCollection[category]
    const selectedQuotes = []
    const usedIndices = new Set()

    // Ensure we don't exceed available quotes when count is high
    const maxCount = Math.min(count, availableQuotes.length)
    
    while (selectedQuotes.length < maxCount) {
      const randomIndex = Math.floor(Math.random() * availableQuotes.length)
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex)
        selectedQuotes.push(availableQuotes[randomIndex])
      }
    }

    setQuotes(selectedQuotes)
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    const text = quotes.map(q => `"${q.text}" - ${q.author}`).join('\n')
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const text = quotes.map(q => `"${q.text}" - ${q.author}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `quotes-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearQuotes = () => {
    setQuotes([])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Random Quote Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Quotes (1-{quoteCollection[category].length})
            </label>
            <input
              type="number"
              min="1"
              max={quoteCollection[category].length}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(quoteCollection[category].length, Number(e.target.value))))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                setCount(Math.min(count, quoteCollection[e.target.value].length))
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="motivation">Motivation</option>
              <option value="inspiration">Inspiration</option>
              <option value="philosophy">Philosophy</option>
              <option value="humor">Humor</option>
              <option value="literature">Literature</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateQuotes}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Quotes
          </button>

          {quotes.length > 0 && (
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
                onClick={clearQuotes}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {quotes.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Quotes ({quotes.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              {quotes.map((quote, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <p className="text-gray-800 italic">"{quote.text}"</p>
                  <p className="text-gray-600 text-sm mt-1">— {quote.author}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RandomQuoteGenerator