'use client'
import React, { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'

const ParquetDataGenerator = () => {
  const [dataCount, setDataCount] = useState(10)
  const [rootKey, setRootKey] = useState('records')
  const [fields, setFields] = useState([
    { name: 'id', type: 'number', min: 1, max: 1000, unique: true },
    { name: 'name', type: 'text', options: ['John', 'Emma', 'Mike', 'Sophie'], unique: false },
    { name: 'email', type: 'email', domain: 'example.com', unique: true }
  ])
  const [generatedData, setGeneratedData] = useState('')
  const [error, setError] = useState('')
  const [compression, setCompression] = useState('none') // For documentation purposes

  const FIELD_TYPES = {
    number: 'Number',
    text: 'Text',
    email: 'Email',
    date: 'Date',
    boolean: 'Boolean',
    custom: 'Custom List'
  }

  const generateRandomData = useCallback((field) => {
    const { type, min, max, options, domain } = field
    const timestamp = Date.now()
    
    switch (type) {
      case 'number':
        return Math.floor(Math.random() * (max - min + 1)) + min
      case 'text':
        return options[Math.floor(Math.random() * options.length)]
      case 'email':
        return `${Math.random().toString(36).substring(2, 8)}${timestamp}@${domain}`
      case 'date':
        const date = new Date(timestamp - Math.random() * 31536000000)
        return date.toISOString().split('T')[0]
      case 'boolean':
        return Math.random() > 0.5
      case 'custom':
        return options[Math.floor(Math.random() * options.length)]
      default:
        return ''
    }
  }, [])

  const validateFields = useCallback(() => {
    if (fields.length === 0) return 'Please add at least one field'
    if (!rootKey.trim()) return 'Root key cannot be empty'
    if (fields.some(f => !f.name.trim())) return 'All field names must be filled'
    if (new Set(fields.map(f => f.name)).size !== fields.length) return 'Field names must be unique'
    return ''
  }, [fields, rootKey])

  const generateData = useCallback(() => {
    const validationError = validateFields()
    if (validationError) {
      setError(validationError)
      setGeneratedData('')
      return
    }

    setError('')
    try {
      const generated = new Set() // For unique values
      const items = Array.from({ length: Math.min(dataCount, 1000) }, () => {
        const obj = {}
        fields.forEach(field => {
          let value = generateRandomData(field)
          if (field.unique) {
            while (generated.has(`${field.name}:${value}`)) {
              value = generateRandomData(field)
            }
            generated.add(`${field.name}:${value}`)
          }
          obj[field.name] = value
        })
        return obj
      })

      setGeneratedData(JSON.stringify({ [rootKey]: items }, null, 2))
    } catch (e) {
      setError('Error generating data: ' + e.message)
    }
  }, [dataCount, fields, rootKey, generateRandomData, validateFields])

  const addField = () => {
    if (fields.length >= 15) return
    setFields([...fields, { 
      name: `field${fields.length + 1}`, 
      type: 'text', 
      options: ['value1', 'value2'],
      unique: false 
    }])
  }

  const updateField = (index, key, value) => {
    setFields(fields.map((f, i) => 
      i === index ? { ...f, [key]: value } : f
    ))
  }

  const removeField = (index) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index))
    }
  }

  const downloadFile = () => {
    if (!generatedData) return
    const blob = new Blob([generatedData], { type: 'application/json;charset=utf-8' })
    saveAs(blob, `${rootKey}-${Date.now()}.json`)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Parquet Data Generator
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Records (1-1000)
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={dataCount}
              onChange={(e) => setDataCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
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
              onChange={(e) => setRootKey(e.target.value.trim() || 'records')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., records"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compression Type (Server-side)
            </label>
            <select
              value={compression}
              onChange={(e) => setCompression(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">None</option>
              <option value="snappy">Snappy</option>
              <option value="gzip">GZIP</option>
              <option value="lz4">LZ4</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Note: Compression applied server-side when converted to Parquet
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fields ({fields.length}/15)
            </label>
            <div className="max-h-64 overflow-y-auto">
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
                    className="w-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(FIELD_TYPES).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  {field.type === 'number' && (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={field.min || ''}
                        onChange={(e) => updateField(index, 'min', Number(e.target.value))}
                        className="w-20 p-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={field.max || ''}
                        onChange={(e) => updateField(index, 'max', Number(e.target.value))}
                        className="w-20 p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  )}
                  {(field.type === 'text' || field.type === 'custom') && (
                    <input
                      type="text"
                      placeholder="Options (comma-separated)"
                      value={field.options?.join(',') || ''}
                      onChange={(e) => updateField(index, 'options', e.target.value.split(','))}
                      className="flex-1 p-2 border border-gray-300 rounded-md"
                    />
                  )}
                  {field.type === 'email' && (
                    <input
                      type="text"
                      placeholder="Domain"
                      value={field.domain || ''}
                      onChange={(e) => updateField(index, 'domain', e.target.value)}
                      className="w-32 p-2 border border-gray-300 rounded-md"
                    />
                  )}
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={field.unique}
                      onChange={(e) => updateField(index, 'unique', e.target.checked)}
                    />
                    Unique
                  </label>
                  <button
                    onClick={() => removeField(index)}
                    disabled={fields.length <= 1}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
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
            onClick={generateData}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Data
          </button>

          {generatedData && (
            <>
              <button
                onClick={downloadFile}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download JSON
              </button>
              <button
                onClick={() => setGeneratedData('')}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {generatedData && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Data Preview ({dataCount} records):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                {generatedData}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ParquetDataGenerator