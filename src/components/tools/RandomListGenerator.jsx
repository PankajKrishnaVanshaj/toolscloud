'use client'
import React, { useState } from 'react'

const RandomListGenerator = () => {
  const [items, setItems] = useState('')
  const [generatedList, setGeneratedList] = useState([])
  const [count, setCount] = useState(5)
  const [order, setOrder] = useState('random') // random, alphabetical
  const [allowDuplicates, setAllowDuplicates] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const generateList = () => {
    if (!items.trim()) {
      setGeneratedList(['Please enter some items!'])
      return
    }

    const itemArray = items.split('\n').map(item => item.trim()).filter(Boolean)
    if (itemArray.length === 0) {
      setGeneratedList(['No valid items found!'])
      return
    }

    let result = []
    
    if (allowDuplicates) {
      // With duplicates, just pick random items
      for (let i = 0; i < Math.min(count, 1000); i++) {
        result.push(itemArray[Math.floor(Math.random() * itemArray.length)])
      }
    } else {
      // Without duplicates, shuffle and slice
      const shuffled = [...itemArray].sort(() => Math.random() - 0.5)
      result = shuffled.slice(0, Math.min(count, itemArray.length))
    }

    if (order === 'alphabetical') {
      result.sort()
    }

    setGeneratedList(result)
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    const text = generatedList.join('\n')
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const text = generatedList.join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `random-list-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setItems('')
    setGeneratedList([])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Random List Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items (one per line)
            </label>
            <textarea
              value={items}
              onChange={(e) => setItems(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter items, one per line..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Items (1-1000)
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
              Order
            </label>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="random">Random</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
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
              Allow duplicates
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateList}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate List
          </button>

          {generatedList.length > 0 && (
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
                onClick={clearAll}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {generatedList.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated List ({generatedList.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <ul className="list-decimal list-inside text-gray-800">
                {generatedList.map((item, index) => (
                  <li key={index} className="py-1">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RandomListGenerator