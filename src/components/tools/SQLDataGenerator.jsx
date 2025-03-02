'use client'
import React, { useState, useCallback } from 'react'

const SQLDataGenerator = () => {
  const [sqlData, setSqlData] = useState('')
  const [count, setCount] = useState(5)
  const [tableName, setTableName] = useState('users')
  const [fields, setFields] = useState([
    { name: 'id', type: 'serial', nullable: false, options: {} },
    { name: 'username', type: 'varchar', nullable: false, options: { length: 50 } },
    { name: 'email', type: 'varchar', nullable: true, options: { length: 100 } }
  ])
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')

  const MAX_ITEMS = 100
  const SQL_TYPES = [
    'serial', 'integer', 'bigint', 'decimal', 'varchar', 'text', 
    'boolean', 'date', 'timestamp', 'uuid'
  ]

  const generateRandomData = useCallback((type, options) => {
    const timestamp = Date.now()
    switch (type) {
      case 'serial':
      case 'integer':
      case 'bigint':
        const min = options.min || 1
        const max = options.max || 10000
        return Math.floor(Math.random() * (max - min + 1)) + min
      case 'decimal':
        const decimals = options.decimals || 2
        return (Math.random() * (options.max || 1000)).toFixed(decimals)
      case 'varchar':
      case 'text':
        const names = ['John', 'Emma', 'Mike', 'Sophie', 'Alex']
        return `'${names[Math.floor(Math.random() * names.length)]}'`
      case 'boolean':
        return Math.random() > 0.5 ? 'TRUE' : 'FALSE'
      case 'date':
        const date = new Date(timestamp - Math.random() * 31536000000)
        return `'${date.toISOString().split('T')[0]}'`
      case 'timestamp':
        return `'${new Date(timestamp - Math.random() * 31536000000).toISOString()}'`
      case 'uuid':
        return `'${crypto.randomUUID()}'`
      default:
        return 'NULL'
    }
  }, [])

  const validateFields = useCallback(() => {
    if (fields.length === 0) return 'Please add at least one field'
    if (!tableName.trim()) return 'Table name cannot be empty'
    if (fields.some(field => !field.name.trim())) return 'All field names must be filled'
    if (new Set(fields.map(f => f.name)).size !== fields.length) return 'Field names must be unique'
    return ''
  }, [fields, tableName])

  const generateSQL = useCallback(() => {
    const validationError = validateFields()
    if (validationError) {
      setError(validationError)
      setSqlData('')
      return
    }

    setError('')
    const items = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
      return fields.map(field => 
        field.nullable && Math.random() < 0.1 ? 'NULL' : generateRandomData(field.type, field.options)
      )
    })

    const columnNames = fields.map(f => f.name).join(', ')
    const inserts = items.map(row => 
      `INSERT INTO ${tableName} (${columnNames}) VALUES (${row.join(', ')});`
    ).join('\n')

    try {
      setSqlData(inserts)
      setIsCopied(false)
    } catch (e) {
      setError('Error generating SQL: ' + e.message)
    }
  }, [count, fields, tableName, generateRandomData, validateFields])

  const addField = () => {
    if (fields.length < 10) {
      setFields([...fields, { 
        name: `field${fields.length + 1}`, 
        type: 'varchar', 
        nullable: true, 
        options: { length: 50 } 
      }])
    }
  }

  const updateField = (index, key, value) => {
    setFields(fields.map((field, i) => 
      i === index ? { ...field, [key]: value } : field
    ))
  }

  const updateFieldOptions = (index, optionKey, value) => {
    setFields(fields.map((field, i) => 
      i === index ? { 
        ...field, 
        options: { ...field.options, [optionKey]: value } 
      } : field
    ))
  }

  const removeField = (index) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index))
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlData)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy to clipboard: ' + err.message)
    }
  }

  const downloadAsSQL = () => {
    try {
      const blob = new Blob([sqlData], { type: 'text/sql;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${tableName}-${Date.now()}.sql`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to download: ' + err.message)
    }
  }

  const clearData = () => {
    setSqlData('')
    setIsCopied(false)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          SQL Data Generator
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
              onChange={(e) => setCount(Math.max(1, Math.min(MAX_ITEMS, Number(e.target.value) || 1)))}
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
              onChange={(e) => setTableName(e.target.value.trim() || 'users')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., users"
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
                  {SQL_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.toUpperCase()}
                    </option>
                  ))}
                </select>
                <input
                  type="checkbox"
                  checked={field.nullable}
                  onChange={(e) => updateField(index, 'nullable', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">NULL</span>
                {(field.type === 'integer' || field.type === 'bigint') && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={field.options.min || ''}
                      onChange={(e) => updateFieldOptions(index, 'min', Number(e.target.value))}
                      className="w-20 p-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={field.options.max || ''}
                      onChange={(e) => updateFieldOptions(index, 'max', Number(e.target.value))}
                      className="w-20 p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}
                {field.type === 'varchar' && (
                  <input
                    type="number"
                    placeholder="Length"
                    value={field.options.length || 50}
                    onChange={(e) => updateFieldOptions(index, 'length', Number(e.target.value))}
                    className="w-20 p-2 border border-gray-300 rounded-md"
                  />
                )}
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
              + Add Column {fields.length >= 10 && '(Max 10)'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateSQL}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate SQL
          </button>

          {sqlData && (
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
                onClick={downloadAsSQL}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download as SQL
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

        {sqlData && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated SQL Statements ({count} rows):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{sqlData}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SQLDataGenerator