'use client'
import React, { useState } from 'react'

const SQLQueryGenerator = () => {
  const [queryType, setQueryType] = useState('SELECT')
  const [tableName, setTableName] = useState('users')
  const [columns, setColumns] = useState(['*'])
  const [conditions, setConditions] = useState([{ column: '', operator: '=', value: '' }])
  const [generatedQuery, setGeneratedQuery] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  const operators = ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'IN']

  const generateQuery = () => {
    let query = ''

    switch (queryType) {
      case 'SELECT':
        query = `SELECT ${columns.join(', ')} FROM ${tableName}`
        if (conditions[0].column) {
          const whereClause = conditions
            .filter(cond => cond.column && cond.value)
            .map(cond => `${cond.column} ${cond.operator} '${cond.value}'`)
            .join(' AND ')
          if (whereClause) query += ` WHERE ${whereClause}`
        }
        break
      case 'INSERT':
        query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`
        break
      case 'UPDATE':
        query = `UPDATE ${tableName} SET ${columns.map(col => `${col} = ?`).join(', ')}`
        if (conditions[0].column) {
          const whereClause = conditions
            .filter(cond => cond.column && cond.value)
            .map(cond => `${cond.column} ${cond.operator} '${cond.value}'`)
            .join(' AND ')
          if (whereClause) query += ` WHERE ${whereClause}`
        }
        break
      case 'DELETE':
        query = `DELETE FROM ${tableName}`
        if (conditions[0].column) {
          const whereClause = conditions
            .filter(cond => cond.column && cond.value)
            .map(cond => `${cond.column} ${cond.operator} '${cond.value}'`)
            .join(' AND ')
          if (whereClause) query += ` WHERE ${whereClause}`
        }
        break
      default:
        query = ''
    }

    setGeneratedQuery(`${query};`)
    setIsCopied(false)
  }

  const addColumn = () => {
    setColumns([...columns, ''])
  }

  const updateColumn = (index, value) => {
    const newColumns = [...columns]
    newColumns[index] = value
    setColumns(newColumns)
  }

  const removeColumn = (index) => {
    if (columns.length > 1 || (queryType === 'SELECT' && columns[0] !== '*')) {
      setColumns(columns.filter((_, i) => i !== index))
    }
  }

  const addCondition = () => {
    setConditions([...conditions, { column: '', operator: '=', value: '' }])
  }

  const updateCondition = (index, field, value) => {
    const newConditions = [...conditions]
    newConditions[index][field] = value
    setConditions(newConditions)
  }

  const removeCondition = (index) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((_, i) => i !== index))
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedQuery)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy:', err))
  }

  const clearQuery = () => {
    setGeneratedQuery('')
    setColumns(['*'])
    setConditions([{ column: '', operator: '=', value: '' }])
    setIsCopied(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          SQL Query Generator
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Query Type
            </label>
            <select
              value={queryType}
              onChange={(e) => {
                setQueryType(e.target.value)
                if (e.target.value !== 'SELECT') setColumns(['id'])
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SELECT">SELECT</option>
              <option value="INSERT">INSERT</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Table Name
            </label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter table name"
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
                  value={col}
                  onChange={(e) => updateColumn(index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Column name"
                  disabled={queryType === 'SELECT' && index === 0 && col === '*'}
                />
                {(columns.length > 1 || (queryType === 'SELECT' && col !== '*')) && (
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

          {(queryType === 'SELECT' || queryType === 'UPDATE' || queryType === 'DELETE') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conditions
              </label>
              {conditions.map((cond, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <input
                    type="text"
                    value={cond.column}
                    onChange={(e) => updateCondition(index, 'column', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Column"
                  />
                  <select
                    value={cond.operator}
                    onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {operators.map(op => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={cond.value}
                    onChange={(e) => updateCondition(index, 'value', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Value"
                  />
                  {conditions.length > 1 && (
                    <button
                      onClick={() => removeCondition(index)}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addCondition}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Condition
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={generateQuery}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Query
          </button>

          {generatedQuery && (
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
                onClick={clearQuery}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {generatedQuery && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated SQL Query:
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                {generatedQuery}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SQLQueryGenerator