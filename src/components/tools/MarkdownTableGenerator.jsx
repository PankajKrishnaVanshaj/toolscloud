'use client'
import React, { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'

const MarkdownTableGenerator = () => {
  const [columns, setColumns] = useState([
    { name: 'ID', align: 'left' },
    { name: 'Name', align: 'left' },
    { name: 'Value', align: 'right' }
  ])
  const [rows, setRows] = useState([
    ['1', 'John', '100'],
    ['2', 'Jane', '200']
  ])
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')

  const MAX_ROWS = 1000
  const MAX_COLS = 20
  const ALIGN_OPTIONS = ['left', 'center', 'right']

  // Generate Markdown table
  const generateMarkdown = useCallback(() => {
    if (columns.length === 0) return ''
    
    let markdown = '| ' + columns.map(col => col.name).join(' | ') + ' |\n'
    markdown += '| ' + columns.map(col => 
      col.align === 'center' ? ':-:' : 
      col.align === 'right' ? '-:' : ':-'
    ).join(' | ') + ' |\n'
    
    rows.forEach(row => {
      markdown += '| ' + row.map(cell => cell || '').join(' | ') + ' |\n'
    })
    
    return markdown.trim()
  }, [columns, rows])

  // Add new column
  const addColumn = () => {
    if (columns.length < MAX_COLS) {
      setColumns([...columns, { name: `Column${columns.length + 1}`, align: 'left' }])
      setRows(rows.map(row => [...row, '']))
    }
  }

  // Update column properties
  const updateColumn = (index, key, value) => {
    const newColumns = [...columns]
    newColumns[index][key] = value
    setColumns(newColumns)
  }

  // Remove column
  const removeColumn = (index) => {
    if (columns.length > 1) {
      setColumns(columns.filter((_, i) => i !== index))
      setRows(rows.map(row => row.filter((_, i) => i !== index)))
    }
  }

  // Add new row
  const addRow = () => {
    if (rows.length < MAX_ROWS) {
      setRows([...rows, Array(columns.length).fill('')])
    }
  }

  // Update cell value
  const updateCell = (rowIdx, colIdx, value) => {
    const newRows = [...rows]
    newRows[rowIdx][colIdx] = value
    setRows(newRows)
  }

  // Remove row
  const removeRow = (index) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index))
    }
  }

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      const markdown = generateMarkdown()
      if (!markdown) {
        setError('Nothing to copy - table is empty')
        return
      }
      await navigator.clipboard.writeText(markdown)
      setIsCopied(true)
      setError('')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy: ' + err.message)
    }
  }

  // Download as Markdown file
  const downloadMarkdown = () => {
    const markdown = generateMarkdown()
    if (!markdown) {
      setError('Nothing to download - table is empty')
      return
    }
    try {
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
      saveAs(blob, `table-${Date.now()}.md`)
      setError('')
    } catch (err) {
      setError('Download failed: ' + err.message)
    }
  }

  // Clear table
  const clearTable = () => {
    setColumns([{ name: 'Column1', align: 'left' }])
    setRows([['']])
    setError('')
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Markdown Table Generator
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-6 mb-6">
          {/* Column Headers */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Columns ({columns.length})
              </label>
              <button
                onClick={addColumn}
                disabled={columns.length >= MAX_COLS}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              >
                + Add Column {columns.length >= MAX_COLS && '(Max 20)'}
              </button>
            </div>
            <div className="space-y-2">
              {columns.map((col, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={col.name}
                    onChange={(e) => updateColumn(index, 'name', e.target.value)}
                    placeholder="Column Name"
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={col.align}
                    onChange={(e) => updateColumn(index, 'align', e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ALIGN_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeColumn(index)}
                    disabled={columns.length <= 1}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Table Data */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Rows ({rows.length})
              </label>
              <button
                onClick={addRow}
                disabled={rows.length >= MAX_ROWS}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              >
                + Add Row {rows.length >= MAX_ROWS && '(Max 1000)'}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {columns.map((col, idx) => (
                      <th 
                        key={idx}
                        className={`p-2 border border-gray-300 bg-gray-50 text-${col.align}`}
                      >
                        {col.name}
                      </th>
                    ))}
                    <th className="p-2 border border-gray-300 bg-gray-50 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((cell, colIdx) => (
                        <td key={colIdx} className="p-1 border border-gray-300">
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                            className={`w-full p-1 border-none focus:outline-none focus:ring-1 focus:ring-blue-500 text-${columns[colIdx].align}`}
                          />
                        </td>
                      ))}
                      <td className="p-1 border border-gray-300">
                        <button
                          onClick={() => removeRow(rowIdx)}
                          disabled={rows.length <= 1}
                          className="w-full p-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
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
            onClick={downloadMarkdown}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Download as Markdown
          </button>

          <button
            onClick={clearTable}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Clear Table
          </button>
        </div>

        {/* Preview */}
        {columns.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Markdown Preview:
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                {generateMarkdown()}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MarkdownTableGenerator