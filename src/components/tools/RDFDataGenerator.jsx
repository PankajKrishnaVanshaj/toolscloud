'use client'
import React, { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'

const RDFDataGenerator = () => {
  const [rdfData, setRdfData] = useState('')
  const [count, setCount] = useState(5)
  const [baseUri, setBaseUri] = useState('http://example.org/')
  const [prefixes, setPrefixes] = useState([
    { prefix: 'ex', uri: 'http://example.org/' },
    { prefix: 'rdf', uri: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#' },
    { prefix: 'rdfs', uri: 'http://www.w3.org/2000/01/rdf-schema#' }
  ])
  const [properties, setProperties] = useState([
    { name: 'name', type: 'string', required: false },
    { name: 'age', type: 'integer', required: false },
    { name: 'active', type: 'boolean', required: false }
  ])
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')

  const MAX_ITEMS = 1000
  const PROPERTY_TYPES = ['string', 'integer', 'boolean', 'date', 'uri']

  const generateRandomData = useCallback((type, required) => {
    const timestamp = Date.now()
    let value
    switch (type) {
      case 'string':
        const subjects = ['person', 'item', 'entity', 'resource']
        value = `${subjects[Math.floor(Math.random() * subjects.length)]}_${timestamp}_${Math.random().toString(36).substring(2, 8)}`
        break
      case 'integer':
        value = Math.floor(Math.random() * 100)
        break
      case 'boolean':
        value = Math.random() > 0.5
        break
      case 'date':
        value = new Date(timestamp - Math.random() * 31536000000).toISOString().split('T')[0]
        break
      case 'uri':
        value = `${baseUri}resource/${Math.random().toString(36).substring(2, 8)}`
        break
      default:
        value = ''
    }
    return required && !value ? generateRandomData(type, required) : value
  }, [baseUri])

  const generateRDF = useCallback(() => {
    const validationError = validateInputs()
    if (validationError) {
      setError(validationError)
      setRdfData('')
      console.error('Validation failed:', validationError)
      return
    }

    setError('')
    console.log('Generating', count, 'RDF triples...')

    try {
      // Generate prefix declarations
      let rdfContent = prefixes.map(p => `@prefix ${p.prefix}: <${p.uri}> .\n`).join('')
      rdfContent += '\n'

      // Generate resources
      const resources = Array.from({ length: Math.min(count, MAX_ITEMS) }, (_, index) => {
        const resourceUri = `<${baseUri}resource/${index + 1}>`
        let triples = `${resourceUri} a ex:Resource ;\n`
        
        triples += properties.map((prop, idx) => {
          const value = generateRandomData(prop.type, prop.required)
          let formattedValue
          switch (prop.type) {
            case 'string':
              formattedValue = `"${value}"`
              break
            case 'integer':
              formattedValue = `"${value}"^^xsd:integer`
              break
            case 'boolean':
              formattedValue = `"${value}"^^xsd:boolean`
              break
            case 'date':
              formattedValue = `"${value}"^^xsd:date`
              break
            case 'uri':
              formattedValue = `<${value}>`
              break
            default:
              formattedValue = `"${value}"`
          }
          return `  ex:${prop.name} ${formattedValue}${idx === properties.length - 1 ? ' .' : ' ;'}`
        }).join('\n')
        
        return triples
      }).join('\n\n')

      rdfContent += resources
      setRdfData(rdfContent)
      setIsCopied(false)
      
      console.log('Generated RDF size:', rdfContent.length, 'characters')
    } catch (err) {
      setError('Generation failed: ' + err.message)
      console.error('Generation failed:', err)
    }
  }, [count, baseUri, prefixes, properties, generateRandomData])

  const validateInputs = () => {
    if (properties.length === 0) return 'Please add at least one property'
    if (!baseUri.trim()) return 'Base URI cannot be empty'
    if (prefixes.length === 0) return 'Please add at least one prefix'
    if (prefixes.some(p => !p.prefix.trim() || !p.uri.trim())) return 'All prefixes must have a name and URI'
    if (new Set(prefixes.map(p => p.prefix)).size !== prefixes.length) return 'Prefix names must be unique'
    if (properties.some(p => !p.name.trim())) return 'All property names must be filled'
    if (new Set(properties.map(p => p.name)).size !== properties.length) return 'Property names must be unique'
    return ''
  }

  const addProperty = () => {
    if (properties.length < 20) {
      setProperties([...properties, { 
        name: `property${properties.length + 1}`, 
        type: 'string', 
        required: false 
      }])
    }
  }

  const updateProperty = (index, key, value) => {
    setProperties(properties.map((prop, i) => 
      i === index ? { ...prop, [key]: value } : prop
    ))
  }

  const removeProperty = (index) => {
    if (properties.length > 1) {
      setProperties(properties.filter((_, i) => i !== index))
    }
  }

  const addPrefix = () => {
    if (prefixes.length < 10) {
      setPrefixes([...prefixes, { prefix: `ns${prefixes.length + 1}`, uri: `http://example.org/ns${prefixes.length + 1}/` }])
    }
  }

  const updatePrefix = (index, key, value) => {
    setPrefixes(prefixes.map((prefix, i) => 
      i === index ? { ...prefix, [key]: value } : prefix
    ))
  }

  const removePrefix = (index) => {
    if (prefixes.length > 1) {
      setPrefixes(prefixes.filter((_, i) => i !== index))
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(rdfData)
      setIsCopied(true)
      console.log('RDF data copied to clipboard')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy: ' + err.message)
      console.error('Copy failed:', err.message)
    }
  }

  const downloadFile = () => {
    try {
      const blob = new Blob([rdfData], { type: 'text/turtle;charset=utf-8' })
      saveAs(blob, 'data.ttl')
      console.log('Downloaded data.ttl')
    } catch (err) {
      setError('Download failed: ' + err.message)
      console.error('Download failed:', err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          RDF Data Generator
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Resources (1-{MAX_ITEMS})
            </label>
            <input
              type="number"
              min="1"
              max={MAX_ITEMS}
              value={count}
              onChange={(e) => {
                const newCount = Math.max(1, Math.min(MAX_ITEMS, Number(e.target.value) || 1))
                setCount(newCount)
                console.log('Count updated to:', newCount)
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base URI
            </label>
            <input
              type="text"
              value={baseUri}
              onChange={(e) => setBaseUri(e.target.value.trim() || 'http://example.org/')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., http://example.org/"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prefixes ({prefixes.length})
            </label>
            {prefixes.map((prefix, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={prefix.prefix}
                  onChange={(e) => updatePrefix(index, 'prefix', e.target.value)}
                  placeholder="Prefix"
                  className="w-1/4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={prefix.uri}
                  onChange={(e) => updatePrefix(index, 'uri', e.target.value)}
                  placeholder="URI"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removePrefix(index)}
                  disabled={prefixes.length <= 1}
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
                >
                  X
                </button>
              </div>
            ))}
            <button
              onClick={addPrefix}
              disabled={prefixes.length >= 10}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              + Add Prefix {prefixes.length >= 10 && '(Max 10)'}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Properties ({properties.length})
            </label>
            {properties.map((prop, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={prop.name}
                  onChange={(e) => updateProperty(index, 'name', e.target.value)}
                  placeholder="Property Name"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={prop.type}
                  onChange={(e) => updateProperty(index, 'type', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <input
                  type="checkbox"
                  checked={prop.required}
                  onChange={(e) => updateProperty(index, 'required', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Required</span>
                <button
                  onClick={() => removeProperty(index)}
                  disabled={properties.length <= 1}
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
                >
                  X
                </button>
              </div>
            ))}
            <button
              onClick={addProperty}
              disabled={properties.length >= 20}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              + Add Property {properties.length >= 20 && '(Max 20)'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateRDF}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate RDF
          </button>

          {rdfData && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isCopied
                    ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                    : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
                }`}
              >
                {isCopied ? 'Copied!' : 'Copy RDF'}
              </button>

              <button
                onClick={downloadFile}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download as TTL
              </button>

              <button
                onClick={() => { setRdfData(''); setError('') }}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {rdfData && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated RDF Data ({count} resources):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{rdfData}</pre>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Size: {rdfData.length} characters
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RDFDataGenerator