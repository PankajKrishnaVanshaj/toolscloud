// components/PrismaSchemaGenerator.jsx
'use client'
import React, { useState, useCallback } from 'react'

const PrismaSchemaGenerator = () => {
  const [models, setModels] = useState([
    {
      name: 'User',
      fields: [
        { name: 'id', type: 'Int', isId: true, isUnique: true, isRequired: true, defaultValue: 'autoincrement()' },
        { name: 'email', type: 'String', isId: false, isUnique: true, isRequired: true, defaultValue: '' },
        { name: 'name', type: 'String', isId: false, isUnique: false, isRequired: false, defaultValue: '' },
      ],
      relations: [],
    },
  ])
  const [schema, setSchema] = useState('')
  const [error, setError] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  const PRISMA_TYPES = [
    'String', 'Int', 'Float', 'Boolean', 'DateTime',
    'Json', 'Bytes', 'BigInt', 'Decimal'
  ]

  const MAX_MODELS = 20
  const MAX_FIELDS = 30

  const validateInput = useCallback(() => {
    if (!models.length) return 'Add at least one model'
    if (models.some(m => !m.name.trim())) return 'All models need names'
    if (new Set(models.map(m => m.name)).size !== models.length) return 'Model names must be unique'
    if (models.some(m => !/^[A-Z][A-Za-z0-9]*$/.test(m.name))) return 'Model names must start with an uppercase letter and contain only letters and numbers'

    for (const model of models) {
      if (!model.fields.length) return `Model "${model.name}" needs at least one field`
      if (model.fields.some(f => !f.name.trim())) return `All fields in "${model.name}" need names`
      if (new Set(model.fields.map(f => f.name)).size !== model.fields.length) return `Field names in "${model.name}" must be unique`
      if (!model.fields.some(f => f.isId)) return `Model "${model.name}" needs an ID field`
    }
    return ''
  }, [models])

  const generateSchema = useCallback(() => {
    const validationError = validateInput()
    if (validationError) {
      setError(validationError)
      setSchema('')
      return
    }

    setError('')
    try {
      let schemaString = `// Prisma Schema\n// Generated: ${new Date().toISOString()}\n\n`
      schemaString += 'generator client {\n  provider = "prisma-client-js"\n}\n\n'
      schemaString += 'datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\n'

      models.forEach(model => {
        schemaString += `model ${model.name} {\n`
        model.fields.forEach(field => {
          let def = `  ${field.name} ${field.type}`
          if (field.isId) def += ' @id'
          if (field.isUnique && !field.isId) def += ' @unique'
          if (field.isRequired) def += '!'
          if (field.defaultValue) def += ` @default(${field.defaultValue})`
          schemaString += `${def}\n`
        })
        
        // Add relations if any (placeholder for future enhancement)
        if (model.relations.length) {
          model.relations.forEach(rel => {
            schemaString += `  ${rel}\n`
          })
        }

        schemaString += '}\n\n'
      })

      setSchema(schemaString)
      setIsCopied(false)
    } catch (e) {
      setError(`Schema generation failed: ${e.message}`)
    }
  }, [models])

  const addModel = () => {
    if (models.length < MAX_MODELS) {
      setModels([...models, {
        name: `Model${models.length + 1}`,
        fields: [{ name: 'id', type: 'Int', isId: true, isUnique: true, isRequired: true, defaultValue: 'autoincrement()' }],
        relations: [],
      }])
    }
  }

  const updateModel = (index, name) => {
    setModels(models.map((m, i) => (i === index ? { ...m, name } : m)))
  }

  const removeModel = (index) => {
    if (models.length > 1) {
      setModels(models.filter((_, i) => i !== index))
    }
  }

  const addField = (modelIndex) => {
    if (models[modelIndex].fields.length < MAX_FIELDS) {
      const newModels = [...models]
      newModels[modelIndex].fields.push({
        name: `field${newModels[modelIndex].fields.length + 1}`,
        type: 'String',
        isId: false,
        isUnique: false,
        isRequired: false,
        defaultValue: '',
      })
      setModels(newModels)
    }
  }

  const updateField = (modelIndex, fieldIndex, key, value) => {
    const newModels = [...models]
    newModels[modelIndex].fields[fieldIndex][key] = value
    setModels(newModels)
  }

  const removeField = (modelIndex, fieldIndex) => {
    if (models[modelIndex].fields.length > 1) {
      const newModels = [...models]
      newModels[modelIndex].fields = newModels[modelIndex].fields.filter((_, i) => i !== fieldIndex)
      setModels(newModels)
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
    link.download = `schema-${Date.now()}.prisma`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Prisma Schema Generator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {models.map((model, modelIndex) => (
            <div key={modelIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="text"
                  value={model.name}
                  onChange={(e) => updateModel(modelIndex, e.target.value)}
                  placeholder="Model name"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                  onClick={() => removeModel(modelIndex)}
                  disabled={models.length <= 1}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  Delete
                </button>
              </div>

              <div className="space-y-3">
                {model.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateField(modelIndex, fieldIndex, 'name', e.target.value)}
                      placeholder="Field name"
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateField(modelIndex, fieldIndex, 'type', e.target.value)}
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {PRISMA_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={field.isId}
                          onChange={(e) => updateField(modelIndex, fieldIndex, 'isId', e.target.checked)}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded"
                        />
                        <span className="text-sm">ID</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={field.isUnique}
                          onChange={(e) => updateField(modelIndex, fieldIndex, 'isUnique', e.target.checked)}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded"
                        />
                        <span className="text-sm">UN</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={field.isRequired}
                          onChange={(e) => updateField(modelIndex, fieldIndex, 'isRequired', e.target.checked)}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded"
                        />
                        <span className="text-sm">REQ</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={field.defaultValue}
                      onChange={(e) => updateField(modelIndex, fieldIndex, 'defaultValue', e.target.value)}
                      placeholder="Default value (e.g., autoincrement())"
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <button
                      onClick={() => removeField(modelIndex, fieldIndex)}
                      disabled={model.fields.length <= 1}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addField(modelIndex)}
                  disabled={model.fields.length >= MAX_FIELDS}
                  className="text-sm text-green-600 hover:text-green-800 disabled:text-gray-400"
                >
                  + Add Field {model.fields.length >= MAX_FIELDS && `(Max ${MAX_FIELDS})`}
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addModel}
            disabled={models.length >= MAX_MODELS}
            className="text-sm text-green-600 hover:text-green-800 disabled:text-gray-400"
          >
            + Add Model {models.length >= MAX_MODELS && `(Max ${MAX_MODELS})`}
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
                Download (.prisma)
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
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Generated Prisma Schema:</h2>
            <pre className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto text-sm font-mono text-gray-800 whitespace-pre-wrap">
              {schema}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default PrismaSchemaGenerator