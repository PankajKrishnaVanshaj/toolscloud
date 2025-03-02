'use client'
import React, { useState, useCallback } from 'react'

const HOCONDataGenerator = () => {
  const [hoconData, setHoconData] = useState('')
  const [count, setCount] = useState(5)
  const [rootKey, setRootKey] = useState('items')
  const [fields, setFields] = useState([
    { name: 'id', type: 'number', includeQuotes: false },
    { name: 'name', type: 'text', includeQuotes: true },
    { name: 'email', type: 'email', includeQuotes: true }
  ])
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')
  const [includeComments, setIncludeComments] = useState(true)
  const [useSubstitutions, setUseSubstitutions] = useState(false)

  const MAX_ITEMS = 100
  const FIELD_TYPES = ['number', 'text', 'email', 'date', 'boolean']

  const generateRandomData = useCallback((type) => {
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
        return Math.random() > 0.5
      default:
        return ''
    }
  }, [])

  const validateFields = useCallback(() => {
    if (fields.length === 0) return 'Please add at least one field'
    if (!rootKey.trim()) return 'Root key cannot be empty'
    if (fields.some(field => !field.name.trim())) return 'All field names must be filled'
    if (new Set(fields.map(f => f.name)).size !== fields.length) return 'Field names must be unique'
    return ''
  }, [fields, rootKey])

  const generateHOCON = useCallback(() => {
    const validationError = validateFields()
    if (validationError) {
      setError(validationError)
      setHoconData('')
      return
    }

    setError('')
    let output = ''
    
    // Add header comment if enabled
    if (includeComments) {
      output += `# Generated HOCON Data - ${new Date().toLocaleString()}\n`
    }

    // Generate substitution definitions if enabled
    const substitutions = {}
    if (useSubstitutions) {
      fields.forEach(field => {
        if (field.type === 'text' || field.type === 'email') {
          substitutions[field.name] = generateRandomData(field.type)
          output += `${field.name} = ${field.includeQuotes ? `"${substitutions[field.name]}"` : substitutions[field.name]}\n`
        }
      })
      output += '\n'
    }

    // Generate main data structure
    output += `${rootKey} = [\n`
    const items = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
      const objLines = fields.map(field => {
        const value = useSubstitutions && substitutions[field.name] 
          ? `\${${field.name}}`
          : generateRandomData(field.type)
        const formattedValue = field.includeQuotes && typeof value === 'string' && !value.startsWith('${')
          ? `"${value}"`
          : value
        return includeComments 
          ? `  ${field.name}: ${formattedValue} # ${field.type} field`
          : `  ${field.name}: ${formattedValue}`
      })
      return `{\n${objLines.join('\n')}\n}`
    })
    output += items.join(',\n') + '\n]'

    setHoconData(output)
    setIsCopied(false)
  }, [count, fields, rootKey, generateRandomData, validateFields, includeComments, useSubstitutions])

  const addField = () => {
    const newFieldName = `field${fields.length + 1}`
    if (!fields.some(f => f.name === newFieldName) && fields.length < 10) {
      setFields([...fields, { name: newFieldName, type: 'text', includeQuotes: true }])
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
      await navigator.clipboard.writeText(hoconData)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy: ' + err.message)
    }
  }

  const downloadAsHOCON = () => {
    try {
      const blob = new Blob([hoconData], { type: 'text/hocon;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${rootKey}-${Date.now()}.conf`
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
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          HOCON Data Generator
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Items (1-{MAX_ITEMS})
            </label>
            <input
              type="number"
              min="1"
              max={MAX_ITEMS}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(MAX_ITEMS, Number(e.target.value) || 1)))}
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
              onChange={(e) => setRootKey(e.target.value.trim() || 'items')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., items"
            />
          </div>

          <div className="flex gap-4 mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeComments}
                onChange={(e) => setIncludeComments(e.target.checked)}
                className="mr-2"
              />
              Include Comments
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useSubstitutions}
                onChange={(e) => setUseSubstitutions(e.target.checked)}
                className="mr-2"
              />
              Use Substitutions
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fields ({fields.length}/10)
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
                  {FIELD_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                <input
                  type="checkbox"
                  checked={field.includeQuotes}
                  onChange={(e) => updateField(index, 'includeQuotes', e.target.checked)}
                  className="mr-2"
                />
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
              disabled={fields.length >= 10}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              + Add Field {fields.length >= 10 && '(Max 10)'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateHOCON}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate HOCON
          </button>

          {hoconData && (
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
                onClick={downloadAsHOCON}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download as .conf
              </button>

              <button
                onClick={() => setHoconData('')}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {hoconData && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated HOCON Data ({count} items):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{hoconData}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HOCONDataGenerator