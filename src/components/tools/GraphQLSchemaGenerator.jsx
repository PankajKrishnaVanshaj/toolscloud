'use client'
import React, { useState, useCallback } from 'react'

const GraphQLSchemaGenerator = () => {
  const [schema, setSchema] = useState('')
  const [types, setTypes] = useState([
    {
      name: 'User',
      fields: [
        { name: 'id', type: 'ID', isNonNull: true },
        { name: 'name', type: 'String', isNonNull: false },
        { name: 'email', type: 'String', isNonNull: false }
      ]
    }
  ])
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')

  const SCALAR_TYPES = ['ID', 'String', 'Int', 'Float', 'Boolean']
  const MAX_TYPES = 20
  const MAX_FIELDS = 15

  const validateInput = useCallback(() => {
    if (types.length === 0) return 'Please add at least one type'
    if (types.some(t => !t.name.trim())) return 'All type names must be filled'
    if (new Set(types.map(t => t.name)).size !== types.length) return 'Type names must be unique'
    if (types.some(t => t.fields.length === 0)) return 'Each type must have at least one field'
    if (types.some(t => t.fields.some(f => !f.name.trim()))) return 'All field names must be filled'
    return ''
  }, [types])

  const generateSchema = useCallback(() => {
    const validationError = validateInput()
    if (validationError) {
      setError(validationError)
      setSchema('')
      return
    }

    setError('')
    try {
      let schemaString = '# Generated GraphQL Schema\n\n'
      
      // Generate type definitions
      types.forEach(type => {
        schemaString += `type ${type.name} {\n`
        type.fields.forEach(field => {
          const fieldType = types.some(t => t.name === field.type) 
            ? field.type 
            : field.type
          schemaString += `  ${field.name}: ${fieldType}${field.isNonNull ? '!' : ''}\n`
        })
        schemaString += '}\n\n'
      })

      // Generate basic Query type
      schemaString += 'type Query {\n'
      types.forEach(type => {
        schemaString += `  ${type.name.toLowerCase()}s: [${type.name}]\n`
        schemaString += `  ${type.name.toLowerCase()}(id: ID!): ${type.name}\n`
      })
      schemaString += '}\n\n'

      // Generate basic Mutation type
      schemaString += 'type Mutation {\n'
      types.forEach(type => {
        schemaString += `  create${type.name}(${type.fields
          .map(f => `${f.name}: ${f.type}${f.isNonNull ? '!' : ''}`)
          .join(', ')}): ${type.name}\n`
        schemaString += `  update${type.name}(id: ID!, ${type.fields
          .map(f => `${f.name}: ${f.type}`)
          .join(', ')}): ${type.name}\n`
        schemaString += `  delete${type.name}(id: ID!): Boolean\n`
      })
      schemaString += '}'

      setSchema(schemaString)
      setIsCopied(false)
    } catch (e) {
      setError('Error generating schema: ' + e.message)
    }
  }, [types])

  const addType = () => {
    if (types.length < MAX_TYPES) {
      setTypes([...types, { 
        name: `Type${types.length + 1}`, 
        fields: [{ name: 'id', type: 'ID', isNonNull: true }] 
      }])
    }
  }

  const updateType = (index, key, value) => {
    setTypes(types.map((t, i) => 
      i === index ? { ...t, [key]: value } : t
    ))
  }

  const removeType = (index) => {
    if (types.length > 1) {
      setTypes(types.filter((_, i) => i !== index))
    }
  }

  const addField = (typeIndex) => {
    const newTypes = [...types]
    if (newTypes[typeIndex].fields.length < MAX_FIELDS) {
      newTypes[typeIndex].fields.push({ 
        name: `field${newTypes[typeIndex].fields.length + 1}`, 
        type: 'String', 
        isNonNull: false 
      })
      setTypes(newTypes)
    }
  }

  const updateField = (typeIndex, fieldIndex, key, value) => {
    const newTypes = [...types]
    newTypes[typeIndex].fields[fieldIndex][key] = value
    setTypes(newTypes)
  }

  const removeField = (typeIndex, fieldIndex) => {
    const newTypes = [...types]
    if (newTypes[typeIndex].fields.length > 1) {
      newTypes[typeIndex].fields = newTypes[typeIndex].fields.filter((_, i) => i !== fieldIndex)
      setTypes(newTypes)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(schema)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy: ' + err.message)
    }
  }

  const downloadSchema = () => {
    try {
      const blob = new Blob([schema], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `schema-${Date.now()}.graphql`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to download: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          GraphQL Schema Generator
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Types ({types.length}/{MAX_TYPES})
            </label>
            {types.map((type, typeIndex) => (
              <div key={typeIndex} className="mb-4 p-4 border rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={type.name}
                    onChange={(e) => updateType(typeIndex, 'name', e.target.value)}
                    placeholder="Type Name"
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeType(typeIndex)}
                    disabled={types.length <= 1}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
                  >
                    X
                  </button>
                </div>
                <div className="space-y-2">
                  {type.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateField(typeIndex, fieldIndex, 'name', e.target.value)}
                        placeholder="Field Name"
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateField(typeIndex, fieldIndex, 'type', e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {[...SCALAR_TYPES, ...types.map(t => t.name)].map(typeName => (
                          <option key={typeName} value={typeName}>
                            {typeName}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={field.isNonNull}
                          onChange={(e) => updateField(typeIndex, fieldIndex, 'isNonNull', e.target.checked)}
                        />
                        Non-null
                      </label>
                      <button
                        onClick={() => removeField(typeIndex, fieldIndex)}
                        disabled={type.fields.length <= 1}
                        className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
                      >
                        X
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addField(typeIndex)}
                    disabled={type.fields.length >= MAX_FIELDS}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Field {type.fields.length >= MAX_FIELDS && `(Max ${MAX_FIELDS})`}
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addType}
              disabled={types.length >= MAX_TYPES}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Type {types.length >= MAX_TYPES && `(Max ${MAX_TYPES})`}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateSchema}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Schema
          </button>

          {schema && (
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
                onClick={downloadSchema}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download (.graphql)
              </button>

              <button
                onClick={() => setSchema('')}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {schema && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated GraphQL Schema:
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{schema}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GraphQLSchemaGenerator