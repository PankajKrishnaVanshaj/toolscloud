'use client'
import React, { useState } from 'react'

const TitleGenerator = () => {
  const [titles, setTitles] = useState([])
  const [count, setCount] = useState(1)
  const [category, setCategory] = useState('general') // general, tech, fantasy, business
  const [length, setLength] = useState('medium') // short, medium, long
  const [isCopied, setIsCopied] = useState(false)

  // Word banks for different categories
  const wordBanks = {
    general: {
      adjectives: ['Great', 'Hidden', 'Simple', 'Bold', 'Bright'],
      nouns: ['Journey', 'Secret', 'Path', 'Adventure', 'Dream'],
      verbs: ['Unveiling', 'Discovering', 'Exploring', 'Mastering', 'Building']
    },
    tech: {
      adjectives: ['Smart', 'Digital', 'Next', 'Quantum', 'Cloud'],
      nouns: ['Code', 'Network', 'Algorithm', 'System', 'Future'],
      verbs: ['Coding', 'Hacking', 'Optimizing', 'Deploying', 'Innovating']
    },
    fantasy: {
      adjectives: ['Mystic', 'Ancient', 'Enchanted', 'Dark', 'Golden'],
      nouns: ['Realm', 'Quest', 'Legend', 'Dragon', 'Kingdom'],
      verbs: ['Wielding', 'Questing', 'Conjuring', 'Battling', 'Forging']
    },
    business: {
      adjectives: ['Strategic', 'Global', 'Profitable', 'Dynamic', 'Innovative'],
      nouns: ['Success', 'Growth', 'Market', 'Leadership', 'Vision'],
      verbs: ['Scaling', 'Leveraging', 'Monetizing', 'Branding', 'Networking']
    }
  }

  // Title patterns based on length
  const patterns = {
    short: [
      (words) => `${words.adjectives[0]} ${words.nouns[0]}`,
      (words) => `${words.verbs[0]} ${words.nouns[0]}`
    ],
    medium: [
      (words) => `The ${words.adjectives[0]} ${words.nouns[0]}`,
      (words) => `${words.verbs[0]} the ${words.nouns[0]}`,
      (words) => `${words.adjectives[0]} ${words.nouns[0]} Guide`
    ],
    long: [
      (words) => `The ${words.adjectives[0]} Art of ${words.verbs[0]} ${words.nouns[0]}`,
      (words) => `${words.verbs[0]} ${words.adjectives[0]} ${words.nouns[0]} in Practice`,
      (words) => `A ${words.adjectives[0]} ${words.nouns[0]} for ${words.verbs[0]} Success`
    ]
  }

  const generateTitles = () => {
    const bank = wordBanks[category]
    const selectedPatterns = patterns[length]
    
    const newTitles = Array.from({ length: Math.min(count, 100) }, () => {
      const words = {
        adjectives: [...bank.adjectives].sort(() => Math.random() - 0.5),
        nouns: [...bank.nouns].sort(() => Math.random() - 0.5),
        verbs: [...bank.verbs].sort(() => Math.random() - 0.5)
      }
      const pattern = selectedPatterns[Math.floor(Math.random() * selectedPatterns.length)]
      return pattern(words)
    })

    setTitles(newTitles)
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    const text = titles.join('\n')
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const text = titles.join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `titles-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearTitles = () => {
    setTitles([])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Title Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Titles (1-100)
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
              <option value="general">General</option>
              <option value="tech">Technology</option>
              <option value="fantasy">Fantasy</option>
              <option value="business">Business</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title Length
            </label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateTitles}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Titles
          </button>

          {titles.length > 0 && (
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
                onClick={clearTitles}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {titles.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Titles ({titles.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <ul className="list-decimal list-inside text-gray-800">
                {titles.map((title, index) => (
                  <li key={index} className="py-1">{title}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TitleGenerator