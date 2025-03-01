'use client'
import React, { useState } from 'react'

const HTMLTagGenerator = () => {
  const [tagName, setTagName] = useState('div')
  const [attributes, setAttributes] = useState([{ name: '', value: '' }])
  const [content, setContent] = useState('')
  const [generatedTag, setGeneratedTag] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  const commonTags = ['div', 'span', 'p', 'a', 'button', 'input', 'img', 'h1', 'h2', 'h3', 'ul', 'li']

  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...attributes]
    newAttributes[index][field] = value
    setAttributes(newAttributes)
  }

  const addAttribute = () => {
    setAttributes([...attributes, { name: '', value: '' }])
  }

  const removeAttribute = (index) => {
    if (attributes.length > 1) {
      setAttributes(attributes.filter((_, i) => i !== index))
    }
  }

  const generateTag = () => {
    let tag = `<${tagName}`
    
    // Add attributes
    const validAttributes = attributes.filter(attr => attr.name.trim() && attr.value.trim())
    if (validAttributes.length > 0) {
      const attrString = validAttributes
        .map(attr => `${attr.name}="${attr.value}"`)
        .join(' ')
      tag += ` ${attrString}`
    }

    // Handle self-closing tags and content
    const selfClosingTags = ['input', 'img', 'br', 'hr']
    if (selfClosingTags.includes(tagName)) {
      tag += ' />'
    } else {
      tag += `>${content}</${tagName}>`
    }

    setGeneratedTag(tag)
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedTag)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const resetForm = () => {
    setTagName('div')
    setAttributes([{ name: '', value: '' }])
    setContent('')
    setGeneratedTag('')
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          HTML Tag Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag Name
            </label>
            <select
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {commonTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attributes
            </label>
            {attributes.map((attr, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={attr.name}
                  onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                  placeholder="Name (e.g., id)"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={attr.value}
                  onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                  placeholder="Value (e.g., main-div)"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {attributes.length > 1 && (
                  <button
                    onClick={() => removeAttribute(index)}
                    className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addAttribute}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Attribute
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content (for non-self-closing tags)
            </label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={['input', 'img', 'br', 'hr'].includes(tagName)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateTag}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Tag
          </button>

          {generatedTag && (
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
                onClick={resetForm}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Reset
              </button>
            </>
          )}
        </div>

        {generatedTag && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated HTML Tag:
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <pre className="text-sm font-mono text-gray-800">{generatedTag}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HTMLTagGenerator