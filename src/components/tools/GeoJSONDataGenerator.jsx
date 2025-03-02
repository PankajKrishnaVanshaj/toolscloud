'use client'
import React, { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'

const GeoJSONDataGenerator = () => {
  const [geojsonData, setGeoJsonData] = useState('')
  const [count, setCount] = useState(5)
  const [geometryType, setGeometryType] = useState('Point')
  const [properties, setProperties] = useState([
    { name: 'id', type: 'number' },
    { name: 'name', type: 'string' }
  ])
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')

  const MAX_ITEMS = 1000
  const GEOMETRY_TYPES = ['Point', 'LineString', 'Polygon']
  const PROPERTY_TYPES = ['number', 'string', 'boolean']

  // Generate random coordinates
  const generateCoordinates = useCallback((type) => {
    const lat = () => (Math.random() * 180 - 90).toFixed(6)  // -90 to 90
    const lon = () => (Math.random() * 360 - 180).toFixed(6) // -180 to 180

    switch (type) {
      case 'Point':
        return [parseFloat(lon()), parseFloat(lat())]
      case 'LineString':
        return Array.from({ length: 3 }, () => [parseFloat(lon()), parseFloat(lat())])
      case 'Polygon':
        const center = [parseFloat(lon()), parseFloat(lat())]
        const radius = Math.random() * 0.1 // Small radius in degrees
        const points = Array.from({ length: 5 }, (_, i) => {
          const angle = (i / 5) * 2 * Math.PI
          return [
            parseFloat((center[0] + radius * Math.cos(angle)).toFixed(6)),
            parseFloat((center[1] + radius * Math.sin(angle)).toFixed(6))
          ]
        })
        return [points.concat([points[0]])] // Closed polygon
      default:
        return [0, 0]
    }
  }, [])

  // Generate random property values
  const generatePropertyValue = useCallback((type) => {
    const timestamp = Date.now()
    switch (type) {
      case 'number':
        return Math.floor(Math.random() * 10000)
      case 'string':
        const prefixes = ['place', 'location', 'site', 'area']
        return `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${timestamp}_${Math.random().toString(36).substring(2, 8)}`
      case 'boolean':
        return Math.random() > 0.5
      default:
        return null
    }
  }, [])

  const generateGeoJSON = useCallback(() => {
    const validationError = validateFields()
    if (validationError) {
      setError(validationError)
      setGeoJsonData('')
      console.error('Validation failed:', validationError)
      return
    }

    setError('')
    console.log('Generating', count, 'GeoJSON features...')

    try {
      const features = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
        const feature = {
          type: 'Feature',
          geometry: {
            type: geometryType,
            coordinates: generateCoordinates(geometryType)
          },
          properties: properties.reduce((obj, prop) => ({
            ...obj,
            [prop.name]: generatePropertyValue(prop.type)
          }), {})
        }
        return feature
      })

      const geojson = {
        type: 'FeatureCollection',
        features: features
      }

      const jsonString = JSON.stringify(geojson, null, 2)
      setGeoJsonData(jsonString)
      setIsCopied(false)
      
      console.log('Generated features:', features.length, 'items')
    } catch (err) {
      setError('Generation failed: ' + err.message)
      console.error('Generation failed:', err)
    }
  }, [count, geometryType, properties, generateCoordinates, generatePropertyValue])

  const validateFields = () => {
    if (properties.length === 0) return 'Please add at least one property'
    if (properties.some(prop => !prop.name.trim())) return 'All property names must be filled'
    if (new Set(properties.map(p => p.name)).size !== properties.length) return 'Property names must be unique'
    return ''
  }

  const addProperty = () => {
    if (properties.length < 20) {
      setProperties([...properties, { 
        name: `prop${properties.length + 1}`, 
        type: 'number' 
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(geojsonData)
      setIsCopied(true)
      console.log('GeoJSON copied to clipboard')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy: ' + err.message)
      console.error('Copy failed:', err.message)
    }
  }

  const downloadGeoJSON = () => {
    try {
      const blob = new Blob([geojsonData], { type: 'application/json;charset=utf-8' })
      saveAs(blob, `geojson-${Date.now()}.geojson`)
      console.log('GeoJSON downloaded')
    } catch (err) {
      setError('Download failed: ' + err.message)
      console.error('Download failed:', err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          GeoJSON Data Generator
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Features (1-{MAX_ITEMS})
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
              Geometry Type
            </label>
            <select
              value={geometryType}
              onChange={(e) => setGeometryType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {GEOMETRY_TYPES.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
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
            onClick={generateGeoJSON}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate GeoJSON
          </button>

          {geojsonData && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isCopied
                    ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                    : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
                }`}
              >
                {isCopied ? 'Copied!' : 'Copy GeoJSON'}
              </button>

              <button
                onClick={downloadGeoJSON}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download GeoJSON
              </button>

              <button
                onClick={() => { setGeoJsonData(''); setError('') }}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {geojsonData && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated GeoJSON ({count} features):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                {geojsonData}
              </pre>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Size: {(new TextEncoder().encode(geojsonData).length / 1024).toFixed(2)} KB
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GeoJSONDataGenerator