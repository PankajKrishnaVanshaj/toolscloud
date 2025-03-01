'use client'
import React, { useState } from 'react'

const BinaryCodeGenerator = () => {
  const [inputText, setInputText] = useState('')
  const [binaryOutput, setBinaryOutput] = useState('')
  const [mode, setMode] = useState('textToBinary') // textToBinary or binaryToText
  const [separator, setSeparator] = useState('space') // space, none, dash
  const [isCopied, setIsCopied] = useState(false)

  const textToBinary = (text) => {
    return text.split('').map(char => {
      const binary = char.charCodeAt(0).toString(2).padStart(8, '0')
      return binary
    }).join(separator === 'space' ? ' ' : separator === 'dash' ? '-' : '')
  }

  const binaryToText = (binary) => {
    const binaryArray = binary.split(/[\s-]/).filter(Boolean)
    return binaryArray.map(bin => {
      const decimal = parseInt(bin, 2)
      return isNaN(decimal) ? '?' : String.fromCharCode(decimal)
    }).join('')
  }

  const generateOutput = () => {
    if (!inputText.trim()) {
      setBinaryOutput('Please enter some text!')
      return
    }

    if (mode === 'textToBinary') {
      setBinaryOutput(textToBinary(inputText))
    } else {
      setBinaryOutput(binaryToText(inputText))
    }
    setIsCopied(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(binaryOutput)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsText = () => {
    const blob = new Blob([binaryOutput], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `binary-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setInputText('')
    setBinaryOutput('')
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Binary Code Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="textToBinary">Text to Binary</option>
              <option value="binaryToText">Binary to Text</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {mode === 'textToBinary' ? 'Input Text' : 'Binary Input'}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-24 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={mode === 'textToBinary' 
                ? 'Enter text to convert to binary' 
                : 'Enter binary code (8-bit groups, separated by space or dash)'}
            />
          </div>

          {mode === 'textToBinary' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Separator
              </label>
              <select
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="space">Space</option>
                <option value="dash">Dash</option>
                <option value="none">None</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateOutput}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate {mode === 'textToBinary' ? 'Binary' : 'Text'}
          </button>

          {binaryOutput && (
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
                onClick={downloadAsText}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download as TXT
              </button>

              <button
                onClick={clearAll}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {binaryOutput && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              {mode === 'textToBinary' ? 'Binary Output:' : 'Text Output:'}
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 break-all">
                {binaryOutput}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BinaryCodeGenerator