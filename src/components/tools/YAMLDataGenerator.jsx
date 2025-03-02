'use client'
import React, { useState, useCallback } from 'react'
import yaml from 'js-yaml' // You'll need to install this: npm install js-yaml

const YAMLDataGenerator = () => {
  const [yamlData, setYamlData] = useState('')
  const [count, setCount] = useState(5)
  const [rootKey, setRootKey] = useState('items')
  const [fields, setFields] = useState([
    { name: 'id', type: 'number', required: true },
    { name: 'name', type: 'text', required: false },
    { name: 'email', type: 'email', required: false }
  ])
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')
  const [options, setOptions] = useState({
    includeComments: false,
    nestLevel: 1,
    flowLevel: -1,
    sortKeys: false
  })

  const MAX_ITEMS = 100
  const FIELD_TYPES = ['number', 'text', 'email', 'date', 'boolean', 'null']

  const generateRandomData = useCallback((type, required) => {
    const timestamp = Date.now()
    if (!required && Math.random() < 0.2) return null // 20% chance of null for non-required fields
    
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
      case 'null':
        return null
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

  const generateYAML = useCallback(() => {
    const validationError = validateFields()
    if (validationError) {
      setError(validationError)
      setYamlData('')
      return
    }

    setError('')
    const items = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
      const item = fields.reduce((obj, field) => ({
        ...obj,
        [field.name]: generateRandomData(field.type, field.required)
      }), {})

      // Apply nesting if specified
      let nestedItem = item
      for (let i = 1; i < options.nestLevel; i++) {
        nestedItem = { nested: nestedItem }
      }
      return nestedItem
    })

    try {
      const data = { [rootKey]: items }
      const yamlOptions = {
        flowLevel: options.flowLevel,
        sortKeys: options.sortKeys,
        lineWidth: 80,
        noRefs: true
      }

      let result = yaml.dump(data, yamlOptions)
      if (options.includeComments) {
        result = `# Generated YAML Data\n# Items: ${count}\n${result}`
      }
      setYamlData(result)
      setIsCopied(false)
    } catch (e) {
      setError('Error generating YAML: ' + e.message)
    }
  }, [count, fields, rootKey, options, generateRandomData, validateFields])

  const addField = () => {
    const newFieldName = `field${fields.length + 1}`
    if (!fields.some(f => f.name === newFieldName) && fields.length < 15) {
      setFields([...fields, { name: newFieldName, type: 'text', required: false }])
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
      await navigator.clipboard.writeText(yamlData)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy to clipboard: ' + err.message)
    }
  }

  const downloadAsYAML = () => {
    try {
      const blob = new Blob([yamlData], { type: 'application/yaml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${rootKey}-${Date.now()}.yaml`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to download: ' + err.message)
    }
  }

  const clearData = () => {
    setYamlData('')
    setIsCopied(false)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">YAML Data Generator</h1>

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
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., items"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fields ({fields.length})
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
                  {FIELD_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(index, 'required', e.target.checked)}
                  className="h-5 w-5 text-blue-600"
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
              disabled={fields.length >= 15}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              + Add Field {fields.length >= 15 && '(Max 15)'}
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">YAML Options</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.includeComments}
                  onChange={(e) => setOptions({...options, includeComments: e.target.checked})}
                  className="h-4 w-4 text-blue-600"
                />
                Include Comments
              </label>
              <label className="flex items-center gap-2">
                Nesting Level:
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={options.nestLevel}
                  onChange={(e) => setOptions({...options, nestLevel: Math.max(1, Math.min(5, Number(e.target.value)))})}
                  className="w-16 p-1 border border-gray-300 rounded-md"
                />
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.sortKeys}
                  onChange={(e) => setOptions({...options, sortKeys: e.target.checked})}
                  className="h-4 w-4 text-blue-600"
                />
                Sort Keys
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateYAML}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            Generate YAML
          </button>
          {yamlData && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md ${
                  isCopied
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
                } text-white focus:ring-2`}
              >
                {isCopied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={downloadAsYAML}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500"
              >
                Download YAML
              </button>
              <button
                onClick={clearData}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {yamlData && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated YAML Data ({count} items):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{yamlData}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default YAMLDataGenerator