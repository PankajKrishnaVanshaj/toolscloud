// app/components/PDFBookmarkManager.jsx
'use client'
import React, { useState, useEffect } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

const PDFBookmarkManager = () => {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [bookmarks, setBookmarks] = useState([])
  const [newBookmark, setNewBookmark] = useState({
    title: '',
    page: 1,
    parentId: null
  })
  const [editingBookmark, setEditingBookmark] = useState(null)

  // Handle file upload
  const onFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setBookmarks([])
      setCurrentPage(1)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  // Bookmark management
  const addBookmark = (e) => {
    e.preventDefault()
    if (!newBookmark.title) return

    const bookmark = {
      id: Date.now(),
      title: newBookmark.title,
      page: Math.min(Math.max(1, newBookmark.page), numPages || 1),
      parentId: newBookmark.parentId,
      children: []
    }

    if (bookmark.parentId) {
      setBookmarks(prev => updateNestedBookmark(prev, bookmark.parentId, bookmark))
    } else {
      setBookmarks(prev => [...prev, bookmark])
    }

    setNewBookmark({ title: '', page: currentPage, parentId: null })
  }

  const updateNestedBookmark = (bookmarks, parentId, newBookmark) => {
    return bookmarks.map(bm => {
      if (bm.id === parentId) {
        return { ...bm, children: [...bm.children, newBookmark] }
      }
      if (bm.children.length > 0) {
        return { ...bm, children: updateNestedBookmark(bm.children, parentId, newBookmark) }
      }
      return bm
    })
  }

  const deleteBookmark = (id) => {
    setBookmarks(prev => prev.filter(bm => bm.id !== id).map(bm => ({
      ...bm,
      children: bm.children ? bm.children.filter(child => child.id !== id) : []
    })))
  }

  const startEditing = (bookmark) => {
    setEditingBookmark({ ...bookmark })
  }

  const saveEdit = () => {
    setBookmarks(prev => prev.map(bm => 
      bm.id === editingBookmark.id 
        ? { ...editingBookmark, children: bm.children }
        : { ...bm, children: updateNestedChildren(bm.children) }
    ))
    setEditingBookmark(null)
  }

  const updateNestedChildren = (children) => {
    return children.map(child => 
      child.id === editingBookmark.id 
        ? { ...editingBookmark, children: child.children }
        : { ...child, children: updateNestedChildren(child.children) }
    )
  }

  const renderBookmarks = (bookmarks, level = 0) => {
    return (
      <ul className={`ml-${level * 4}`}>
        {bookmarks.map(bm => (
          <li key={bm.id} className="my-2">
            {editingBookmark?.id === bm.id ? (
              <div className="flex items-center space-x-2">
                <input
                  value={editingBookmark.title}
                  onChange={(e) => setEditingBookmark(prev => ({ ...prev, title: e.target.value }))}
                  className="p-1 border rounded"
                />
                <input
                  type="number"
                  value={editingBookmark.page}
                  onChange={(e) => setEditingBookmark(prev => ({ ...prev, page: parseInt(e.target.value) }))}
                  min="1"
                  max={numPages}
                  className="w-16 p-1 border rounded"
                />
                <button onClick={saveEdit} className="p-1 text-green-600">Save</button>
                <button onClick={() => setEditingBookmark(null)} className="p-1 text-red-600">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setCurrentPage(bm.page)}
                  className="text-blue-600 hover:underline"
                >
                  {bm.title} (Page {bm.page})
                </button>
                <button onClick={() => startEditing(bm)} className="text-sm text-gray-600">Edit</button>
                <button onClick={() => deleteBookmark(bm.id)} className="text-sm text-red-600">Delete</button>
              </div>
            )}
            {bm.children.length > 0 && renderBookmarks(bm.children, level + 1)}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
        {/* Left Panel - Bookmarks */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">PDF Bookmark Manager</h1>

          {/* File Upload */}
          <div className="mb-6">
            <input
              type="file"
              accept=".pdf"
              onChange={onFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Add Bookmark Form */}
          {file && (
            <>
              <form onSubmit={addBookmark} className="mb-6 space-y-4">
                <div>
                  <input
                    type="text"
                    value={newBookmark.title}
                    onChange={(e) => setNewBookmark(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Bookmark Title"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="flex space-x-4">
                  <input
                    type="number"
                    value={newBookmark.page}
                    onChange={(e) => setNewBookmark(prev => ({ ...prev, page: parseInt(e.target.value) }))}
                    min="1"
                    max={numPages}
                    className="w-24 p-2 border rounded-md"
                  />
                  <select
                    value={newBookmark.parentId || ''}
                    onChange={(e) => setNewBookmark(prev => ({ ...prev, parentId: e.target.value || null }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Top Level</option>
                    {bookmarks.map(bm => (
                      <option key={bm.id} value={bm.id}>{bm.title}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Bookmark
                </button>
              </form>

              {/* Bookmark List */}
              <div className="max-h-[400px] overflow-y-auto">
                {bookmarks.length > 0 ? (
                  renderBookmarks(bookmarks)
                ) : (
                  <p className="text-gray-500">No bookmarks yet</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Panel - PDF Preview */}
        {file && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              className="flex justify-center"
            >
              <Page pageNumber={currentPage} width={500} />
            </Document>
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="py-2">
                Page {currentPage} of {numPages || '...'}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(numPages || prev, prev + 1))}
                disabled={currentPage === numPages}
                className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PDFBookmarkManager