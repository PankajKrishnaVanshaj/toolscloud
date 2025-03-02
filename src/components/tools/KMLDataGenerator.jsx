'use client'
import React, { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'

const KMLDataGenerator = () => {
  const [kmlData, setKMLData] = useState('')
  const [count, setCount] = useState(5)
  const [name, setName] = useState('GeneratedPoints')
  const [fields, setFields] = useState([
    { name: 'description', type: 'string', required: false },
    { name: 'category', type: 'string', required: false }
  ])
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')

  const MAX_ITEMS = 1000
  const FIELD_TYPES = ['string', 'number', 'boolean']

  // Generate random geographic data
  const generateRandomData = useCallback((type, required) => {
    let value
    switch (type) {
      case 'string':
        const prefixes = ['Point', 'Location', 'Marker', 'Place']
        value = `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
        break
      case 'number':
        value = Math.floor(Math.random() * 1000)
        break
      case 'boolean':
        value = Math.random() > 0.5
        break
      default:
        value = ''
    }
    return required && !value ? generateRandomData(type, required) : value
  }, [])

  // Generate random coordinates
  const generateRandomCoordinates = () => {
    const latitude = (Math.random() * 180 - 90).toFixed(6)  // -90 to 90 degrees
    const longitude = (Math.random() * 360 - 180).toFixed(6) // -180 to 180 degrees
    const altitude = Math.floor(Math.random() * 1000)        // 0 to 1000 meters
    return { latitude, longitude, altitude }
  }

  // Generate KML content
  const generateKML = useCallback(() => {
    const validationError = validateFields()
    if (validationError) {
      setError(validationError)
      setKMLData('')
      console.error('Validation failed:', validationError)
      return
    }

    setError('')
    console.log('Generating', count, 'KML points...')

    try {
      let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${name}</name>
    <description>Generated KML Points</description>
`

      const points = Array.from({ length: Math.min(count, MAX_ITEMS) }, (_, index) => {
        const coords = generateRandomCoordinates()
        const properties = fields.reduce((obj, field) => ({
          ...obj,
          [field.name]: generateRandomData(field.type, field.required)
        }), {})

        return { index, coords, properties }
      })

      points.forEach(point => {
        kmlContent += `    <Placemark>
      <name>Point ${point.index + 1}</name>
      <ExtendedData>
`
        Object.entries(point.properties).forEach(([key, value]) => {
          kmlContent += `        <Data name="${key}">
          <value>${value}</value>
        </Data>
`
        })

        kmlContent += `      </ExtendedData>
      <Point>
        <coordinates>${point.coords.longitude},${point.coords.latitude},${point.coords.altitude}</coordinates>
      </Point>
    </Placemark>
`
      })

      kmlContent += `  </Document>
</kml>`

      setKMLData(kmlContent)
      setIsCopied(false)
      console.log('Generated', points.length, 'points')
    } catch (err) {
      setError('Generation failed: ' + err.message)
      console.error('Generation failed:', err)
    }
  }, [count, name, fields, generateRandomData])

  const validateFields = () => {
    if (!name.trim()) return 'Name cannot be empty'
    if (fields.some(field => !field.name.trim())) return 'All field names must be filled'
    if (new Set(fields.map(f => f.name)).size !== fields.length) return 'Field names must be unique'
    return ''
  }

  const addField = () => {
    if (fields.length < 10) {
      setFields([...fields, { 
        name: `field${fields.length + 1}`, 
        type: 'string', 
        required: false 
      }])
    }
  }

  const updateField = (index, key, value) => {
    setFields(fields.map((field, i) => 
      i === index ? { ...field, [key]: value } : field
    ))
  }

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(kmlData)
      setIsCopied(true)
      console.log('KML copied to clipboard')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy: ' + err.message)
      console.error('Copy failed:', err.message)
    }
  }

  const downloadFile = () => {
    try {
      const blob = new Blob([kmlData], { type: 'application/vnd.google-earth.kml+xml' })
      saveAs(blob, `${name.toLowerCase()}.kml`)
      console.log(`Downloaded ${name.toLowerCase()}.kml`)
    } catch (err) {
      setError('Download failed: ' + err.message)
      console.error('Download failed:', err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          KML Data Generator
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Points (1-{MAX_ITEMS})
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
              Document Name
 Hawkins
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.trim() || 'GeneratedPoints')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., GeneratedPoints"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Fields ({fields.length})
            </label>
            {fields.map((field, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => updateField(index, 'name', e.target.value)}
                  placeholder="Field Name"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={field.type}
                  onChange={(e) => updateField(index, 'type', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {FIELD_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(index, 'required', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Required</span>
                <button
                  onClick={() => removeField(index)}
                  disabled={fields.length <= 0}
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
              + Add Field {fields.length >= 10 && '(Max 10)'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateKML}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate KML
          </button>

          {kmlData && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isCopied
                    ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                    : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
                }`}
              >
                {isCopied ? 'Copied!' : 'Copy KML'}
              </button>

              <button
                onClick={downloadFile}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download KML
              </button>

              <button
                onClick={() => { setKMLData(''); setError('') }}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {kmlData && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated KML ({count} points):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{kmlData}</pre>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              File size: {(kmlData.length / 1024).toFixed(2)} KB
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default KMLDataGenerator