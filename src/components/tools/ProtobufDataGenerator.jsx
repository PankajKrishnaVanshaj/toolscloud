'use client'
import React, { useState, useCallback } from 'react'

const ProtobufDataGenerator = () => {
  const [schema, setSchema] = useState('syntax = "proto3";\nmessage Item {\n  int32 id = 1;\n  string name = 2;\n  string email = 3;\n}')
  const [count, setCount] = useState(5)
  const [generatedData, setGeneratedData] = useState('')
  const [error, setError] = useState('')
  const [previewFormat, setPreviewFormat] = useState('json')

  const MAX_ITEMS = 100
  const FIELD_TYPES = ['int32', 'string', 'bool', 'float', 'double', 'bytes']

  const parseSchema = useCallback(() => {
    try {
      const lines = schema.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('//'))
      if (!lines[0].startsWith('syntax =')) throw new Error('Schema must start with syntax definition')

      const messageMatch = schema.match(/message\s+(\w+)\s*{([^}]*)}/)
      if (!messageMatch) throw new Error('No valid message definition found')

      const [, messageName, fieldsStr] = messageMatch
      const fieldLines = fieldsStr.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//'))

      const fields = fieldLines.map(line => {
        const match = line.match(/^\s*(\w+)\s+(\w+)\s*=\s*(\d+)\s*;?\s*$/)
        if (!match) throw new Error(`Invalid field definition: ${line}`)
        
        const [, type, name, tag] = match
        if (!FIELD_TYPES.includes(type)) throw new Error(`Unsupported field type: ${type} in ${line}`)
        
        return { type, name, tag: parseInt(tag) }
      })

      return { messageName, fields }
    } catch (err) {
      throw new Error(`Schema parsing error: ${err.message}`)
    }
  }, [schema])

  const generateFieldValue = useCallback((type) => {
    const timestamp = Date.now()
    switch (type) {
      case 'int32':
        return Math.floor(Math.random() * 10000) + 1
      case 'string':
        const names = ['John', 'Emma', 'Mike', 'Sophie', 'Alex']
        return names[Math.floor(Math.random() * names.length)]
      case 'bool':
        return Math.random() > 0.5
      case 'float':
      case 'double':
        return parseFloat((Math.random() * 100).toFixed(2))
      case 'bytes':
        return `bytes_${timestamp}_${Math.random().toString(36).substring(2, 8)}`
      default:
        return null
    }
  }, [])

  const generateData = useCallback(() => {
    try {
      const { messageName, fields } = parseSchema()
      const items = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
        const obj = {}
        fields.forEach(field => {
          obj[field.name] = generateFieldValue(field.type)
        })
        return obj
      })

      let output = ''
      switch (previewFormat) {
        case 'json':
          output = JSON.stringify({ [messageName]: items }, null, 2)
          break
        case 'proto':
          output = items.map(item => {
            const fieldsStr = fields.map(f => `${f.name}: ${JSON.stringify(item[f.name])}`).join(', ')
            return `${messageName} { ${fieldsStr} }`
          }).join('\n')
          break
        case 'binary':
          output = '[Binary representation not shown - use Download for actual binary]'
          break
      }

      setGeneratedData(output)
      setError('')
    } catch (err) {
      setError(err.message)
      setGeneratedData('')
    }
  }, [schema, count, previewFormat, parseSchema, generateFieldValue])

  const downloadFile = (format) => {
    try {
      let content, filename, type
      const { messageName } = parseSchema()
      
      switch (format) {
        case 'proto':
          content = schema
          filename = `${messageName}.proto`
          type = 'text/plain'
          break
        case 'json':
          content = generatedData
          filename = `${messageName}.json`
          type = 'application/json'
          break
        case 'binary':
          content = Buffer.from(generatedData).toString('base64')
          filename = `${messageName}.bin`
          type = 'application/octet-stream'
          break
      }

      const blob = new Blob([content], { type })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Download failed: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Protobuf Data Generator
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schema Definition (.proto)
            </label>
            <textarea
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md h-40 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`syntax = "proto3";
message Item {
  int32 id = 1;
}`}
            />
          </div>

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
              Preview Format
            </label>
            <select
              value={previewFormat}
              onChange={(e) => setPreviewFormat(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="json">JSON</option>
              <option value="proto">Protobuf Text</option>
              <option value="binary">Binary (Preview Only)</option>
            </select>
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
                onClick={() => downloadFile('json')}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download JSON
              </button>
              <button
                onClick={() => downloadFile('proto')}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download .proto
              </button>
              <button
                onClick={() => downloadFile('binary')}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download Binary
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
              Generated Data Preview ({count} items):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{generatedData}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProtobufDataGenerator