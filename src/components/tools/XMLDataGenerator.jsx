'use client'
import React, { useState, useCallback } from 'react'

const XMLDataGenerator = () => {
  const [xmlData, setXmlData] = useState('')
  const [count, setCount] = useState(5)
  const [rootElement, setRootElement] = useState('items')
  const [itemElement, setItemElement] = useState('item')
  const [fields, setFields] = useState([
    { name: 'id', type: 'number', asAttribute: false },
    { name: 'name', type: 'text', asAttribute: false },
    { name: 'email', type: 'email', asAttribute: false }
  ])
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')
  const [useCDATA, setUseCDATA] = useState(false)

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

  const escapeXML = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  const generateXML = useCallback(() => {
    const validationError = validateFields()
    if (validationError) {
      setError(validationError)
      setXmlData('')
      return
    }

    setError('')
    try {
      const items = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
        const item = {}
        fields.forEach(field => {
          item[field.name] = generateRandomData(field.type)
        })
        return item
      })

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
      xml += `<${rootElement}>\n`
      
      items.forEach(item => {
        const attributes = fields
          .filter(f => f.asAttribute)
          .map(f => `${f.name}="${escapeXML(String(item[f.name]))}"`)
          .join(' ')
          
        xml += `  <${itemElement}${attributes ? ' ' + attributes : ''}>\n`
        
        fields.filter(f => !f.asAttribute).forEach(field => {
          const value = escapeXML(String(item[field.name]))
          xml += `    <${field.name}>`
          xml += useCDATA ? `<![CDATA[${value}]]>` : value
          xml += `</${field.name}>\n`
        })
        
        xml += `  </${itemElement}>\n`
      })
      
      xml += `</${rootElement}>`
      setXmlData(xml)
      setIsCopied(false)
    } catch (e) {
      setError('Error generating XML: ' + e.message)
    }
  }, [count, fields, rootElement, itemElement, generateRandomData, useCDATA])

  const validateFields = useCallback(() => {
    if (fields.length === 0) return 'Please add at least one field'
    if (!rootElement.trim()) return 'Root element cannot be empty'
    if (!itemElement.trim()) return 'Item element cannot be empty'
    if (fields.some(field => !field.name.trim())) return 'All field names must be filled'
    if (new Set(fields.map(f => f.name)).size !== fields.length) return 'Field names must be unique'
    return ''
  }, [fields, rootElement, itemElement])

  const addField = () => {
    const newFieldName = `field${fields.length + 1}`
    if (!fields.some(f => f.name === newFieldName)) {
      setFields([...fields, { name: newFieldName, type: 'text', asAttribute: false }])
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
      await navigator.clipboard.writeText(xmlData)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy to clipboard: ' + err.message)
    }
  }

  const downloadAsXML = () => {
    try {
      const blob = new Blob([xmlData], { type: 'application/xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${rootElement}-${Date.now()}.xml`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to download: ' + err.message)
    }
  }

  const clearData = () => {
    setXmlData('')
    setIsCopied(false)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">XML Data Generator</h1>

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
              Root Element Name
            </label>
            <input
              type="text"
              value={rootElement}
              onChange={(e) => setRootElement(e.target.value.trim() || 'items')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., items"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Element Name
            </label>
            <input
              type="text"
              value={itemElement}
              onChange={(e) => setItemElement(e.target.value.trim() || 'item')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., item"
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
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                <input
                  type="checkbox"
                  checked={field.asAttribute}
                  onChange={(e) => updateField(index, 'asAttribute', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Attribute</label>
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
              disabled={fields.length >= 10}
            >
              + Add Field {fields.length >= 10 && '(Max 10)'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useCDATA}
              onChange={(e) => setUseCDATA(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Use CDATA for elements
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateXML}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate XML
          </button>

          {xmlData && (
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
                onClick={downloadAsXML}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download as XML
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

        {xmlData && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated XML Data ({count} items):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{xmlData}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default XMLDataGenerator