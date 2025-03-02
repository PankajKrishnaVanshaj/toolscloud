'use client'
import React, { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'

const HDF5DataGenerator = () => {
  const [hdf5Structure, setHDF5Structure] = useState('')
  const [generatedData, setGeneratedData] = useState(null)
  const [count, setCount] = useState(5)
  const [groupName, setGroupName] = useState('root_group')
  const [datasetName, setDatasetName] = useState('dataset')
  const [fields, setFields] = useState([
    { name: 'id', type: 'int32', shape: [1] },
    { name: 'value', type: 'float64', shape: [1] },
    { name: 'label', type: 'string', shape: [1] }
  ])
  const [attributes, setAttributes] = useState([
    { name: 'version', value: '1.0', type: 'string' }
  ])
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')

  const MAX_ITEMS = 1000
  const FIELD_TYPES = ['int32', 'int64', 'float32', 'float64', 'string', 'bool']

  const generateRandomData = useCallback((type) => {
    const timestamp = Date.now()
    switch (type) {
      case 'int32':
        return Math.floor(Math.random() * 1000000)
      case 'int64':
        return Math.floor(Math.random() * 1000000000)
      case 'float32':
        return Math.random() * 1000
      case 'float64':
        return Math.random() * 1000000
      case 'string':
        const prefixes = ['sample', 'record', 'entry', 'data']
        return `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${timestamp}`
      case 'bool':
        return Math.random() > 0.5
      default:
        return 0
    }
  }, [])

  const generateHDF5Structure = useCallback(() => {
    let structure = `HDF5 Structure Description:\n`
    structure += `Group: /${groupName}\n`
    structure += `Dataset: /${groupName}/${datasetName}\n`
    structure += `Shape: [${count}]\n\n`
    
    structure += `Dataset Fields:\n`
    fields.forEach(field => {
      structure += `- ${field.name}: ${field.type} ${JSON.stringify(field.shape)}\n`
    })
    
    structure += `\nAttributes:\n`
    attributes.forEach(attr => {
      structure += `- ${attr.name}: ${attr.type} = "${attr.value}"\n`
    })
    
    return structure
  }, [groupName, datasetName, count, fields, attributes])

  const generateData = useCallback(() => {
    const validationError = validateInputs()
    if (validationError) {
      setError(validationError)
      setGeneratedData(null)
      setHDF5Structure('')
      console.error('Validation failed:', validationError)
      return
    }

    setError('')
    console.log('Generating', count, 'items...')

    try {
      // Generate dataset
      const dataset = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
        return fields.reduce((obj, field) => ({
          ...obj,
          [field.name]: field.shape[0] === 1 
            ? generateRandomData(field.type)
            : Array.from({ length: field.shape[0] }, () => generateRandomData(field.type))
        }), {})
      })

      // Generate attributes object
      const attrObj = attributes.reduce((obj, attr) => ({
        ...obj,
        [attr.name]: attr.value
      }), {})

      const dataStructure = {
        [groupName]: {
          [datasetName]: dataset,
          attributes: attrObj
        }
      }

      const jsonString = JSON.stringify(dataStructure)
      const binaryBuffer = new TextEncoder().encode(jsonString)

      setGeneratedData({
        structure: dataStructure,
        binary: binaryBuffer,
        size: binaryBuffer.length
      })
      setHDF5Structure(generateHDF5Structure())
      setIsCopied(false)

      console.log('Generated items:', dataset.length, 'items')
      console.log('Binary size:', binaryBuffer.length, 'bytes')
    } catch (err) {
      setError('Generation failed: ' + err.message)
      console.error('Generation failed:', err)
    }
  }, [count, fields, groupName, datasetName, attributes, generateRandomData, generateHDF5Structure])

  const validateInputs = () => {
    if (fields.length === 0) return 'Please add at least one field'
    if (!groupName.trim()) return 'Group name cannot be empty'
    if (!datasetName.trim()) return 'Dataset name cannot be empty'
    if (fields.some(f => !f.name.trim())) return 'All field names must be filled'
    if (new Set(fields.map(f => f.name)).size !== fields.length) return 'Field names must be unique'
    if (attributes.some(a => !a.name.trim())) return 'All attribute names must be filled'
    if (new Set(attributes.map(a => a.name)).size !== attributes.length) return 'Attribute names must be unique'
    return ''
  }

  const addField = () => {
    if (fields.length < 20) {
      setFields([...fields, { name: `field${fields.length + 1}`, type: 'int32', shape: [1] }])
    }
  }

  const addAttribute = () => {
    if (attributes.length < 10) {
      setAttributes([...attributes, { name: `attr${attributes.length + 1}`, value: '', type: 'string' }])
    }
  }

  const updateField = (index, key, value) => {
    setFields(fields.map((f, i) => 
      i === index ? { ...f, [key]: key === 'shape' ? [parseInt(value) || 1] : value } : f
    ))
  }

  const updateAttribute = (index, key, value) => {
    setAttributes(attributes.map((a, i) => 
      i === index ? { ...a, [key]: value } : a
    ))
  }

  const removeField = (index) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index))
    }
  }

  const removeAttribute = (index) => {
    setAttributes(attributes.filter((_, i) => i !== index))
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy: ' + err.message)
    }
  }

  const downloadFile = (content, fileName, type) => {
    try {
      const blob = new Blob([content], { type })
      saveAs(blob, fileName)
    } catch (err) {
      setError('Download failed: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          HDF5 Data Generator
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Items (1-{MAX_ITEMS})
            </label>
            <input
              type="number"
              min="1"
              max={MAX_ITEMS}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(MAX_ITEMS, Number(e.target.value) || 1)))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value.trim() || 'root_group')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., root_group"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dataset Name
            </label>
            <input
              type="text"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value.trim() || 'dataset')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., dataset"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fields ({fields.length})
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
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={field.shape[0]}
                  onChange={(e) => updateField(index, 'shape', e.target.value)}
                  min="1"
                  className="w-20 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Shape"
                />
                <button
                  onClick={() => removeField(index)}
                  disabled={fields.length <= 1}
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
                >
                  X
                </button>
              </div>
            ))}
            <button
              onClick={addField}
              disabled={fields.length >= 20}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              + Add Field {fields.length >= 20 && '(Max 20)'}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attributes ({attributes.length})
            </label>
            {attributes.map((attr, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={attr.name}
                  onChange={(e) => updateAttribute(index, 'name', e.target.value)}
                  placeholder="Attribute Name"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={attr.value}
                  onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                  placeholder="Value"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={attr.type}
                  onChange={(e) => updateAttribute(index, 'type', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {['string', 'int32', 'float64'].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <button
                  onClick={() => removeAttribute(index)}
                  disabled={attributes.length <= 1}
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
                >
                  X
                </button>
              </div>
            ))}
            <button
              onClick={addAttribute}
              disabled={attributes.length >= 10}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              + Add Attribute {attributes.length >= 10 && '(Max 10)'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateData}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate HDF5 Data
          </button>

          {generatedData && (
            <>
              <button
                onClick={() => copyToClipboard(hdf5Structure)}
                className={`flex-1 py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isCopied
                    ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                    : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
                }`}
              >
                {isCopied ? 'Copied!' : 'Copy Structure'}
              </button>

              <button
                onClick={() => downloadFile(hdf5Structure, `${datasetName}_structure.txt`, 'text/plain')}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download Structure
              </button>

              <button
                onClick={() => downloadFile(generatedData.binary, `${datasetName}.h5sim`, 'application/octet-stream')}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Download Simulated Data
              </button>

              <button
                onClick={() => { setGeneratedData(null); setHDF5Structure(''); setError('') }}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {hdf5Structure && generatedData && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              HDF5 Structure Description:
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{hdf5Structure}</pre>
            </div>
            <div className="mt-2">
              <h3 className="text-md font-semibold text-gray-700 mb-2">
                Generated Data ({count} items):
              </h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {JSON.stringify(generatedData.structure, null, 2)}
                </pre>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Total items: {generatedData.structure[groupName][datasetName].length} | Simulated size: {generatedData.size} bytes
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HDF5DataGenerator