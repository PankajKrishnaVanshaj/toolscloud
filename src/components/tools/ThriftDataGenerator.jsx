'use client'
import React, { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'

const ThriftDataGenerator = () => {
  const [schema, setSchema] = useState('')
  const [generatedData, setGeneratedData] = useState(null)
  const [count, setCount] = useState(5)
  const [namespace, setNamespace] = useState('generated')
  const [structName, setStructName] = useState('Item')
  const [fields, setFields] = useState([
    { name: 'id', id: 1, type: 'i32', required: false },
    { name: 'name', id: 2, type: 'string', required: false },
    { name: 'active', id: 3, type: 'bool', required: false }
  ])
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')

  const MAX_ITEMS = 1000
  const FIELD_TYPES = ['i8', 'i16', 'i32', 'i64', 'double', 'string', 'bool', 'byte']

  const generateRandomData = useCallback((type, required) => {
    const timestamp = Date.now()
    let value
    switch (type) {
      case 'i8':
      case 'byte':
        value = Math.floor(Math.random() * 256)
        break
      case 'i16':
        value = Math.floor(Math.random() * 65536)
        break
      case 'i32':
        value = Math.floor(Math.random() * 4294967296)
        break
      case 'i64':
        value = Math.floor(Math.random() * 9007199254740991) // JS safe integer limit
        break
      case 'double':
        value = Math.random() * 1000000
        break
      case 'bool':
        value = Math.random() > 0.5
        break
      case 'string':
        const prefixes = ['user', 'item', 'record', 'data']
        value = `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${timestamp}_${Math.random().toString(36).substring(2, 8)}`
        break
      default:
        value = 0
    }
    return required && (value === 0 || value === false) ? generateRandomData(type, required) : value
  }, [])

  const generateSchema = useCallback(() => {
    let schemaContent = `namespace cpp ${namespace}.cpp\n`
    schemaContent += `namespace java ${namespace}.java\n\n`
    
    schemaContent += `struct ${structName} {\n`
    fields.forEach(field => {
      schemaContent += `  ${field.id}: ${field.required ? 'required' : 'optional'} ${field.type} ${field.name}\n`
    })
    schemaContent += `}\n`
    
    return schemaContent
  }, [namespace, structName, fields])

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
          [field.name]: generateRandomData(field.type, field.required)
        }), {})
      })

      console.log('Generated items:', items.length, 'items', items)

      const dataStructure = { [structName.toLowerCase()]: items }
      const jsonString = JSON.stringify(dataStructure)
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
  }, [count, fields, structName, namespace, generateRandomData, generateSchema])

  const validateFields = () => {
    if (fields.length === 0) return 'Please add at least one field'
    if (!structName.trim()) return 'Struct name cannot be empty'
    if (!namespace.trim()) return 'Namespace cannot be empty'
    if (fields.some(field => !field.name.trim())) return 'All field names must be filled'
    if (fields.some(field => !Number.isInteger(field.id) || field.id < 1)) return 'All field IDs must be positive integers'
    if (new Set(fields.map(f => f.name)).size !== fields.length) return 'Field names must be unique'
    if (new Set(fields.map(f => f.id)).size !== fields.length) return 'Field IDs must be unique'
    return ''
  }

  const addField = () => {
    if (fields.length < 20) {
      const newId = Math.max(...fields.map(f => f.id)) + 1
      setFields([...fields, { 
        name: `field${fields.length + 1}`, 
        id: newId,
        type: 'i32', 
        required: false 
      }])
    }
  }

  const updateField = (index, key, value) => {
    setFields(fields.map((field, i) => 
      i === index ? { 
        ...field, 
        [key]: key === 'id' ? parseInt(value) || field.id : value 
      } : field
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
          Thrift Data Generator
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
              Namespace
            </label>
            <input
              type="text"
              value={namespace}
              onChange={(e) => setNamespace(e.target.value.trim() || 'generated')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., generated"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Struct Name
            </label>
            <input
              type="text"
              value={structName}
              onChange={(e) => setStructName(e.target.value.trim() || 'Item')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Item"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fields ({fields.length})
            </label>
            {fields.map((field, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="number"
                  value={field.id}
                  onChange={(e) => updateField(index, 'id', e.target.value)}
                  placeholder="ID"
                  min="1"
                  className="w-16 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  onChange={(e) => updateField(index, 'required', e.target.value)}
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
            onClick={generateData}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Thrift
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
                onClick={() => downloadFile(schema, `${structName.toLowerCase()}.thrift`, 'text/plain')}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download Schema
              </button>

              <button
                onClick={() => downloadFile(generatedData.binary, `${structName.toLowerCase()}.bin`, 'application/octet-stream')}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Download Binary
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
              Generated Thrift Schema ({count} items):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{schema}</pre>
            </div>
            <div className="mt-2">
              <h3 className="text-md font-semibold text-gray-700 mb-2">
                Generated Data ({generatedData.items[structName.toLowerCase()].length} items):
              </h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {JSON.stringify(generatedData.items, null, 2)}
                </pre>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Total items: {generatedData.items[structName.toLowerCase()].length} | Binary size: {generatedData.size} bytes
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ThriftDataGenerator