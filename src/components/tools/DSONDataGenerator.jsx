'use client'
import React, { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'

const DSONDataGenerator = () => {
  const [dsonData, setDsonData] = useState('')
  const [count, setCount] = useState(5)
  const [rootKey, setRootKey] = useState('items')
  const [fields, setFields] = useState([
    { name: 'id', type: 'number' },
    { name: 'name', type: 'string' },
    { name: 'active', type: 'boolean' }
  ])
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')

  const MAX_ITEMS = 1000
  const FIELD_TYPES = ['number', 'string', 'boolean', 'array']

  const generateRandomData = useCallback((type) => {
    const timestamp = Date.now()
    switch (type) {
      case 'number':
        return Math.floor(Math.random() * 1000000)
      case 'string':
        const prefixes = ['user', 'item', 'record', 'data']
        return `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${timestamp}_${Math.random().toString(36).substring(2, 8)}`
      case 'boolean':
        return Math.random() > 0.5
      case 'array':
        return Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => 
          Math.floor(Math.random() * 100))
      default:
        return 0
    }
  }, [])

  const formatDSONValue = (value) => {
    if (typeof value === 'boolean') return value.toString()
    if (Array.isArray(value)) return `[${value.join(', ')}]`
    if (typeof value === 'string') return `"${value}"`
    return value
  }

  const generateDSON = useCallback(() => {
    const validationError = validateFields()
    if (validationError) {
      setError(validationError)
      setDsonData('')
      console.error('Validation failed:', validationError)
      return
    }

    setError('')
    console.log('Generating', count, 'items...')

    try {
      const items = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
        return fields.reduce((obj, field) => ({
          ...obj,
          [field.name]: generateRandomData(field.type)
        }), {})
      })

      // Generate DSON format
      let dsonString = `${rootKey}\n{\n`
      items.forEach((item, index) => {
        dsonString += `  // Item ${index + 1}\n`
        dsonString += `  {\n`
        Object.entries(item).forEach(([key, value]) => {
          dsonString += `    ${key}: ${formatDSONValue(value)}\n`
        })
        dsonString += `  }${index < items.length - 1 ? ',' : ''}\n`
      })
      dsonString += `}`

      setDsonData(dsonString)
      setIsCopied(false)
      
      console.log('Generated items:', items.length, 'items')
      console.log('DSON size:', dsonString.length, 'characters')
    } catch (err) {
      setError('Generation failed: ' + err.message)
      console.error('Generation failed:', err)
    }
  }, [count, fields, rootKey, generateRandomData])

  const validateFields = () => {
    if (fields.length === 0) return 'Please add at least one field'
    if (!rootKey.trim()) return 'Root key cannot be empty'
    if (fields.some(field => !field.name.trim())) return 'All field names must be filled'
    if (new Set(fields.map(f => f.name)).size !== fields.length) return 'Field names must be unique'
    return ''
  }

  const addField = () => {
    if (fields.length < 20) {
      setFields([...fields, { 
        name: `field${fields.length + 1}`, 
        type: 'number' 
      }])
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
      await navigator.clipboard.writeText(dsonData)
      setIsCopied(true)
      console.log('DSON copied to clipboard')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy: ' + err.message)
      console.error('Copy failed:', err.message)
    }
  }

  const downloadFile = () => {
    try {
      const blob = new Blob([dsonData], { type: 'text/plain;charset=utf-8' })
      saveAs(blob, `${rootKey.toLowerCase()}.dson`)
      console.log(`Downloaded ${rootKey.toLowerCase()}.dson`)
    } catch (err) {
      setError('Download failed: ' + err.message)
      console.error('Download failed:', err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          DSON Data Generator
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
              onChange={(e) => {
                const newCount = Math.max(1, Math.min(MAX_ITEMS, Number(e.target.value) || 1))
                setCount(newCount)
                console.log('Count updated to:', newCount)
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Root Key
            </label>
            <input
              type="text"
              value={rootKey}
              onChange={(e) => setRootKey(e.target.value.trim() || 'items')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={field.type}
                  onChange={(e) => updateField(index, 'type', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {FIELD_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
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
              disabled={fields.length >= 20}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              + Add Field {fields.length >= 20 && '(Max 20)'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateDSON}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate DSON
          </button>

          {dsonData && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isCopied
                    ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                    : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
                }`}
              >
                {isCopied ? 'Copied!' : 'Copy DSON'}
              </button>

              <button
                onClick={downloadFile}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Download DSON
              </button>

              <button
                onClick={() => { setDsonData(''); setError('') }}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {dsonData && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated DSON Data ({count} items):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                {dsonData}
              </pre>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Size: {dsonData.length} characters
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DSONDataGenerator