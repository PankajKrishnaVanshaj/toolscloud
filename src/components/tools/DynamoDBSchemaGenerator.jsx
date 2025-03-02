// components/DynamoDBSchemaGenerator.jsx
'use client'
import React, { useState, useCallback } from 'react'

const DynamoDBSchemaGenerator = () => {
  const [tables, setTables] = useState([
    {
      name: 'Users',
      partitionKey: { name: 'userId', type: 'S' },
      sortKey: { name: '', type: 'S' },
      attributes: [
        { name: 'userId', type: 'S', isPartitionKey: true, isSortKey: false },
        { name: 'email', type: 'S', isPartitionKey: false, isSortKey: false },
        { name: 'createdAt', type: 'N', isPartitionKey: false, isSortKey: false },
      ],
      globalSecondaryIndexes: [],
    },
  ])
  const [schema, setSchema] = useState('')
  const [error, setError] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  const DYNAMO_TYPES = ['S', 'N', 'B'] // String, Number, Binary
  const MAX_TABLES = 20
  const MAX_ATTRIBUTES = 30
  const MAX_INDEXES = 20

  const validateInput = useCallback(() => {
    if (!tables.length) return 'Add at least one table'
    if (tables.some(t => !t.name.trim())) return 'All tables need names'
    if (new Set(tables.map(t => t.name)).size !== tables.length) return 'Table names must be unique'
    if (tables.some(t => !/^[A-Za-z0-9\-_]+$/.test(t.name))) return 'Table names must contain only letters, numbers, hyphens, or underscores'

    for (const table of tables) {
      if (!table.partitionKey.name) return `Table "${table.name}" needs a partition key`
      if (!table.attributes.some(a => a.name === table.partitionKey.name)) return `Partition key "${table.partitionKey.name}" not found in "${table.name}" attributes`
      if (table.sortKey.name && !table.attributes.some(a => a.name === table.sortKey.name)) return `Sort key "${table.sortKey.name}" not found in "${table.name}" attributes`
      if (table.attributes.some(a => !a.name.trim())) return `All attributes in "${table.name}" need names`
      if (new Set(table.attributes.map(a => a.name)).size !== table.attributes.length) return `Attribute names in "${table.name}" must be unique`
      table.globalSecondaryIndexes.forEach((gsi, index) => {
        if (!gsi.partitionKey.name) return `GSI #${index + 1} in "${table.name}" needs a partition key`
        if (!table.attributes.some(a => a.name === gsi.partitionKey.name)) return `GSI partition key "${gsi.partitionKey.name}" not found in "${table.name}" attributes`
      })
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
      const schemaObject = tables.map(table => ({
        TableName: table.name,
        KeySchema: [
          { AttributeName: table.partitionKey.name, KeyType: 'HASH' },
          ...(table.sortKey.name ? [{ AttributeName: table.sortKey.name, KeyType: 'RANGE' }] : []),
        ],
        AttributeDefinitions: table.attributes.map(attr => ({
          AttributeName: attr.name,
          AttributeType: attr.type,
        })),
        BillingMode: 'PROVISIONED',
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
        ...(table.globalSecondaryIndexes.length > 0 && {
          GlobalSecondaryIndexes: table.globalSecondaryIndexes.map(gsi => ({
            IndexName: `${table.name}-${gsi.partitionKey.name}-index`,
            KeySchema: [
              { AttributeName: gsi.partitionKey.name, KeyType: 'HASH' },
              ...(gsi.sortKey.name ? [{ AttributeName: gsi.sortKey.name, KeyType: 'RANGE' }] : []),
            ],
            Projection: { ProjectionType: 'ALL' },
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            },
          })),
        }),
      }))

      setSchema(JSON.stringify(schemaObject, null, 2))
      setIsCopied(false)
    } catch (e) {
      setError(`Schema generation failed: ${e.message}`)
    }
  }, [tables])

  const addTable = () => {
    if (tables.length < MAX_TABLES) {
      setTables([...tables, {
        name: `Table${tables.length + 1}`,
        partitionKey: { name: '', type: 'S' },
        sortKey: { name: '', type: 'S' },
        attributes: [{ name: 'id', type: 'S', isPartitionKey: true, isSortKey: false }],
        globalSecondaryIndexes: [],
      }])
    }
  }

  const updateTable = (index, key, value) => {
    setTables(tables.map((t, i) => (i === index ? { ...t, [key]: value } : t)))
  }

  const removeTable = (index) => {
    if (tables.length > 1) {
      setTables(tables.filter((_, i) => i !== index))
    }
  }

  const addAttribute = (tableIndex) => {
    if (tables[tableIndex].attributes.length < MAX_ATTRIBUTES) {
      const newTables = [...tables]
      newTables[tableIndex].attributes.push({
        name: `attr${newTables[tableIndex].attributes.length + 1}`,
        type: 'S',
        isPartitionKey: false,
        isSortKey: false,
      })
      setTables(newTables)
    }
  }

  const updateAttribute = (tableIndex, attrIndex, key, value) => {
    const newTables = [...tables]
    newTables[tableIndex].attributes[attrIndex][key] = value
    if (key === 'name' && newTables[tableIndex].attributes[attrIndex].isPartitionKey) {
      newTables[tableIndex].partitionKey.name = value
    }
    if (key === 'name' && newTables[tableIndex].attributes[attrIndex].isSortKey) {
      newTables[tableIndex].sortKey.name = value
    }
    setTables(newTables)
  }

  const removeAttribute = (tableIndex, attrIndex) => {
    if (tables[tableIndex].attributes.length > 1) {
      const newTables = [...tables]
      newTables[tableIndex].attributes = newTables[tableIndex].attributes.filter((_, i) => i !== attrIndex)
      setTables(newTables)
    }
  }

  const addGSI = (tableIndex) => {
    if (tables[tableIndex].globalSecondaryIndexes.length < MAX_INDEXES) {
      const newTables = [...tables]
      newTables[tableIndex].globalSecondaryIndexes.push({
        partitionKey: { name: '', type: 'S' },
        sortKey: { name: '', type: 'S' },
      })
      setTables(newTables)
    }
  }

  const updateGSI = (tableIndex, gsiIndex, key, value) => {
    const newTables = [...tables]
    newTables[tableIndex].globalSecondaryIndexes[gsiIndex][key] = value
    setTables(newTables)
  }

  const removeGSI = (tableIndex, gsiIndex) => {
    const newTables = [...tables]
    newTables[tableIndex].globalSecondaryIndexes = newTables[tableIndex].globalSecondaryIndexes.filter((_, i) => i !== gsiIndex)
    setTables(newTables)
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
    const blob = new Blob([schema], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dynamodb-schema-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">DynamoDB Schema Generator</h1>

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
                  onChange={(e) => updateTable(tableIndex, 'name', e.target.value)}
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

              {/* Key Schema */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Key Schema</h3>
                <div className="flex gap-3 items-center">
                  <select
                    value={table.partitionKey.name}
                    onChange={(e) => updateTable(tableIndex, 'partitionKey', { ...table.partitionKey, name: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Partition Key</option>
                    {table.attributes.map(attr => (
                      <option key={attr.name} value={attr.name}>{attr.name}</option>
                    ))}
                  </select>
                  <select
                    value={table.sortKey.name}
                    onChange={(e) => updateTable(tableIndex, 'sortKey', { ...table.sortKey, name: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Sort Key (optional)</option>
                    {table.attributes.map(attr => (
                      <option key={attr.name} value={attr.name}>{attr.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Attributes */}
              <div className="space-y-3 mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Attributes</h3>
                {table.attributes.map((attr, attrIndex) => (
                  <div key={attrIndex} className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <input
                      type="text"
                      value={attr.name}
                      onChange={(e) => updateAttribute(tableIndex, attrIndex, 'name', e.target.value)}
                      placeholder="Attribute name"
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <select
                      value={attr.type}
                      onChange={(e) => updateAttribute(tableIndex, attrIndex, 'type', e.target.value)}
                      className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {DYNAMO_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeAttribute(tableIndex, attrIndex)}
                      disabled={table.attributes.length <= 1}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addAttribute(tableIndex)}
                  disabled={table.attributes.length >= MAX_ATTRIBUTES}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                >
                  + Add Attribute {table.attributes.length >= MAX_ATTRIBUTES && `(Max ${MAX_ATTRIBUTES})`}
                </button>
              </div>

              {/* Global Secondary Indexes */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Global Secondary Indexes</h3>
                {table.globalSecondaryIndexes.map((gsi, gsiIndex) => (
                  <div key={gsiIndex} className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <select
                      value={gsi.partitionKey.name}
                      onChange={(e) => updateGSI(tableIndex, gsiIndex, 'partitionKey', { ...gsi.partitionKey, name: e.target.value })}
                      className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Partition Key</option>
                      {table.attributes.map(attr => (
                        <option key={attr.name} value={attr.name}>{attr.name}</option>
                      ))}
                    </select>
                    <select
                      value={gsi.sortKey.name}
                      onChange={(e) => updateGSI(tableIndex, gsiIndex, 'sortKey', { ...gsi.sortKey, name: e.target.value })}
                      className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Sort Key (optional)</option>
                      {table.attributes.map(attr => (
                        <option key={attr.name} value={attr.name}>{attr.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeGSI(tableIndex, gsiIndex)}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addGSI(tableIndex)}
                  disabled={table.globalSecondaryIndexes.length >= MAX_INDEXES}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                >
                  + Add GSI {table.globalSecondaryIndexes.length >= MAX_INDEXES && `(Max ${MAX_INDEXES})`}
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
                Download (.json)
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
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Generated Schema (JSON):</h2>
            <pre className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto text-sm font-mono text-gray-800 whitespace-pre-wrap">
              {schema}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default DynamoDBSchemaGenerator