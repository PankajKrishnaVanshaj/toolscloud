'use client'
import React, { useState, useCallback } from 'react'

const AvroDataGenerator = () => {
  const [avroData, setAvroData] = useState('')
  const [count, setCount] = useState(5)
  const [namespace, setNamespace] = useState('example.avro')
  const [recordName, setRecordName] = useState('Record')
  const [fields, setFields] = useState([
    { name: 'id', type: 'int', logicalType: '', defaultValue: null },
    { name: 'name', type: 'string', logicalType: '', defaultValue: null },
    { name: 'email', type: 'string', logicalType: 'email', defaultValue: null }
  ])
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')
  const [includeSchema, setIncludeSchema] = useState(true)

  const MAX_ITEMS = 100
  const FIELD_TYPES = [
    'int', 'long', 'float', 'double', 'boolean', 
    'string', 'bytes', 'null', 'array', 'map'
  ]
  const LOGICAL_TYPES = {
    'int': ['date', 'time-millis'],
    'long': ['timestamp-millis', 'timestamp-micros'],
    'float': ['decimal'],
    'double': ['decimal'],
    'string': ['email', 'uuid'],
    'bytes': ['decimal']
  }

  const generateRandomData = useCallback((field) => {
    const { type, logicalType } = field
    const timestamp = Date.now()
    
    switch (type) {
      case 'int':
        if (logicalType === 'date') {
          return Math.floor((timestamp - Math.random() * 31536000000) / 86400000)
        }
        return Math.floor(Math.random() * 10000) + 1
      case 'long':
        if (logicalType === 'timestamp-millis') {
          return timestamp - Math.random() * 31536000000
        }
        return Math.floor(Math.random() * 1000000) + 1
      case 'float':
      case 'double':
        return Number((Math.random() * 100).toFixed(2))
      case 'boolean':
        return Math.random() > 0.5
      case 'string':
        if (logicalType === 'email') {
          const prefix = `${Math.random().toString(36).substring(2, 8)}${timestamp}`
          const domains = ['gmail.com', 'outlook.com', 'example.org']
          return `${prefix}@${domains[Math.floor(Math.random() * domains.length)]}`
        }
        const names = ['John', 'Emma', 'Michael', 'Sophie', 'Alex']
        return names[Math.floor(Math.random() * names.length)]
      case 'bytes':
        return Array.from({ length: 8 }, () => Math.floor(Math.random() * 256))
      case 'array':
        return Array.from({ length: 3 }, () => Math.floor(Math.random() * 100))
      case 'map':
        return { key1: Math.floor(Math.random() * 100), key2: 'value' }
      default:
        return null
    }
  }, [])

  const generateAvroSchema = useCallback(() => {
    return {
      type: 'record',
      namespace,
      name: recordName,
      fields: fields.map(field => ({
        name: field.name,
        type: field.type === 'null' ? 'null' : [field.type, 'null'],
        ...(field.logicalType && { logicalType: field.logicalType }),
        ...(field.defaultValue !== null && { default: field.defaultValue })
      }))
    }
  }, [namespace, recordName, fields])

  const validateFields = useCallback(() => {
    if (fields.length === 0) return 'Please add at least one field'
    if (!namespace.trim()) return 'Namespace cannot be empty'
    if (!recordName.trim()) return 'Record name cannot be empty'
    if (fields.some(field => !field.name.trim())) return 'All field names must be filled'
    if (new Set(fields.map(f => f.name)).size !== fields.length) return 'Field names must be unique'
    return ''
  }, [fields, namespace, recordName])

  const generateAvro = useCallback(() => {
    const validationError = validateFields()
    if (validationError) {
      setError(validationError)
      setAvroData('')
      return
    }

    setError('')
    const items = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
      return fields.reduce((obj, field) => ({
        ...obj,
        [field.name]: generateRandomData(field)
      }), {})
    })

    try {
      const schema = generateAvroSchema()
      const output = includeSchema 
        ? { schema, data: items }
        : items
      setAvroData(JSON.stringify(output, null, 2))
      setIsCopied(false)
    } catch (e) {
      setError('Error generating Avro data: ' + e.message)
    }
  }, [count, fields, generateRandomData, validateFields, generateAvroSchema, includeSchema])

  const addField = () => {
    if (fields.length < 10) {
      setFields([...fields, { 
        name: `field${fields.length + 1}`, 
        type: 'string', 
        logicalType: '', 
        defaultValue: null 
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
      await navigator.clipboard.writeText(avroData)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy: ' + err.message)
    }
  }

  const downloadAsJSON = () => {
    try {
      const blob = new Blob([avroData], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${recordName}-${Date.now()}.json`
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
          Avro Data Generator
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Records (1-{MAX_ITEMS})
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
              Namespace
            </label>
            <input
              type="text"
              value={namespace}
              onChange={(e) => setNamespace(e.target.value.trim() || 'example.avro')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., example.avro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Record Name
            </label>
            <input
              type="text"
              value={recordName}
              onChange={(e) => setRecordName(e.target.value.trim() || 'Record')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Record"
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
                <select
                  value={field.logicalType}
                  onChange={(e) => updateField(index, 'logicalType', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {(LOGICAL_TYPES[field.type] || []).map(logical => (
                    <option key={logical} value={logical}>
                      {logical}
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
              disabled={fields.length >= 10}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              + Add Field {fields.length >= 10 && '(Max 10)'}
            </button>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={includeSchema}
                onChange={(e) => setIncludeSchema(e.target.checked)}
                className="mr-2"
              />
              Include Schema in Output
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateAvro}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Avro Data
          </button>

          {avroData && (
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
                onClick={() => setAvroData('')}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {avroData && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Avro Data ({count} records):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{avroData}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AvroDataGenerator