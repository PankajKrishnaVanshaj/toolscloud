'use client'
import React, { useState } from 'react'

const CSVDataGenerator = () => {
  const [rows, setRows] = useState(10)
  const [columns, setColumns] = useState([
    { name: 'ID', type: 'number' },
    { name: 'Name', type: 'name' },
    { name: 'Email', type: 'email' }
  ])
  const [csvData, setCsvData] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  // Data generation functions
  const generateRandomData = (type) => {
    switch (type) {
      case 'number':
        return Math.floor(Math.random() * 10000)
      case 'name':
        const firstNames = ['John', 'Jane', 'Alex', 'Emma', 'Chris']
        const lastNames = ['Smith', 'Doe', 'Johnson', 'Brown', 'Wilson']
        return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
      case 'email':
        const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'example.com']
        return `${Math.random().toString(36).substring(2, 8)}@${domains[Math.floor(Math.random() * domains.length)]}`
      case 'date':
        const date = new Date(Date.now() - Math.random() * 10000000000)
        return date.toISOString().split('T')[0]
      case 'text':
        const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet']
        return Array.from({ length: 3 }, () => words[Math.floor(Math.random() * words.length)]).join(' ')
      default:
        return ''
    }
  }

  const generateCSV = () => {
    if (columns.length === 0) {
      setCsvData('Please add at least one column!')
      return
    }

    // Generate header
    const header = columns.map(col => col.name).join(',')
    
    // Generate rows
    const dataRows = Array.from({ length: Math.min(rows, 1000) }, () => {
      return columns.map(col => `"${generateRandomData(col.type)}"`).join(',')
    })

    const csv = [header, ...dataRows].join('\n')
    setCsvData(csv)
    setIsCopied(false)
  }

  const addColumn = () => {
    setColumns([...columns, { name: `Column${columns.length + 1}`, type: 'text' }])
  }

  const updateColumn = (index, field, value) => {
    const newColumns = [...columns]
    newColumns[index][field] = value
    setColumns(newColumns)
  }

  const removeColumn = (index) => {
    if (columns.length > 1) {
      setColumns(columns.filter((_, i) => i !== index))
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(csvData)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const downloadAsCSV = () => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `data-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearData = () => {
    setCsvData('')
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          CSV Data Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Rows (1-1000)
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={rows}
              onChange={(e) => setRows(Math.max(1, Math.min(1000, Number(e.target.value))))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Columns
            </label>
            {columns.map((col, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={col.name}
                  onChange={(e) => updateColumn(index, 'name', e.target.value)}
                  placeholder="Column Name"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={col.type}
                  onChange={(e) => updateColumn(index, 'type', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="number">Number</option>
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="date">Date</option>
                  <option value="text">Text</option>
                </select>
                {columns.length > 1 && (
                  <button
                    onClick={() => removeColumn(index)}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addColumn}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Column
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateCSV}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate CSV
          </button>

          {csvData && (
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
                onClick={downloadAsCSV}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download as CSV
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

        {csvData && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated CSV Data:
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                {csvData}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CSVDataGenerator