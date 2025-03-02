'use client'
import React, { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'

const EDNDataGenerator = () => {
  const [ednData, setEdnData] = useState('')
  const [count, setCount] = useState(5)
  const [rootKey, setRootKey] = useState(':items')
  const [fields, setFields] = useState([
    { name: ':id', type: 'integer', required: false },
    { name: ':name', type: 'string', required: false },
    { name: ':active', type: 'boolean', required: false }
  ])
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')

  const MAX_ITEMS = 1000
  const FIELD_TYPES = ['integer', 'string', 'boolean', 'keyword', 'symbol', 'float', 'list', 'vector', 'set']

  const generateRandomData = useCallback((type, required) => {
    const timestamp = Date.now()
    let value
    switch (type) {
      case 'integer':
        value = Math.floor(Math.random() * 1000000)
        break
      case 'string':
        value = `"${['user', 'item', 'record'][Math.floor(Math.random() * 3)]}-${timestamp}-${Math.random().toString(36).substring(2, 8)}"`
        break
      case 'boolean':
        value = Math.random() > 0.5 ? 'true' : 'false'
        break
      case 'keyword':
        value = `:${['red', 'blue', 'green', 'status'][Math.floor(Math.random() * 4)]}-${Math.random().toString(36).substring(2, 6)}`
        break
      case 'symbol':
        value = `sym-${Math.random().toString(36).substring(2, 8)}`
        break
      case 'float':
        value = (Math.random() * 1000).toFixed(2)
        break
      case 'list':
        value = `'(${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 100)})`
        break
      case 'vector':
        value = `[${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 100)}]`
        break
      case 'set':
        value = `#{${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 100)}}`
        break
      default:
        value = 'nil'
    }
    return required && (value === 'nil' || value === 'false') ? generateRandomData(type, required) : value
  }, [])

  const generateEDN = useCallback(() => {
    const validationError = validateFields()
    if (validationError) {
      setError(validationError)
      setEdnData('')
      console.error('Validation failed:', validationError)
      return
    }

    setError('')
    console.log('Generating', count, 'items...')

    try {
      const items = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
        const itemFields = fields.map(field => {
          return `${field.name} ${generateRandomData(field.type, field.required)}`
        }).join(' ')
        return `{${itemFields}}`
      })

      // Wrap in a map with the root key if specified, otherwise just a vector of items
      const dataStructure = rootKey 
        ? `{${rootKey} [${items.join(' ')}]}`
        : `[${items.join(' ')}]`

      setEdnData(dataStructure)
      setIsCopied(false)
      
      console.log('Generated EDN size:', dataStructure.length, 'characters')
    } catch (err) {
      setError('Generation failed: ' + err.message)
      console.error('Generation failed:', err)
    }
  }, [count, fields, rootKey, generateRandomData])

  const validateFields = () => {
    if (fields.length === 0) return 'Please add at least one field'
    if (fields.some(field => !field.name.trim())) return 'All field names must be filled'
    if (new Set(fields.map(f => f.name)).size !== fields.length) return 'Field names must be unique'
    if (fields.some(field => !field.name.startsWith(':'))) return 'Field names must start with : (EDN keyword)'
    if (rootKey && !rootKey.startsWith(':')) return 'Root key must start with : (EDN keyword)'
    return ''
  }

  const addField = () => {
    if (fields.length < 20) {
      setFields([...fields, { 
        name: `:field${fields.length + 1}`, 
        type: 'integer', 
        required: false 
      }])
    }
  }

  const updateField = (index, key, value) => {
    setFields(fields.map((field, i) => 
      i === index ? { ...field, [key]: key === 'name' ? `:${value.replace(/^:+/, '')}` : value } : field
    ))
  }

  const removeField = (index) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index))
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(ednData)
      setIsCopied(true)
      console.log('EDN data copied to clipboard')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy: ' + err.message)
      console.error('Copy failed:', err.message)
    }
  }

  const downloadFile = () => {
    try {
      const blob = new Blob([ednData], { type: 'text/plain;charset=utf-8' })
      saveAs(blob, `data-${Date.now()}.edn`)
      console.log('Downloaded EDN file')
    } catch (err) {
      setError('Download failed: ' + err.message)
      console.error('Download failed:', err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          EDN Data Generator
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
              Root Key (optional, must start with :)
            </label>
            <input
              type="text"
              value={rootKey}
              onChange={(e) => setRootKey(e.target.value ? `:${e.target.value.replace(/^:+/, '')}` : '')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., :items"
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
                  placeholder=":field-name"
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
            onClick={generateEDN}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate EDN
          </button>

          {ednData && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isCopied
                    ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                    : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
                }`}
              >
                {isCopied ? 'Copied!' : 'Copy EDN'}
              </button>

              <button
                onClick={downloadFile}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download EDN
              </button>

              <button
                onClick={() => { setEdnData(''); setError('') }}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {ednData && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated EDN Data ({count} items):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{ednData}</pre>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Size: {ednData.length} characters
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EDNDataGenerator