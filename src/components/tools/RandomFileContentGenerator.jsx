'use client'
import React, { useState } from 'react'
import { saveAs } from 'file-saver'

const RandomFileContentGenerator = () => {
  const [generatedContent, setGeneratedContent] = useState('')
  const [fileType, setFileType] = useState('text')
  const [contentLength, setContentLength] = useState(100)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // [Previous content generation functions remain the same...]
  const generateTextContent = (length) => {
    const sentences = [
      'The quick brown fox jumps over the lazy dog.',
      'A journey of a thousand miles begins with a single step.',
      'To be or not to be, that is the question.',
      'All that glitters is not gold.',
    ]
    const result = []
    for (let i = 0; i < Math.ceil(length / 20); i++) {
      const randomSentence = sentences[Math.floor(Math.random() * sentences.length)]
      result.push(randomSentence)
    }
    return result.join(' ')
  }

  const generateCodeContent = (length) => {
    const templates = [
      () => `class ${randomString(8)} {${Array(Math.floor(length/50)).fill().map(() => `
  ${randomString(6)}() {
    return ${Math.random() > 0.5 ? 'true' : Math.floor(Math.random() * 1000)};
  }`).join('')}
}`,
      () => `const ${randomString(6)} = [${Array(Math.floor(length/20)).fill().map(() => Math.floor(Math.random() * 100)).join(', ')}];`,
      () => `interface ${randomString(8)} {
  ${Array(Math.floor(length/100)).fill().map(() => `${randomString(5)}: ${Math.random() > 0.5 ? 'string' : 'number'};`).join('\n  ')}
}`
    ]
    return templates[Math.floor(Math.random() * templates.length)]()
  }

  const generateJSONContent = (length) => {
    const complexity = Math.min(Math.floor(length / 100), 5)
    const generateNestedObject = (depth) => {
      if (depth <= 0) return Math.random() > 0.5 ? randomString(6) : Math.floor(Math.random() * 1000)
      const obj = {}
      for (let i = 0; i < complexity; i++) {
        obj[randomString(6)] = Math.random() > 0.5 
          ? generateNestedObject(depth - 1)
          : [randomString(6), Math.random(), new Date().toISOString()]
      }
      return obj
    }
    return JSON.stringify(generateNestedObject(2), null, 2)
  }

  const randomString = (length) => {
    return Math.random().toString(36).substring(2, length + 2)
  }

  const handleGenerate = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      let content = ''
      switch(fileType) {
        case 'text': content = generateTextContent(contentLength); break
        case 'code': content = generateCodeContent(contentLength); break
        case 'json': content = generateJSONContent(contentLength); break
        default: content = generateTextContent(contentLength)
      }
      setGeneratedContent(content)
    } catch (err) {
      setError('Failed to generate content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    const extension = { text: 'txt', code: 'ts', json: 'json' }[fileType]
    const blob = new Blob([generatedContent], { type: `text/${fileType};charset=utf-8` })
    saveAs(blob, `generated-content-${Date.now()}.${extension}`)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent)
      .then(() => alert('Content copied to clipboard!'))
      .catch(() => setError('Failed to copy content'))
  }

  const handleClear = () => {
    setGeneratedContent('')
    setError(null)
  }

  // Custom Button Component
  const Button = ({ children, onClick, disabled, variant = 'primary', className = '', icon }) => {
    const baseStyles = 'px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2'
    const variants = {
      primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      success: 'bg-green-600 text-white hover:bg-green-700',
      danger: 'bg-red-600 text-white hover:bg-red-700'
    }
    
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {icon && <span className="w-5 h-5">{icon}</span>}
        {children}
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Advanced Content Generator
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="text">Plain Text</option>
              <option value="code">TypeScript Code</option>
              <option value="json">JSON Data</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content Length</label>
            <input
              type="number"
              min="50"
              max="5000"
              value={contentLength}
              onChange={(e) => setContentLength(Math.min(5000, Math.max(50, Number(e.target.value))))}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            variant="primary"
            className="flex-1 min-w-[150px]"
            icon={isLoading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : null}
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </Button>

          {generatedContent && (
            <>
              <Button
                onClick={handleDownload}
                variant="success"
                className="flex-1 min-w-[150px]"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
              >
                Download
              </Button>

              <Button
                onClick={handleCopy}
                variant="secondary"
                className="flex-1 min-w-[150px]"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
              >
                Copy
              </Button>

              <Button
                onClick={handleClear}
                variant="danger"
                className="flex-1 min-w-[150px]"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
              >
                Clear
              </Button>
            </>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {generatedContent && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Generated Content:</h2>
            <pre className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-auto max-h-[50vh] font-mono text-sm">
              {generatedContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default RandomFileContentGenerator