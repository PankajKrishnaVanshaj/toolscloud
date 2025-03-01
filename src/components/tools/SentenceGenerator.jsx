'use client'
import React, { useState } from 'react'

const SentenceGenerator = () => {
  const [sentences, setSentences] = useState([])
  const [count, setCount] = useState(5)
  const [complexity, setComplexity] = useState('simple') // simple, medium, complex
  const [category, setCategory] = useState('general') // general, tech, fantasy, humor
  const [isCopied, setIsCopied] = useState(false)

  // Word banks for different categories
  const wordBanks = {
    general: {
      subjects: ['The cat', 'A dog', 'People', 'The sun', 'Birds'],
      verbs: ['runs', 'jumps', 'sings', 'shines', 'flies'],
      objects: ['quickly', 'happily', 'loudly', 'brightly', 'high'],
      extras: ['in the park', 'today', 'with joy', 'all day', 'nearby']
    },
    tech: {
      subjects: ['The system', 'A developer', 'Computers', 'The network', 'Code'],
      verbs: ['processes', 'codes', 'connects', 'runs', 'compiles'],
      objects: ['data', 'quickly', 'efficiently', 'smoothly', 'fast'],
      extras: ['in the cloud', 'on the server', 'through the API', 'with bugs', 'daily']
    },
    fantasy: {
      subjects: ['The dragon', 'A wizard', 'Elves', 'The kingdom', 'Ghosts'],
      verbs: ['flies', 'casts', 'dances', 'reigns', 'haunts'],
      objects: ['magically', 'powerfully', 'gracefully', 'mightily', 'silently'],
      extras: ['in the forest', 'under the moon', 'with magic', 'beyond the hills', 'at night']
    },
    humor: {
      subjects: ['The clown', 'A chicken', 'My boss', 'The cat', 'Zombies'],
      verbs: ['trips', 'crosses', 'yells', 'sleeps', 'shuffles'],
      objects: ['hilariously', 'slowly', 'loudly', 'quietly', 'awkwardly'],
      extras: ['in the office', 'on the road', 'with a banana', 'all the time', 'for no reason']
    }
  }

  const generateSentence = () => {
    const bank = wordBanks[category]
    const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]

    switch (complexity) {
      case 'simple':
        return `${randomItem(bank.subjects)} ${randomItem(bank.verbs)}.`
      case 'medium':
        return `${randomItem(bank.subjects)} ${randomItem(bank.verbs)} ${randomItem(bank.objects)}.`
      case 'complex':
        return `${randomItem(bank.subjects)} ${randomItem(bank.verbs)} ${randomItem(bank.objects)} ${randomItem(bank.extras)}.`
      default:
        return `${randomItem(bank.subjects)} ${randomItem(bank.verbs)}.`
    }
  }

  const generateSentences = () => {
    const newSentences = Array.from({ length: Math.min(count, 100) }, generateSentence)
    setSentences(newSentences)
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    const text = sentences.join('\n')
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const text = sentences.join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sentences-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearSentences = () => {
    setSentences([])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Sentence Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Sentences (1-100)
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
              Complexity
            </label>
            <select
              value={complexity}
              onChange={(e) => setComplexity(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="simple">Simple (Subject + Verb)</option>
              <option value="medium">Medium (Subject + Verb + Object)</option>
              <option value="complex">Complex (Subject + Verb + Object + Extra)</option>
            </select>
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
              <option value="tech">Technology</option>
              <option value="fantasy">Fantasy</option>
              <option value="humor">Humor</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateSentences}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Sentences
          </button>

          {sentences.length > 0 && (
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
                onClick={clearSentences}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {sentences.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Sentences ({sentences.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <ul className="list-decimal list-inside text-gray-800">
                {sentences.map((sentence, index) => (
                  <li key={index} className="py-1">{sentence}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SentenceGenerator