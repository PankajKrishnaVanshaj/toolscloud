'use client'
import React, { useState, useCallback } from 'react'

const INIDataGenerator = () => {
  const [iniData, setIniData] = useState('')
  const [count, setCount] = useState(5)
  const [sections, setSections] = useState([
    {
      name: 'Settings',
      keys: [
        { name: 'id', type: 'number' },
        { name: 'username', type: 'text' },
        { name: 'active', type: 'boolean' }
      ]
    }
  ])
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')

  const MAX_ITEMS = 100
  const FIELD_TYPES = ['number', 'text', 'boolean', 'date', 'enum']
  const ENUM_OPTIONS = ['low', 'medium', 'high']

  // Random data generation
  const generateRandomData = useCallback((type) => {
    const timestamp = Date.now()
    switch (type) {
      case 'number':
        return Math.floor(Math.random() * 10000) + 1
      case 'text':
        const prefixes = ['user', 'client', 'admin', 'test', 'dev']
        return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${Math.random().toString(36).substring(2, 8)}`
      case 'boolean':
        return Math.random() > 0.5 ? 'true' : 'false'
      case 'date':
        const date = new Date(timestamp - Math.random() * 31536000000)
        return date.toISOString().split('T')[0]
      case 'enum':
        return ENUM_OPTIONS[Math.floor(Math.random() * ENUM_OPTIONS.length)]
      default:
        return ''
    }
  }, [])

  // Validation
  const validateConfig = useCallback(() => {
    if (sections.length === 0) return 'Please add at least one section'
    if (sections.some(section => !section.name.trim())) return 'All section names must be filled'
    if (sections.some(section => section.keys.length === 0)) return 'Each section must have at least one key'
    if (sections.some(section => section.keys.some(key => !key.name.trim()))) return 'All key names must be filled'
    const allKeys = sections.flatMap(s => s.keys.map(k => `${s.name}.${k.name}`))
    if (new Set(allKeys).size !== allKeys.length) return 'Key names must be unique within and across sections'
    return ''
  }, [sections])

  // INI generation
  const generateINI = useCallback(() => {
    const validationError = validateConfig()
    if (validationError) {
      setError(validationError)
      setIniData('')
      return
    }

    setError('')
    try {
      let result = ''
      const itemCount = Math.min(count, MAX_ITEMS)

      for (let i = 0; i < itemCount; i++) {
        sections.forEach((section, sectionIdx) => {
          result += `[${section.name}${itemCount > 1 ? i + 1 : ''}]\n`
          section.keys.forEach(key => {
            result += `${key.name}=${generateRandomData(key.type)}\n`
          })
          if (sectionIdx < sections.length - 1) result += '\n'
        })
        if (i < itemCount - 1) result += '\n'
      }

      setIniData(result.trim())
      setIsCopied(false)
    } catch (e) {
      setError('Error generating INI: ' + e.message)
    }
  }, [count, sections, generateRandomData, validateConfig])

  // Section and key management
  const addSection = () => {
    setSections([...sections, { name: `Section${sections.length + 1}`, keys: [{ name: 'key1', type: 'text' }] }])
  }

  const updateSectionName = (index, name) => {
    setSections(sections.map((s, i) => i === index ? { ...s, name } : s))
  }

  const removeSection = (index) => {
    if (sections.length > 1) {
      setSections(sections.filter((_, i) => i !== index))
    }
  }

  const addKey = (sectionIndex) => {
    setSections(sections.map((section, i) => {
      if (i !== sectionIndex) return section
      return {
        ...section,
        keys: [...section.keys, { name: `key${section.keys.length + 1}`, type: 'text' }]
      }
    }))
  }

  const updateKey = (sectionIndex, keyIndex, field, value) => {
    setSections(sections.map((section, i) => {
      if (i !== sectionIndex) return section
      return {
        ...section,
        keys: section.keys.map((key, k) => 
          k === keyIndex ? { ...key, [field]: value } : key
        )
      }
    }))
  }

  const removeKey = (sectionIndex, keyIndex) => {
    setSections(sections.map((section, i) => {
      if (i !== sectionIndex || section.keys.length <= 1) return section
      return {
        ...section,
        keys: section.keys.filter((_, k) => k !== keyIndex)
      }
    }))
  }

  // Utility functions
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(iniData)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy to clipboard: ' + err.message)
    }
  }

  const downloadAsINI = () => {
    try {
      const blob = new Blob([iniData], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `config-${Date.now()}.ini`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to download: ' + err.message)
    }
  }

  const clearData = () => {
    setIniData('')
    setIsCopied(false)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          INI Data Generator
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
              Sections ({sections.length})
            </label>
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-4 p-4 border border-gray-200 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={section.name}
                    onChange={(e) => updateSectionName(sectionIndex, e.target.value)}
                    placeholder="Section Name"
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeSection(sectionIndex)}
                    disabled={sections.length <= 1}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
                  >
                    X
                  </button>
                </div>
                {section.keys.map((key, keyIndex) => (
                  <div key={keyIndex} className="flex gap-2 mb-2 items-center">
                    <input
                      type="text"
                      value={key.name}
                      onChange={(e) => updateKey(sectionIndex, keyIndex, 'name', e.target.value)}
                      placeholder="Key Name"
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={key.type}
                      onChange={(e) => updateKey(sectionIndex, keyIndex, 'type', e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {FIELD_TYPES.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeKey(sectionIndex, keyIndex)}
                      disabled={section.keys.length <= 1}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
                    >
                      X
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addKey(sectionIndex)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  disabled={section.keys.length >= 10}
                >
                  + Add Key {section.keys.length >= 10 && '(Max 10)'}
                </button>
              </div>
            ))}
            <button
              onClick={addSection}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              disabled={sections.length >= 5}
            >
              + Add Section {sections.length >= 5 && '(Max 5)'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateINI}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate INI
          </button>

          {iniData && (
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
                onClick={downloadAsINI}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download as INI
              </button>

              <button
                onClick={clearData}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {iniData && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated INI Data ({count} items):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{iniData}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default INIDataGenerator