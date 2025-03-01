'use client'
import React, { useState } from 'react'

const JSONDataGenerator = () => {
  const [jsonData, setJsonData] = useState('')
  const [count, setCount] = useState(5)
  const [rootKey, setRootKey] = useState('items')
  const [fields, setFields] = useState([
    { name: 'id', type: 'number' },
    { name: 'name', type: 'text' },
    { name: 'email', type: 'email' }
  ])
  const [isCopied, setIsCopied] = useState(false)

  // Data generation functions
  const generateRandomData = (type) => {
    switch (type) {
      case 'number':
        return Math.floor(Math.random() * 1000)
      case 'text':
        const words = ['apple', 'book', 'car', 'desk', 'phone', 'tree', 'water', 'cloud']
        return words[Math.floor(Math.random() * words.length)]
      case 'email':
        const domains = ['gmail.com', 'yahoo.com', 'example.com']
        return `${Math.random().toString(36).substring(2, 8)}@${domains[Math.floor(Math.random() * domains.length)]}`
      case 'date':
        const date = new Date(Date.now() - Math.random() * 10000000000)
        return date.toISOString().split('T')[0]
      case 'boolean':
        return Math.random() > 0.5
      default:
        return ''
    }
  }

  const generateJSON = () => {
    if (fields.length === 0) {
      setJsonData('Please add at least one field!')
      return
    }

    const items = Array.from({ length: Math.min(count, 100) }, () => {
      const obj = {}
      fields.forEach(field => {
        obj[field.name] = generateRandomData(field.type)
      })
      return obj
    })

    const jsonObj = { [rootKey]: items }
    setJsonData(JSON.stringify(jsonObj, null, 2))
    setIsCopied(false)
  }

  const addField = () => {
    setFields([...fields, { name: `field${fields.length + 1}`, type: 'text' }])
  }

  const updateField = (index, key, value) => {
    const newFields = [...fields]
    newFields[index][key] = value
    setFields(newFields)
  }

  const removeField = (index) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index))
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonData)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsJSON = () => {
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `data-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearData = () => {
    setJsonData('')
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          JSON Data Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Items (1-100)
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
              Root Key Name
            </label>
            <input
              type="text"
              value={rootKey}
              onChange={(e) => setRootKey(e.target.value || 'items')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., items"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fields
            </label>
            {fields.map((field, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => updateField(index, 'name', e.target.value)}
                  placeholder="Field Name"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={field.type}
                  onChange={(e) => updateField(index, 'type', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="number">Number</option>
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="date">Date</option>
                  <option value="boolean">Boolean</option>
                </select>
                {fields.length > 1 && (
                  <button
                    onClick={() => removeField(index)}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addField}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Field
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateJSON}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate JSON
          </button>

          {jsonData && (
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
                onClick={downloadAsJSON}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download as JSON
              </button>

              <button
                onClick={clearData}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {jsonData && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated JSON Data:
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{jsonData}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default JSONDataGenerator