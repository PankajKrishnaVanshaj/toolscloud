// components/SurrealDBSchemaGenerator.jsx
'use client'
import React, { useState, useCallback } from 'react'

const SurrealDBSchemaGenerator = () => {
  const [tables, setTables] = useState([
    {
      name: 'user',
      fields: [
        { name: 'id', type: 'record', isRequired: true, defaultValue: '' },
        { name: 'email', type: 'string', isRequired: true, defaultValue: '', assertions: ['IS EMAIL'] },
        { name: 'created_at', type: 'datetime', isRequired: true, defaultValue: 'time::now()' },
      ],
    },
  ])
  const [schema, setSchema] = useState('')
  const [error, setError] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  const SURREAL_TYPES = [
    'any', 'bool', 'datetime', 'decimal', 'float', 'int', 
    'number', 'object', 'string', 'record', 'array', 
    'geometry', 'uuid', 'duration',
  ]
  
  const COMMON_ASSERTIONS = [
    'IS EMAIL', 'IS UUID', 'IS ALPHA', 'IS NUMERIC', 
    'IS ALPHANUM', '> 0', '> 18', 'CONTAINS @',
  ]

  const MAX_TABLES = 20
  const MAX_FIELDS = 30

  const validateInput = useCallback(() => {
    if (!tables.length) return 'Add at least one table'
    if (tables.some(t => !t.name.trim())) return 'All tables need names'
    if (new Set(tables.map(t => t.name)).size !== tables.length) return 'Table names must be unique'
    if (tables.some(t => !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(t.name))) return 'Table names must start with a letter and contain only letters, numbers, or underscores'

    for (const table of tables) {
      if (!table.fields.length) return `Table "${table.name}" needs at least one field`
      if (table.fields.some(f => !f.name.trim())) return `All fields in "${table.name}" need names`
      if (new Set(table.fields.map(f => f.name)).size !== table.fields.length) return `Field names in "${table.name}" must be unique`
    }
    return ''
  }, [tables])

  const generateSchema = useCallback(() => {
    const validationError = validateInput()
    if (validationError) {
      setError(validationError)
      setSchema('')
      return
    }

    setError('')
    try {
      let schemaString = `-- SurrealDB Schema\n-- Generated: ${new Date().toISOString()}\n\n`

      tables.forEach(table => {
        schemaString += `DEFINE TABLE ${table.name} SCHEMAFULL;\n\n`
        
        table.fields.forEach(field => {
          schemaString += `DEFINE FIELD ${field.name} ON TABLE ${table.name}`
          
          // Type definition
          schemaString += ` TYPE ${field.type}`
          
          // Required (NOT NULL equivalent)
          if (field.isRequired) schemaString += ' VALUE $value OR THROW "Field is required"'
          
          // Default value
          if (field.defaultValue) schemaString += ` DEFAULT ${field.defaultValue}`
          
          // Assertions
          if (field.assertions?.length) {
            field.assertions.forEach(assertion => {
              let condition = assertion
              if (assertion === 'IS EMAIL') condition = 'string::is::email($value)'
              else if (assertion === 'IS UUID') condition = 'string::is::uuid($value)'
              else if (assertion === 'IS ALPHA') condition = 'string::is::alpha($value)'
              else if (assertion === 'IS NUMERIC') condition = 'string::is::numeric($value)'
              else if (assertion === 'IS ALPHANUM') condition = 'string::is::alphanum($value)'
              else if (assertion.startsWith('>')) condition = `$value ${assertion}`
              else if (assertion.startsWith('CONTAINS')) condition = `string::contains($value, '${assertion.split(' ')[1]}')`
              
              schemaString += `\n  ASSERT ${condition}`
            })
          }
          
          schemaString += ';\n'
        })
        
        schemaString += '\n'
      })

      setSchema(schemaString)
      setIsCopied(false)
    } catch (e) {
      setError(`Schema generation failed: ${e.message}`)
    }
  }, [tables])

  const addTable = () => {
    if (tables.length < MAX_TABLES) {
      setTables([...tables, {
        name: `table${tables.length + 1}`,
        fields: [{ name: 'id', type: 'record', isRequired: true, defaultValue: '', assertions: [] }],
      }])
    }
  }

  const updateTable = (index, name) => {
    setTables(tables.map((t, i) => (i === index ? { ...t, name } : t)))
  }

  const removeTable = (index) => {
    if (tables.length > 1) {
      setTables(tables.filter((_, i) => i !== index))
    }
  }

  const addField = (tableIndex) => {
    if (tables[tableIndex].fields.length < MAX_FIELDS) {
      const newTables = [...tables]
      newTables[tableIndex].fields.push({
        name: `field${newTables[tableIndex].fields.length + 1}`,
        type: 'string',
        isRequired: false,
        defaultValue: '',
        assertions: [],
      })
      setTables(newTables)
    }
  }

  const updateField = (tableIndex, fieldIndex, key, value) => {
    const newTables = [...tables]
    newTables[tableIndex].fields[fieldIndex][key] = value
    setTables(newTables)
  }

  const toggleAssertion = (tableIndex, fieldIndex, assertion) => {
    const newTables = [...tables]
    const field = newTables[tableIndex].fields[fieldIndex]
    const assertions = field.assertions || []
    
    if (assertions.includes(assertion)) {
      field.assertions = assertions.filter(a => a !== assertion)
    } else {
      field.assertions = [...assertions, assertion]
    }
    setTables(newTables)
  }

  const removeField = (tableIndex, fieldIndex) => {
    if (tables[tableIndex].fields.length > 1) {
      const newTables = [...tables]
      newTables[tableIndex].fields = newTables[tableIndex].fields.filter((_, i) => i !== fieldIndex)
      setTables(newTables)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(schema)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      setError(`Copy failed: ${err.message}`)
    }
  }

  const downloadSchema = () => {
    const blob = new Blob([schema], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `schema-${Date.now()}.surql`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">SurrealDB Schema Generator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {tables.map((table, tableIndex) => (
            <div key={tableIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="text"
                  value={table.name}
                  onChange={(e) => updateTable(tableIndex, e.target.value)}
                  placeholder="Table name"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => removeTable(tableIndex)}
                  disabled={tables.length <= 1}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  Delete
                </button>
              </div>

              <div className="space-y-4">
                {table.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="flex flex-col gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateField(tableIndex, fieldIndex, 'name', e.target.value)}
                        placeholder="Field name"
                        className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateField(tableIndex, fieldIndex, 'type', e.target.value)}
                        className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {SURREAL_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={field.isRequired}
                          onChange={(e) => updateField(tableIndex, fieldIndex, 'isRequired', e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-sm">Required</span>
                      </label>
                      <input
                        type="text"
                        value={field.defaultValue}
                        onChange={(e) => updateField(tableIndex, fieldIndex, 'defaultValue', e.target.value)}
                        placeholder="Default value"
                        className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={() => removeField(tableIndex, fieldIndex)}
                        disabled={table.fields.length <= 1}
                        className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_ASSERTIONS.map(assertion => (
                        <label key={assertion} className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={field.assertions?.includes(assertion)}
                            onChange={() => toggleAssertion(tableIndex, fieldIndex, assertion)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          {assertion}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addField(tableIndex)}
                  disabled={table.fields.length >= MAX_FIELDS}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                >
                  + Add Field {table.fields.length >= MAX_FIELDS && `(Max ${MAX_FIELDS})`}
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addTable}
            disabled={tables.length >= MAX_TABLES}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
          >
            + Add Table {tables.length >= MAX_TABLES && `(Max ${MAX_TABLES})`}
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={generateSchema}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Schema
          </button>
          {schema && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  isCopied ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                } text-white`}
              >
                {isCopied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={downloadSchema}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Download (.surql)
              </button>
              <button
                onClick={() => setSchema('')}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {schema && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Generated SurrealQL Schema:</h2>
            <pre className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto text-sm font-mono text-gray-800 whitespace-pre-wrap">
              {schema}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default SurrealDBSchemaGenerator