'use client'
import React, { useState, useCallback } from 'react'

const CSVDataGenerator = () => {
  const [csvData, setCsvData] = useState('')
  const [rowCount, setRowCount] = useState(5)
  const [delimiter, setDelimiter] = useState(',')
  const [fields, setFields] = useState([
    { name: 'id', type: 'number', options: { min: 1, max: 1000 } },
    { name: 'name', type: 'text', options: { format: 'fullname' } },
    { name: 'email', type: 'email', options: {} }
  ])
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')
  const [includeHeader, setIncludeHeader] = useState(true)
  const [quoteValues, setQuoteValues] = useState(false)

  const MAX_ROWS = 10000
  const FIELD_TYPES = {
    number: ['integer', 'decimal'],
    text: ['fullname', 'word', 'sentence'],
    email: [],
    date: ['iso', 'short'],
    boolean: []
  }

  const generateRandomData = useCallback((type, options) => {
    const timestamp = Date.now()
    switch (type) {
      case 'number':
        const min = options.min || 0
        const max = options.max || 1000
        return options.format === 'decimal'
          ? Number((Math.random() * (max - min) + min).toFixed(2))
          : Math.floor(Math.random() * (max - min) + min)
      case 'text':
        if (options.format === 'fullname') {
          const first = ['John', 'Emma', 'Michael', 'Sophie', 'Alex']
          const last = ['Smith', 'Johnson', 'Brown', 'Taylor', 'Wilson']
          return `${first[Math.floor(Math.random() * first.length)]} ${
            last[Math.floor(Math.random() * last.length)]
          }`
        } else if (options.format === 'sentence') {
          const words = ['quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog']
          return Array(5).fill(0)
            .map(() => words[Math.floor(Math.random() * words.length)])
            .join(' ')
        }
        return ['apple', 'book', 'car'][Math.floor(Math.random() * 3)]
      case 'email':
        const prefix = `${Math.random().toString(36).substring(2, 8)}${timestamp}`
        const domains = ['gmail.com', 'outlook.com', 'example.org']
        return `${prefix}@${domains[Math.floor(Math.random() * domains.length)]}`
      case 'date':
        const date = new Date(timestamp - Math.random() * 31536000000)
        return options.format === 'short'
          ? date.toLocaleDateString()
          : date.toISOString().split('T')[0]
      case 'boolean':
        return Math.random() > 0.5
      default:
        return ''
    }
  }, [])

  const validateInputs = useCallback(() => {
    if (fields.length === 0) return 'Add at least one field'
    if (fields.some(f => !f.name.trim())) return 'All field names must be filled'
    if (new Set(fields.map(f => f.name)).size !== fields.length) return 'Field names must be unique'
    if (rowCount < 1 || rowCount > MAX_ROWS) return `Rows must be between 1 and ${MAX_ROWS}`
    return ''
  }, [fields, rowCount])

  const generateCSV = useCallback(() => {
    const validationError = validateInputs()
    if (validationError) {
      setError(validationError)
      setCsvData('')
      return
    }

    setError('')
    try {
      const rows = []
      if (includeHeader) {
        rows.push(fields.map(f => quoteValues ? `"${f.name}"` : f.name).join(delimiter))
      }

      for (let i = 0; i < rowCount; i++) {
        const row = fields.map(field => {
          const value = generateRandomData(field.type, field.options)
          return quoteValues ? `"${value}"` : value
        })
        rows.push(row.join(delimiter))
      }

      setCsvData(rows.join('\n'))
      setIsCopied(false)
    } catch (e) {
      setError('Error generating CSV: ' + e.message)
    }
  }, [fields, rowCount, delimiter, includeHeader, quoteValues, generateRandomData, validateInputs])

  const addField = () => {
    if (fields.length < 15) {
      setFields([...fields, { 
        name: `field${fields.length + 1}`, 
        type: 'text', 
        options: { format: 'word' } 
      }])
    }
  }

  const updateField = (index, key, value) => {
    const newFields = [...fields]
    if (key === 'options') {
      newFields[index].options = { ...newFields[index].options, ...value }
    } else {
      newFields[index][key] = value
    }
    setFields(newFields)
  }

  const removeField = (index) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index))
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(csvData)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy: ' + err.message)
    }
  }

  const downloadCSV = () => {
    try {
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `data-${Date.now()}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to download: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">CSV Data Generator</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Rows (1-{MAX_ROWS})
            </label>
            <input
              type="number"
              min="1"
              max={MAX_ROWS}
              value={rowCount}
              onChange={(e) => setRowCount(Math.max(1, Math.min(MAX_ROWS, Number(e.target.value) || 1)))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delimiter</label>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                checked={includeHeader}
                onChange={(e) => setIncludeHeader(e.target.checked)}
                className="mr-2"
              />
              Include Header
            </label>
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                checked={quoteValues}
                onChange={(e) => setQuoteValues(e.target.checked)}
                className="mr-2"
              />
              Quote Values
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fields ({fields.length}/15)
            </label>
            {fields.map((field, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => updateField(index, 'name', e.target.value)}
                  placeholder="Field Name"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={field.type}
                  onChange={(e) => updateField(index, 'type', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(FIELD_TYPES).map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                {FIELD_TYPES[field.type].length > 0 && (
                  <select
                    value={field.options.format || FIELD_TYPES[field.type][0]}
                    onChange={(e) => updateField(index, 'options', { format: e.target.value })}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {FIELD_TYPES[field.type].map(format => (
                      <option key={format} value={format}>
                        {format.charAt(0).toUpperCase() + format.slice(1)}
                      </option>
                    ))}
                  </select>
                )}
                {field.type === 'number' && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={field.options.min || ''}
                      onChange={(e) => updateField(index, 'options', { min: Number(e.target.value) })}
                      className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={field.options.max || ''}
                      onChange={(e) => updateField(index, 'options', { max: Number(e.target.value) })}
                      className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                <button
                  onClick={() => removeField(index)}
                  disabled={fields.length <= 1}
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
                >
                  X
                </button>
              </div>
            ))}
            <button
              onClick={addField}
              disabled={fields.length >= 15}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              + Add Field {fields.length >= 15 && '(Max 15)'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateCSV}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            Generate CSV
          </button>
          {csvData && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md ${
                  isCopied
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
                } text-white focus:ring-2`}
              >
                {isCopied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <button
                onClick={downloadCSV}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500"
              >
                Download CSV
              </button>
              <button
                onClick={() => setCsvData('')}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {csvData && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated CSV Data ({rowCount} rows):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{csvData}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CSVDataGenerator