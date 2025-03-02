'use client'
import React, { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'

const LDIFDataGenerator = () => {
  const [ldifData, setLdifData] = useState('')
  const [count, setCount] = useState(5)
  const [baseDN, setBaseDN] = useState('dc=example,dc=com')
  const [objectClasses, setObjectClasses] = useState(['inetOrgPerson', 'person', 'organizationalPerson'])
  const [attributes, setAttributes] = useState([
    { name: 'uid', type: 'string', required: true },
    { name: 'cn', type: 'string', required: true },
    { name: 'sn', type: 'string', required: true },
    { name: 'mail', type: 'email', required: false }
  ])
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')

  const MAX_ITEMS = 1000
  const ATTRIBUTE_TYPES = ['string', 'email', 'number', 'boolean']

  const generateRandomData = useCallback((type, required) => {
    const timestamp = Date.now()
    let value
    switch (type) {
      case 'string':
        const prefixes = ['user', 'person', 'emp', 'id']
        value = `${prefixes[Math.floor(Math.random() * prefixes.length)]}${timestamp}${Math.random().toString(36).substring(2, 8)}`
        break
      case 'email':
        const domains = ['example.com', 'test.org', 'company.net']
        value = `user${timestamp}${Math.random().toString(36).substring(2, 6)}@${domains[Math.floor(Math.random() * domains.length)]}`
        break
      case 'number':
        value = Math.floor(Math.random() * 10000)
        break
      case 'boolean':
        value = Math.random() > 0.5 ? 'TRUE' : 'FALSE'
        break
      default:
        value = ''
    }
    return required && !value ? generateRandomData(type, required) : value
  }, [])

  const generateLDIF = useCallback(() => {
    const validationError = validateFields()
    if (validationError) {
      setError(validationError)
      setLdifData('')
      console.error('Validation failed:', validationError)
      return
    }

    setError('')
    console.log('Generating', count, 'LDIF entries...')

    try {
      let ldifContent = '# LDIF Data Generated on ' + new Date().toISOString() + '\n'
      ldifContent += 'version: 1\n\n'

      const entries = Array.from({ length: Math.min(count, MAX_ITEMS) }, (_, index) => {
        const uid = generateRandomData('string', true)
        let entry = `dn: uid=${uid},${baseDN}\n`
        
        objectClasses.forEach(objClass => {
          entry += `objectClass: ${objClass}\n`
        })

        attributes.forEach(attr => {
          const value = generateRandomData(attr.type, attr.required)
          if (value || attr.required) {
            entry += `${attr.name}: ${value}\n`
          }
        })

        entry += '\n'
        return entry
      })

      ldifContent += entries.join('')
      setLdifData(ldifContent)
      setIsCopied(false)
      
      console.log('Generated', entries.length, 'entries')
    } catch (err) {
      setError('Generation failed: ' + err.message)
      console.error('Generation failed:', err)
    }
  }, [count, baseDN, objectClasses, attributes, generateRandomData])

  const validateFields = () => {
    if (attributes.length === 0) return 'Please add at least one attribute'
    if (!baseDN.trim()) return 'Base DN cannot be empty'
    if (objectClasses.length === 0) return 'Please add at least one object class'
    if (attributes.some(attr => !attr.name.trim())) return 'All attribute names must be filled'
    if (new Set(attributes.map(a => a.name)).size !== attributes.length) return 'Attribute names must be unique'
    return ''
  }

  const addAttribute = () => {
    if (attributes.length < 20) {
      setAttributes([...attributes, { 
        name: `attr${attributes.length + 1}`, 
        type: 'string', 
        required: false 
      }])
    }
  }

  const updateAttribute = (index, key, value) => {
    setAttributes(attributes.map((attr, i) => 
      i === index ? { ...attr, [key]: value } : attr
    ))
  }

  const removeAttribute = (index) => {
    if (attributes.length > 1) {
      setAttributes(attributes.filter((_, i) => i !== index))
    }
  }

  const addObjectClass = () => {
    const newClass = prompt('Enter new object class:')?.trim()
    if (newClass && !objectClasses.includes(newClass)) {
      setObjectClasses([...objectClasses, newClass])
    }
  }

  const removeObjectClass = (index) => {
    if (objectClasses.length > 1) {
      setObjectClasses(objectClasses.filter((_, i) => i !== index))
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(ldifData)
      setIsCopied(true)
      console.log('LDIF copied to clipboard')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy: ' + err.message)
      console.error('Copy failed:', err)
    }
  }

  const downloadFile = () => {
    try {
      const blob = new Blob([ldifData], { type: 'text/plain;charset=utf-8' })
      saveAs(blob, `data-${Date.now()}.ldif`)
      console.log('Downloaded LDIF file')
    } catch (err) {
      setError('Download failed: ' + err.message)
      console.error('Download failed:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          LDIF Data Generator
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Entries (1-{MAX_ITEMS})
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
              Base DN
            </label>
            <input
              type="text"
              value={baseDN}
              onChange={(e) => setBaseDN(e.target.value.trim() || 'dc=example,dc=com')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., dc=example,dc=com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Object Classes ({objectClasses.length})
            </label>
            {objectClasses.map((objClass, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={objClass}
                  onChange={(e) => {
                    const newClasses = [...objectClasses]
                    newClasses[index] = e.target.value.trim()
                    setObjectClasses(newClasses)
                  }}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeObjectClass(index)}
                  disabled={objectClasses.length <= 1}
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
                >
                  X
                </button>
              </div>
            ))}
            <button
              onClick={addObjectClass}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Object Class
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
                <select
                  value={attr.type}
                  onChange={(e) => updateAttribute(index, 'type', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ATTRIBUTE_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <input
                  type="checkbox"
                  checked={attr.required}
                  onChange={(e) => updateAttribute(index, 'required', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Required</span>
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
              disabled={attributes.length >= 20}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              + Add Attribute {attributes.length >= 20 && '(Max 20)'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateLDIF}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate LDIF
          </button>

          {ldifData && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isCopied
                    ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                    : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
                }`}
              >
                {isCopied ? 'Copied!' : 'Copy LDIF'}
              </button>

              <button
                onClick={downloadFile}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download LDIF
              </button>

              <button
                onClick={() => { setLdifData(''); setError('') }}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {ldifData && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated LDIF Data ({count} entries):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{ldifData}</pre>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Size: {ldifData.length} bytes
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LDIFDataGenerator