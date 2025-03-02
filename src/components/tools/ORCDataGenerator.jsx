'use client'
import React, { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'

const ORCDataGenerator = () => {
  const [schema, setSchema] = useState('')
  const [generatedData, setGeneratedData] = useState(null)
  const [count, setCount] = useState(5)
  const [tableName, setTableName] = useState('SampleTable')
  const [fields, setFields] = useState([
    { name: 'id', type: 'bigint', nullable: true },
    { name: 'name', type: 'string', nullable: true },
    { name: 'timestamp', type: 'timestamp', nullable: true }
  ])
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')

  const MAX_ITEMS = 1000
  const FIELD_TYPES = [
    'bigint', 'int', 'smallint', 'tinyint', 
    'float', 'double', 'boolean', 'string', 
    'timestamp', 'decimal', 'date'
  ]

  const generateRandomData = useCallback((type, nullable) => {
    const timestamp = Date.now()
    let value
    switch (type) {
      case 'bigint':
        value = BigInt(Math.floor(Math.random() * 1000000000))
        break
      case 'int':
        value = Math.floor(Math.random() * 1000000)
        break
      case 'smallint':
        value = Math.floor(Math.random() * 32768)
        break
      case 'tinyint':
        value = Math.floor(Math.random() * 128)
        break
      case 'float':
        value = Math.random() * 1000
        break
      case 'double':
        value = Math.random() * 1000000
        break
      case 'boolean':
        value = Math.random() > 0.5
        break
      case 'string':
        const prefixes = ['user', 'record', 'event', 'item']
        value = `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${timestamp}_${Math.random().toString(36).substring(2, 8)}`
        break
      case 'timestamp':
        value = new Date(timestamp - Math.random() * 31536000000).toISOString()
        break
      case 'decimal':
        value = (Math.random() * 1000).toFixed(2)
        break
      case 'date':
        value = new Date(timestamp - Math.random() * 31536000000).toISOString().split('T')[0]
        break
      default:
        value = null
    }
    return nullable && Math.random() < 0.1 ? null : value
  }, [])

  const generateSchema = useCallback(() => {
    let schemaContent = `-- ORC Schema for ${tableName}\n`
    schemaContent += `CREATE TABLE ${tableName} (\n`
    schemaContent += fields.map(field => 
      `  ${field.name} ${field.type.toUpperCase()}${field.nullable ? '' : ' NOT NULL'}`
    ).join(',\n')
    schemaContent += `\n) STORED AS ORC;`
    return schemaContent
  }, [tableName, fields])

  const generateData = useCallback(() => {
    const validationError = validateFields()
    if (validationError) {
      setError(validationError)
      setGeneratedData(null)
      setSchema('')
      console.error('Validation failed:', validationError)
      return
    }

    setError('')
    console.log('Generating', count, 'items...')

    try {
      const items = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
        return fields.reduce((obj, field) => ({
          ...obj,
          [field.name]: generateRandomData(field.type, field.nullable)
        }), {})
      })

      console.log('Generated items:', items.length, 'items', items)

      const dataStructure = { [tableName.toLowerCase()]: items }
      
      // Custom JSON serialization to handle BigInt
      const jsonString = JSON.stringify(dataStructure, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value
      )
      const binaryBuffer = new TextEncoder().encode(jsonString)

      setGeneratedData({
        items: dataStructure,
        binary: binaryBuffer,
        size: binaryBuffer.length
      })
      setSchema(generateSchema())
      setIsCopied(false)

      console.log('Binary size:', binaryBuffer.length, 'bytes')
    } catch (err) {
      setError('Generation failed: ' + err.message)
      console.error('Generation failed:', err)
    }
  }, [count, fields, tableName, generateRandomData, generateSchema])

  const validateFields = () => {
    if (fields.length === 0) return 'Please add at least one field'
    if (!tableName.trim()) return 'Table name cannot be empty'
    if (fields.some(field => !field.name.trim())) return 'All field names must be filled'
    if (new Set(fields.map(f => f.name)).size !== fields.length) return 'Field names must be unique'
    return ''
  }

  const addField = () => {
    if (fields.length < 20) {
      setFields([...fields, { 
        name: `field${fields.length + 1}`, 
        type: 'int', 
        nullable: true 
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

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      console.log('Schema copied to clipboard')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy: ' + err.message)
      console.error('Copy failed:', err.message)
    }
  }

  const downloadFile = (content, fileName, type) => {
    try {
      const blob = new Blob([content], { type })
      saveAs(blob, fileName)
      console.log(`Downloaded ${fileName}`)
    } catch (err) {
      setError('Download failed: ' + err.message)
      console.error('Download failed:', err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          ORC Data Generator
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Rows (1-{MAX_ITEMS})
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
              Table Name
            </label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value.trim() || 'SampleTable')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., SampleTable"
            />
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
                      {type}
                    </option>
                  ))}
                </select>
                <input
                  type="checkbox"
                  checked={field.nullable}
                  onChange={(e) => updateField(index, 'nullable', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Nullable</span>
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
              + Add Column {fields.length >= 20 && '(Max 20)'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateData}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate ORC Data
          </button>

          {generatedData && (
            <>
              <button
                onClick={() => copyToClipboard(schema)}
                className={`flex-1 py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isCopied
                    ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                    : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
                }`}
              >
                {isCopied ? 'Copied!' : 'Copy Schema'}
              </button>

              <button
                onClick={() => downloadFile(schema, `${tableName.toLowerCase()}.sql`, 'text/plain')}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download Schema
              </button>

              <button
                onClick={() => downloadFile(generatedData.binary, `${tableName.toLowerCase()}.orc`, 'application/octet-stream')}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Download Data
              </button>

              <button
                onClick={() => { setGeneratedData(null); setSchema(''); setError('') }}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {schema && generatedData && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated ORC Schema ({count} rows):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{schema}</pre>
            </div>
            <div className="mt-2">
              <h3 className="text-md font-semibold text-gray-700 mb-2">
                Generated Data ({generatedData.items[tableName.toLowerCase()].length} rows):
              </h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {JSON.stringify(generatedData.items, (key, value) => 
                    typeof value === 'bigint' ? value.toString() : value, 2)}
                </pre>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Total rows: {generatedData.items[tableName.toLowerCase()].length} | Data size: {generatedData.size} bytes
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ORCDataGenerator