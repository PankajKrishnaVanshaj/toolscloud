'use client'
import React, { useState, useCallback } from 'react'

const TSVDataGenerator = () => {
  const [tsvData, setTsvData] = useState('')
  const [rowCount, setRowCount] = useState(5)
  const [fields, setFields] = useState([
    { name: 'id', type: 'number' },
    { name: 'name', type: 'text' },
    { name: 'email', type: 'email' }
  ])
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')
  const [includeHeader, setIncludeHeader] = useState(true)
  const [delimiter, setDelimiter] = useState('\t') // Default tab delimiter

  const MAX_ROWS = 1000
  const FIELD_TYPES = ['number', 'text', 'email', 'date', 'boolean', 'custom']
  const CUSTOM_DELIMITERS = ['\t', ',', ';', '|']

  // Data generation function
  const generateRandomData = useCallback((type, customValue = '') => {
    const timestamp = Date.now()
    switch (type) {
      case 'number':
        return Math.floor(Math.random() * 10000) + 1
      case 'text':
        const firstNames = ['John', 'Emma', 'Michael', 'Sophie', 'Alex']
        const lastNames = ['Smith', 'Johnson', 'Brown', 'Taylor', 'Wilson']
        return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
          lastNames[Math.floor(Math.random() * lastNames.length)]
        }`
      case 'email':
        const emailPrefix = `${Math.random().toString(36).substring(2, 8)}${timestamp}`
        const domains = ['gmail.com', 'outlook.com', 'example.org']
        return `${emailPrefix}@${domains[Math.floor(Math.random() * domains.length)]}`
      case 'date':
        const date = new Date(timestamp - Math.random() * 31536000000)
        return date.toISOString().split('T')[0]
      case 'boolean':
        return Math.random() > 0.5 ? 'TRUE' : 'FALSE'
      case 'custom':
        const values = customValue.split(',').map(v => v.trim())
        return values[Math.floor(Math.random() * values.length)] || ''
      default:
        return ''
    }
  }, [])

  const validateFields = useCallback(() => {
    if (fields.length === 0) return 'Please add at least one field'
    if (fields.some(field => !field.name.trim())) return 'All field names must be filled'
    if (new Set(fields.map(f => f.name)).size !== fields.length) return 'Field names must be unique'
    if (fields.some(f => f.type === 'custom' && !f.customValue?.trim())) {
      return 'Custom fields must have values specified'
    }
    return ''
  }, [fields])

  const generateTSV = useCallback(() => {
    const validationError = validateFields()
    if (validationError) {
      setError(validationError)
      setTsvData('')
      return
    }

    setError('')
    try {
      const rows = []
      // Generate header if enabled
      if (includeHeader) {
        rows.push(fields.map(field => field.name).join(delimiter))
      }

      // Generate data rows
      const dataRows = Array.from({ length: Math.min(rowCount, MAX_ROWS) }, () => {
        return fields.map(field => {
          const value = generateRandomData(field.type, field.customValue)
          // Escape special characters and quotes
          return String(value).includes(delimiter) ? `"${value}"` : value
        }).join(delimiter)
      })

      setTsvData([...rows, ...dataRows].join('\n'))
      setIsCopied(false)
    } catch (e) {
      setError('Error generating TSV: ' + e.message)
    }
  }, [rowCount, fields, includeHeader, delimiter, generateRandomData, validateFields])

  const addField = () => {
    const newFieldName = `field${fields.length + 1}`
    if (!fields.some(f => f.name === newFieldName)) {
      setFields([...fields, { name: newFieldName, type: 'text' }])
    }
  }

  const updateField = (index, key, value) => {
    setFields(fields.map((field, i) => 
      i === index ? { ...field, [key]: value } : field
    ))
  }

  const removeField = (index) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index))
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(tsvData)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy to clipboard: ' + err.message)
    }
  }

  const downloadAsTSV = () => {
    try {
      const blob = new Blob([tsvData], { type: 'text/tab-separated-values;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `data-${Date.now()}.tsv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to download: ' + err.message)
    }
  }

  const clearData = () => {
    setTsvData('')
    setIsCopied(false)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          TSV Data Generator
        </h1>

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
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delimiter
              </label>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CUSTOM_DELIMITERS.map(d => (
                  <option key={d} value={d}>
                    {d === '\t' ? 'Tab' : d}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex items-end">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={includeHeader}
                  onChange={(e) => setIncludeHeader(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Include Header
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Columns ({fields.length})
            </label>
            {fields.map((field, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => updateField(index, 'name', e.target.value)}
                  placeholder="Column Name"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={field.type}
                  onChange={(e) => updateField(index, 'type', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {FIELD_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                {field.type === 'custom' && (
                  <input
                    type="text"
                    value={field.customValue || ''}
                    onChange={(e) => updateField(index, 'customValue', e.target.value)}
                    placeholder="Comma-separated values"
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              disabled={fields.length >= 15}
            >
              + Add Column {fields.length >= 15 && '(Max 15)'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateTSV}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate TSV
          </button>

          {tsvData && (
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
                onClick={downloadAsTSV}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download as TSV
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

        {tsvData && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated TSV Data ({rowCount} rows):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{tsvData}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TSVDataGenerator