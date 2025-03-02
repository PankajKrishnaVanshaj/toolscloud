'use client'
import React, { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'
// Note: For actual BSON serialization, you'd need to install 'bson' package
// npm install bson
import { BSON } from 'bson' // This is commented out as it requires the package

const BSONDataGenerator = () => {
  const [generatedData, setGeneratedData] = useState(null)
  const [count, setCount] = useState(5)
  const [collectionName, setCollectionName] = useState('documents')
  const [fields, setFields] = useState([
    { name: '_id', type: 'objectId', required: true },
    { name: 'name', type: 'string', required: false },
    { name: 'age', type: 'int', required: false }
  ])
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')

  const MAX_ITEMS = 1000
  const FIELD_TYPES = [
    'objectId', 'string', 'int', 'double', 'boolean', 
    'date', 'array', 'object', 'binary'
  ]

  const generateRandomData = useCallback((type, required) => {
    const timestamp = Date.now()
    let value
    switch (type) {
      case 'objectId':
        // Simulate ObjectId (24 hex characters)
        value = Array(24).fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join('')
        break
      case 'string':
        const prefixes = ['user', 'doc', 'item', 'record']
        value = `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${timestamp}_${Math.random().toString(36).substring(2, 8)}`
        break
      case 'int':
        value = Math.floor(Math.random() * 100000)
        break
      case 'double':
        value = Math.random() * 10000
        break
      case 'boolean':
        value = Math.random() > 0.5
        break
      case 'date':
        value = new Date(timestamp - Math.random() * 31536000000).toISOString()
        break
      case 'array':
        value = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, 
          () => Math.floor(Math.random() * 100))
        break
      case 'object':
        value = { 
          key: Math.random().toString(36).substring(2, 8),
          value: Math.floor(Math.random() * 1000)
        }
        break
      case 'binary':
        value = Array.from({ length: 16 }, 
          () => Math.floor(Math.random() * 256)).join('')
        break
      default:
        value = null
    }
    return required && (value === null || value === 0 || value === false) 
      ? generateRandomData(type, required) 
      : value
  }, [])

  const generateBSONData = useCallback(() => {
    const validationError = validateFields()
    if (validationError) {
      setError(validationError)
      setGeneratedData(null)
      console.error('Validation failed:', validationError)
      return
    }

    setError('')
    console.log('Generating', count, 'BSON documents...')

    try {
      const documents = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
        return fields.reduce((obj, field) => ({
          ...obj,
          [field.name]: generateRandomData(field.type, field.required)
        }), {})
      })

      // Simulate BSON serialization (without actual BSON package)
      const dataStructure = { [collectionName]: documents }
      const jsonString = JSON.stringify(dataStructure)
      const binaryBuffer = new TextEncoder().encode(jsonString)

      // If using actual BSON package, uncomment this:
      // const bsonBuffer = BSON.serialize(dataStructure)

      setGeneratedData({
        documents: dataStructure,
        binary: binaryBuffer,
        size: binaryBuffer.length
      })
      console.log('Generated documents:', documents.length, 'items')
      console.log('Binary size:', binaryBuffer.length, 'bytes')
      setIsCopied(false)
    } catch (err) {
      setError('Generation failed: ' + err.message)
      console.error('Generation failed:', err)
    }
  }, [count, fields, collectionName, generateRandomData])

  const validateFields = () => {
    if (fields.length === 0) return 'Please add at least one field'
    if (!collectionName.trim()) return 'Collection name cannot be empty'
    if (fields.some(field => !field.name.trim())) return 'All field names must be filled'
    if (new Set(fields.map(f => f.name)).size !== fields.length) return 'Field names must be unique'
    return ''
  }

  const addField = () => {
    if (fields.length < 20) {
      setFields([...fields, { 
        name: `field${fields.length + 1}`, 
        type: 'string', 
        required: false 
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
      console.log('Data copied to clipboard')
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
          BSON Data Generator
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Documents (1-{MAX_ITEMS})
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
              Collection Name
            </label>
            <input
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value.trim() || 'documents')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., documents"
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
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(index, 'required', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Required</span>
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
            onClick={generateBSONData}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate BSON
          </button>

          {generatedData && (
            <>
              <button
                onClick={() => copyToClipboard(JSON.stringify(generatedData.documents, null, 2))}
                className={`flex-1 py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isCopied
                    ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                    : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
                }`}
              >
                {isCopied ? 'Copied!' : 'Copy JSON'}
              </button>

              <button
                onClick={() => downloadFile(JSON.stringify(generatedData.documents, null, 2), `${collectionName}.json`, 'application/json')}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download JSON
              </button>

              <button
                onClick={() => downloadFile(generatedData.binary, `${collectionName}.bson`, 'application/octet-stream')}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Download BSON
              </button>

              <button
                onClick={() => { setGeneratedData(null); setError('') }}
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
              Generated BSON Data ({count} documents):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(generatedData.documents, null, 2)}
              </pre>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Total documents: {generatedData.documents[collectionName].length} | Binary size: {generatedData.size} bytes
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BSONDataGenerator