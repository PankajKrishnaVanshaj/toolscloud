'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { FaCopy, FaDownload, FaTrash, FaPlus, FaHistory } from 'react-icons/fa'

const GraphQLSchemaGenerator = () => {
  const [schema, setSchema] = useState('')
  const [types, setTypes] = useState([
    {
      name: 'User',
      fields: [
        { name: 'id', type: 'ID', isNonNull: true, isList: false },
        { name: 'name', type: 'String', isNonNull: false, isList: false },
        { name: 'email', type: 'String', isNonNull: false, isList: false }
      ]
    }
  ])
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [options, setOptions] = useState({
    includeQuery: true,
    includeMutation: true,
    includeComments: true,
    formatOutput: true
  })

  const SCALAR_TYPES = ['ID', 'String', 'Int', 'Float', 'Boolean']
  const MAX_TYPES = 20
  const MAX_FIELDS = 15

  const validateInput = useCallback(() => {
    if (types.length === 0) return 'Please add at least one type'
    if (types.some(t => !t.name.trim() || !/^[A-Z][a-zA-Z0-9]*$/.test(t.name))) 
      return 'Type names must start with uppercase letter and contain only alphanumeric characters'
    if (new Set(types.map(t => t.name)).size !== types.length) return 'Type names must be unique'
    if (types.some(t => t.fields.length === 0)) return 'Each type must have at least one field'
    if (types.some(t => t.fields.some(f => !f.name.trim() || !/^[a-z][a-zA-Z0-9]*$/.test(f.name)))) 
      return 'Field names must start with lowercase letter and contain only alphanumeric characters'
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
      let schemaString = options.includeComments ? '# Generated GraphQL Schema\n\n' : ''
      
      // Generate type definitions
      types.forEach((type, index) => {
        if (options.includeComments && index > 0) schemaString += '\n'
        schemaString += `type ${type.name} {\n`
        type.fields.forEach(field => {
          const fieldType = types.some(t => t.name === field.type) ? field.type : field.type
          const typeNotation = field.isList ? `[${fieldType}${field.isNonNull ? '!' : ''}]` : fieldType
          schemaString += options.formatOutput 
            ? `  ${field.name}: ${typeNotation}${field.isNonNull && !field.isList ? '!' : ''}\n`
            : `${field.name}:${typeNotation}${field.isNonNull && !field.isList ? '!' : ''}\n`
        })
        schemaString += '}\n'
      })

      // Generate Query type
      if (options.includeQuery) {
        schemaString += '\n\ntype Query {\n'
        types.forEach(type => {
          schemaString += options.formatOutput 
            ? `  ${type.name.toLowerCase()}s: [${type.name}]\n`
            : `${type.name.toLowerCase()}s:[${type.name}]\n`
          schemaString += options.formatOutput 
            ? `  ${type.name.toLowerCase()}(id: ID!): ${type.name}\n`
            : `${type.name.toLowerCase()}(id:ID!):${type.name}\n`
        })
        schemaString += '}\n'
      }

      // Generate Mutation type
      if (options.includeMutation) {
        schemaString += '\n\ntype Mutation {\n'
        types.forEach(type => {
          const fieldsStr = type.fields.map(f => 
            `${f.name}: ${f.isList ? `[${f.type}]` : f.type}${f.isNonNull ? '!' : ''}`
          ).join(', ')
          schemaString += options.formatOutput 
            ? `  create${type.name}(${fieldsStr}): ${type.name}\n`
            : `create${type.name}(${fieldsStr}):${type.name}\n`
          schemaString += options.formatOutput 
            ? `  update${type.name}(id: ID!, ${fieldsStr}): ${type.name}\n`
            : `update${type.name}(id:ID!,${fieldsStr}):${type.name}\n`
          schemaString += options.formatOutput 
            ? `  delete${type.name}(id: ID!): Boolean\n`
            : `delete${type.name}(id:ID!):Boolean\n`
        })
        schemaString += '}\n'
      }

      setSchema(schemaString.trim())
      setHistory(prev => [...prev.slice(-4), schemaString.trim()])
    } catch (e) {
      setError('Error generating schema: ' + e.message)
    }
  }, [types, options])

  const addType = () => {
    if (types.length < MAX_TYPES) {
      setTypes([...types, { 
        name: `Type${types.length + 1}`, 
        fields: [{ name: 'id', type: 'ID', isNonNull: true, isList: false }] 
      }])
    }
  }

  const updateType = (index, key, value) => {
    setTypes(types.map((t, i) => i === index ? { ...t, [key]: value } : t))
  }

  const removeType = (index) => {
    if (types.length > 1) setTypes(types.filter((_, i) => i !== index))
  }

  const addField = (typeIndex) => {
    const newTypes = [...types]
    if (newTypes[typeIndex].fields.length < MAX_FIELDS) {
      newTypes[typeIndex].fields.push({ 
        name: `field${newTypes[typeIndex].fields.length + 1}`, 
        type: 'String', 
        isNonNull: false,
        isList: false 
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
    await navigator.clipboard.writeText(schema)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const downloadSchema = () => {
    const blob = new Blob([schema], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `schema-${Date.now()}.graphql`
    link.click()
    URL.revokeObjectURL(url)
  }

  const restoreFromHistory = (schemaText) => {
    setSchema(schemaText)
  }

  useEffect(() => {
    generateSchema()
  }, [types, options, generateSchema])

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">GraphQL Schema Generator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Generation Options</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(options).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Types Editor */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Types ({types.length}/{MAX_TYPES})
          </label>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {types.map((type, typeIndex) => (
              <div key={typeIndex} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
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
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
                <div className="space-y-3">
                  {type.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="flex flex-col sm:flex-row gap-2 items-center">
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateField(typeIndex, fieldIndex, 'name', e.target.value)}
                        placeholder="Field Name"
                        className="w-full sm:flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateField(typeIndex, fieldIndex, 'type', e.target.value)}
                        className="w-full sm:flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {[...SCALAR_TYPES, ...types.map(t => t.name)].map(typeName => (
                          <option key={typeName} value={typeName}>{typeName}</option>
                        ))}
                      </select>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={field.isNonNull}
                          onChange={(e) => updateField(typeIndex, fieldIndex, 'isNonNull', e.target.checked)}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="text-sm">Non-null</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={field.isList}
                          onChange={(e) => updateField(typeIndex, fieldIndex, 'isList', e.target.checked)}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="text-sm">List</span>
                      </label>
                      <button
                        onClick={() => removeField(typeIndex, fieldIndex)}
                        disabled={type.fields.length <= 1}
                        className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addField(typeIndex)}
                    disabled={type.fields.length >= MAX_FIELDS}
                    className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                  >
                    <FaPlus className="inline mr-1" /> Add Field {type.fields.length >= MAX_FIELDS && `(Max ${MAX_FIELDS})`}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={addType}
            disabled={types.length >= MAX_TYPES}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
          >
            <FaPlus className="inline mr-1" /> Add Type {types.length >= MAX_TYPES && `(Max ${MAX_TYPES})`}
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={copyToClipboard}
            disabled={!schema}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:text-gray-500 flex items-center justify-center ${
              isCopied ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <FaCopy className="mr-2" /> {isCopied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={downloadSchema}
            disabled={!schema}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download
          </button>
          <button
            onClick={() => { setSchema(''); setTypes([{ name: 'User', fields: [{ name: 'id', type: 'ID', isNonNull: true, isList: false }] }]) }}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaTrash className="mr-2" /> Reset
          </button>
        </div>

        {/* Generated Schema */}
        {schema && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Generated Schema</h2>
            <pre className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-auto font-mono text-sm text-gray-800 whitespace-pre-wrap">
              {schema}
            </pre>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center mb-2">
              <FaHistory className="mr-2" /> Recent Schemas (Last 5)
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{entry.slice(0, 50)}...</span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Custom type and field definitions</li>
            <li>Support for lists and non-null types</li>
            <li>Automatic Query and Mutation generation</li>
            <li>Schema history tracking</li>
            <li>Copy and download functionality</li>
            <li>Configurable output options</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default GraphQLSchemaGenerator