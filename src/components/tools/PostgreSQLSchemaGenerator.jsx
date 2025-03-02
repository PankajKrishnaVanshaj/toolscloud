// components/PostgreSQLSchemaGenerator.jsx
'use client'
import React, { useState, useCallback } from 'react'

const PostgreSQLSchemaGenerator = () => {
  const [tables, setTables] = useState([
    {
      name: 'users',
      columns: [
        { name: 'id', type: 'SERIAL', isPrimary: true, isNullable: false, isUnique: true, defaultValue: '', isGenerated: false, generatedExpression: '' },
        { name: 'email', type: 'VARCHAR(255)', isPrimary: false, isNullable: false, isUnique: true, defaultValue: '', isGenerated: false, generatedExpression: '' },
        { name: 'full_name', type: 'TEXT', isPrimary: false, isNullable: true, isUnique: false, defaultValue: '', isGenerated: false, generatedExpression: '' },
        { name: 'created_at', type: 'TIMESTAMPTZ', isPrimary: false, isNullable: false, isUnique: false, defaultValue: 'NOW()', isGenerated: false, generatedExpression: '' },
      ],
    },
  ])
  const [schema, setSchema] = useState('')
  const [error, setError] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  const PG_TYPES = [
    'SMALLINT', 'INTEGER', 'BIGINT', 'SERIAL', 'BIGSERIAL',
    'REAL', 'DOUBLE PRECISION', 'NUMERIC',
    'CHAR', 'VARCHAR(255)', 'TEXT',
    'DATE', 'TIMESTAMP', 'TIMESTAMPTZ',
    'BOOLEAN', 'UUID', 'JSON', 'JSONB',
    'BYTEA', 'INET', 'CIDR'
  ]

  const MAX_TABLES = 20
  const MAX_COLUMNS = 30

  const validateInput = useCallback(() => {
    if (!tables.length) return 'Add at least one table'
    if (tables.some(t => !t.name.trim())) return 'All tables need names'
    if (new Set(tables.map(t => t.name)).size !== tables.length) return 'Table names must be unique'
    if (tables.some(t => !/^[a-z][a-z0-9_]*$/.test(t.name))) return 'Table names must be lowercase with letters, numbers, or underscores'

    for (const table of tables) {
      if (!table.columns.length) return `Table "${table.name}" needs at least one column`
      if (table.columns.some(c => !c.name.trim())) return `All columns in "${table.name}" need names`
      if (new Set(table.columns.map(c => c.name)).size !== table.columns.length) return `Column names in "${table.name}" must be unique`
      if (!table.columns.some(c => c.isPrimary)) return `Table "${table.name}" needs a primary key`
      if (table.columns.some(c => c.isGenerated && !c.generatedExpression)) return `Generated column in "${table.name}" needs an expression`
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
      let schemaString = `-- PostgreSQL Schema\n-- Generated: ${new Date().toISOString()}\n\n`

      tables.forEach(table => {
        schemaString += `CREATE TABLE ${table.name} (\n`
        const columnDefs = table.columns.map(col => {
          let def = `  ${col.name} ${col.type}`
          if (col.isGenerated) {
            def += ` GENERATED ALWAYS AS (${col.generatedExpression}) STORED`
          } else {
            if (!col.isNullable) def += ' NOT NULL'
            if (col.isUnique && !col.isPrimary) def += ' UNIQUE'
            if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`
          }
          return def
        })

        const primaryKeys = table.columns.filter(col => col.isPrimary).map(col => col.name)
        if (primaryKeys.length) {
          columnDefs.push(`  PRIMARY KEY (${primaryKeys.join(', ')})`);
        }

        schemaString += columnDefs.join(',\n')
        schemaString += '\n);\n\n'
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
        columns: [{ name: 'id', type: 'SERIAL', isPrimary: true, isNullable: false, isUnique: true, defaultValue: '', isGenerated: false, generatedExpression: '' }],
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

  const addColumn = (tableIndex) => {
    if (tables[tableIndex].columns.length < MAX_COLUMNS) {
      const newTables = [...tables]
      newTables[tableIndex].columns.push({
        name: `column${newTables[tableIndex].columns.length + 1}`,
        type: 'TEXT',
        isPrimary: false,
        isNullable: true,
        isUnique: false,
        defaultValue: '',
        isGenerated: false,
        generatedExpression: '',
      })
      setTables(newTables)
    }
  }

  const updateColumn = (tableIndex, columnIndex, key, value) => {
    const newTables = [...tables]
    newTables[tableIndex].columns[columnIndex][key] = value
    setTables(newTables)
  }

  const removeColumn = (tableIndex, columnIndex) => {
    if (tables[tableIndex].columns.length > 1) {
      const newTables = [...tables]
      newTables[tableIndex].columns = newTables[tableIndex].columns.filter((_, i) => i !== columnIndex)
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
    link.download = `schema-${Date.now()}.sql`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">PostgreSQL Schema Generator</h1>

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

              <div className="space-y-3">
                {table.columns.map((column, columnIndex) => (
                  <div key={columnIndex} className="flex flex-col gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="text"
                        value={column.name}
                        onChange={(e) => updateColumn(tableIndex, columnIndex, 'name', e.target.value)}
                        placeholder="Column name"
                        className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <select
                        value={column.type}
                        onChange={(e) => updateColumn(tableIndex, columnIndex, 'type', e.target.value)}
                        className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {PG_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={column.isPrimary}
                            onChange={(e) => updateColumn(tableIndex, columnIndex, 'isPrimary', e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <span className="text-sm">PK</span>
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={!column.isNullable}
                            onChange={(e) => updateColumn(tableIndex, columnIndex, 'isNullable', !e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <span className="text-sm">NN</span>
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={column.isUnique}
                            onChange={(e) => updateColumn(tableIndex, columnIndex, 'isUnique', e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <span className="text-sm">UN</span>
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={column.isGenerated}
                            onChange={(e) => updateColumn(tableIndex, columnIndex, 'isGenerated', e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <span className="text-sm">GEN</span>
                        </label>
                      </div>
                      {!column.isGenerated && (
                        <input
                          type="text"
                          value={column.defaultValue}
                          onChange={(e) => updateColumn(tableIndex, columnIndex, 'defaultValue', e.target.value)}
                          placeholder="Default value"
                          className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}
                      <button
                        onClick={() => removeColumn(tableIndex, columnIndex)}
                        disabled={table.columns.length <= 1}
                        className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                    {column.isGenerated && (
                      <input
                        type="text"
                        value={column.generatedExpression}
                        onChange={(e) => updateColumn(tableIndex, columnIndex, 'generatedExpression', e.target.value)}
                        placeholder="Generated expression (e.g., column1 + column2)"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addColumn(tableIndex)}
                  disabled={table.columns.length >= MAX_COLUMNS}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                >
                  + Add Column {table.columns.length >= MAX_COLUMNS && `(Max ${MAX_COLUMNS})`}
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
                Download (.sql)
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
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Generated Schema:</h2>
            <pre className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto text-sm font-mono text-gray-800 whitespace-pre-wrap">
              {schema}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default PostgreSQLSchemaGenerator