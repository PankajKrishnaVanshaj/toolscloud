// components/MongoDBSchemaGenerator.jsx
'use client'
import React, { useState, useCallback } from 'react'

const MongoDBSchemaGenerator = () => {
  const [collections, setCollections] = useState([
    {
      name: 'users',
      fields: [
        { name: '_id', type: 'ObjectId', required: true, index: false },
        { name: 'email', type: 'string', required: true, index: true },
        { name: 'createdAt', type: 'date', required: false, index: false, defaultValue: 'new Date()' },
      ],
    },
  ])
  const [schema, setSchema] = useState('')
  const [error, setError] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  const MONGO_TYPES = [
    'string', 'number', 'boolean', 'date', 'ObjectId',
    'array', 'object', 'binary', 'mixed'
  ]

  const MAX_COLLECTIONS = 20
  const MAX_FIELDS = 30

  const validateInput = useCallback(() => {
    if (!collections.length) return 'Add at least one collection'
    if (collections.some(c => !c.name.trim())) return 'All collections need names'
    if (new Set(collections.map(c => c.name)).size !== collections.length) return 'Collection names must be unique'
    if (collections.some(c => !/^[a-z][a-z0-9_]*$/.test(c.name))) return 'Collection names must be lowercase with letters, numbers, or underscores'

    for (const collection of collections) {
      if (!collection.fields.length) return `Collection "${collection.name}" needs at least one field`
      if (collection.fields.some(f => !f.name.trim())) return `All fields in "${collection.name}" need names`
      if (new Set(collection.fields.map(f => f.name)).size !== collection.fields.length) return `Field names in "${collection.name}" must be unique`
    }
    return ''
  }, [collections])

  const generateSchema = useCallback(() => {
    const validationError = validateInput()
    if (validationError) {
      setError(validationError)
      setSchema('')
      return
    }

    setError('')
    try {
      let schemaString = '// MongoDB Schema Definition (JavaScript/JSON)\n'
      schemaString += '// Use with MongoDB Node.js driver or Mongoose\n\n'

      collections.forEach(collection => {
        schemaString += `// Collection: ${collection.name}\n`
        schemaString += `db.createCollection("${collection.name}", {\n`
        schemaString += '  validator: {\n'
        schemaString += '    $jsonSchema: {\n'
        schemaString += '      bsonType: "object",\n'
        schemaString += '      required: ['
        const requiredFields = collection.fields.filter(f => f.required).map(f => `"${f.name}"`).join(', ')
        schemaString += requiredFields ? `${requiredFields}` : ''
        schemaString += '],\n'
        schemaString += '      properties: {\n'

        collection.fields.forEach(field => {
          schemaString += `        ${field.name}: {\n`
          schemaString += `          bsonType: "${field.type === 'ObjectId' ? 'objectId' : field.type}",\n`
          if (field.defaultValue) {
            schemaString += `          default: ${field.defaultValue},\n`
          }
          schemaString += '        },\n'
        })

        schemaString += '      }\n'
        schemaString += '    }\n'
        schemaString += '  }\n'
        schemaString += '});\n\n'

        // Add indexes
        const indexedFields = collection.fields.filter(f => f.index)
        if (indexedFields.length) {
          schemaString += `// Indexes for ${collection.name}\n`
          indexedFields.forEach(field => {
            schemaString += `db.${collection.name}.createIndex({ "${field.name}": 1 });\n`
          })
          schemaString += '\n'
        }
      })

      setSchema(schemaString)
      setIsCopied(false)
    } catch (e) {
      setError(`Schema generation failed: ${e.message}`)
    }
  }, [collections])

  const addCollection = () => {
    if (collections.length < MAX_COLLECTIONS) {
      setCollections([...collections, {
        name: `collection${collections.length + 1}`,
        fields: [{ name: '_id', type: 'ObjectId', required: true, index: false }],
      }])
    }
  }

  const updateCollection = (index, name) => {
    setCollections(collections.map((c, i) => (i === index ? { ...c, name } : c)))
  }

  const removeCollection = (index) => {
    if (collections.length > 1) {
      setCollections(collections.filter((_, i) => i !== index))
    }
  }

  const addField = (collectionIndex) => {
    if (collections[collectionIndex].fields.length < MAX_FIELDS) {
      const newCollections = [...collections]
      newCollections[collectionIndex].fields.push({
        name: `field${newCollections[collectionIndex].fields.length + 1}`,
        type: 'string',
        required: false,
        index: false,
        defaultValue: '',
      })
      setCollections(newCollections)
    }
  }

  const updateField = (collectionIndex, fieldIndex, key, value) => {
    const newCollections = [...collections]
    newCollections[collectionIndex].fields[fieldIndex][key] = value
    setCollections(newCollections)
  }

  const removeField = (collectionIndex, fieldIndex) => {
    if (collections[collectionIndex].fields.length > 1) {
      const newCollections = [...collections]
      newCollections[collectionIndex].fields = newCollections[collectionIndex].fields.filter((_, i) => i !== fieldIndex)
      setCollections(newCollections)
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
    link.download = `schema-${Date.now()}.js`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">MongoDB Schema Generator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {collections.map((collection, collectionIndex) => (
            <div key={collectionIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="text"
                  value={collection.name}
                  onChange={(e) => updateCollection(collectionIndex, e.target.value)}
                  placeholder="Collection name"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                  onClick={() => removeCollection(collectionIndex)}
                  disabled={collections.length <= 1}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  Delete
                </button>
              </div>

              <div className="space-y-3">
                {collection.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateField(collectionIndex, fieldIndex, 'name', e.target.value)}
                      placeholder="Field name"
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateField(collectionIndex, fieldIndex, 'type', e.target.value)}
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {MONGO_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(collectionIndex, fieldIndex, 'required', e.target.checked)}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded"
                        />
                        <span className="text-sm">Required</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={field.index}
                          onChange={(e) => updateField(collectionIndex, fieldIndex, 'index', e.target.checked)}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded"
                        />
                        <span className="text-sm">Index</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={field.defaultValue}
                      onChange={(e) => updateField(collectionIndex, fieldIndex, 'defaultValue', e.target.value)}
                      placeholder="Default value (e.g., new Date())"
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <button
                      onClick={() => removeField(collectionIndex, fieldIndex)}
                      disabled={collection.fields.length <= 1}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addField(collectionIndex)}
                  disabled={collection.fields.length >= MAX_FIELDS}
                  className="text-sm text-green-600 hover:text-green-800 disabled:text-gray-400"
                >
                  + Add Field {collection.fields.length >= MAX_FIELDS && `(Max ${MAX_FIELDS})`}
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addCollection}
            disabled={collections.length >= MAX_COLLECTIONS}
            className="text-sm text-green-600 hover:text-green-800 disabled:text-gray-400"
          >
            + Add Collection {collections.length >= MAX_COLLECTIONS && `(Max ${MAX_COLLECTIONS})`}
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={generateSchema}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
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
                Download (.js)
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

export default MongoDBSchemaGenerator