// app/components/PDFBookmarkManager.jsx
"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { FaDownload, FaSync, FaTrash, FaPlus } from "react-icons/fa";

const PDFBookmarkManager = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarks, setBookmarks] = useState([]);
  const [newBookmark, setNewBookmark] = useState({ title: "", page: 1, parentId: null });
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef(null);

  // Handle file upload
  const onFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setBookmarks([]);
      setCurrentPage(1);
      setSearchQuery("");
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Bookmark management
  const addBookmark = (e) => {
    e.preventDefault();
    if (!newBookmark.title) return;

    const bookmark = {
      id: Date.now(),
      title: newBookmark.title,
      page: Math.min(Math.max(1, newBookmark.page), numPages || 1),
      parentId: newBookmark.parentId,
      children: [],
    };

    if (bookmark.parentId) {
      setBookmarks((prev) => updateNestedBookmark(prev, bookmark.parentId, bookmark));
    } else {
      setBookmarks((prev) => [...prev, bookmark]);
    }

    setNewBookmark({ title: "", page: currentPage, parentId: null });
  };

  const updateNestedBookmark = (bookmarks, parentId, newBookmark) => {
    return bookmarks.map((bm) => {
      if (bm.id === parentId) {
        return { ...bm, children: [...bm.children, newBookmark] };
      }
      if (bm.children.length > 0) {
        return { ...bm, children: updateNestedBookmark(bm.children, parentId, newBookmark) };
      }
      return bm;
    });
  };

  const deleteBookmark = (id) => {
    setBookmarks((prev) =>
      prev
        .filter((bm) => bm.id !== id)
        .map((bm) => ({
          ...bm,
          children: bm.children ? bm.children.filter((child) => child.id !== id) : [],
        }))
    );
  };

  const startEditing = (bookmark) => {
    setEditingBookmark({ ...bookmark });
  };

  const saveEdit = () => {
    setBookmarks((prev) =>
      prev.map((bm) =>
        bm.id === editingBookmark.id
          ? { ...editingBookmark, children: bm.children }
          : { ...bm, children: updateNestedChildren(bm.children) }
      )
    );
    setEditingBookmark(null);
  };

  const updateNestedChildren = (children) => {
    return children.map((child) =>
      child.id === editingBookmark.id
        ? { ...editingBookmark, children: child.children }
        : { ...child, children: updateNestedChildren(child.children) }
    );
  };

  // Download bookmarks as JSON
  const downloadBookmarks = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bookmarks, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `bookmarks-${Date.now()}.json`);
    link.click();
  };

  // Import bookmarks from JSON
  const importBookmarks = (e) => {
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        const importedBookmarks = JSON.parse(event.target.result);
        setBookmarks(importedBookmarks);
      } catch (error) {
        alert("Invalid JSON file");
      }
    };
    fileReader.readAsText(e.target.files[0]);
  };

  // Reset everything
  const reset = () => {
    setFile(null);
    setBookmarks([]);
    setCurrentPage(1);
    setSearchQuery("");
    setNewBookmark({ title: "", page: 1, parentId: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Filter bookmarks based on search query
  const filteredBookmarks = (bookmarks) => {
    if (!searchQuery) return bookmarks;
    return bookmarks.filter((bm) => {
      const matches = bm.title.toLowerCase().includes(searchQuery.toLowerCase());
      const childMatches = filteredBookmarks(bm.children).length > 0;
      return matches || childMatches;
    }).map((bm) => ({
      ...bm,
      children: filteredBookmarks(bm.children),
    }));
  };

  const renderBookmarks = (bookmarks, level = 0) => {
    return (
      <ul className={`ml-${level * 4} space-y-2`}>
        {bookmarks.map((bm) => (
          <li key={bm.id}>
            {editingBookmark?.id === bm.id ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-gray-50 p-2 rounded">
                <input
                  value={editingBookmark.title}
                  onChange={(e) => setEditingBookmark((prev) => ({ ...prev, title: e.target.value }))}
                  className="flex-1 p-1 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={editingBookmark.page}
                  onChange={(e) => setEditingBookmark((prev) => ({ ...prev, page: parseInt(e.target.value) }))}
                  min="1"
                  max={numPages}
                  className="w-20 p-1 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="p-1 text-green-600 hover:text-green-800">Save</button>
                  <button onClick={() => setEditingBookmark(null)} className="p-1 text-red-600 hover:text-red-800">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded hover:bg-gray-100">
                <button
                  onClick={() => setCurrentPage(bm.page)}
                  className="text-blue-600 hover:underline flex-1 text-left"
                >
                  {bm.title} (Page {bm.page})
                </button>
                <div className="flex gap-2">
                  <button onClick={() => startEditing(bm)} className="text-sm text-gray-600 hover:text-gray-800">Edit</button>
                  <button onClick={() => deleteBookmark(bm.id)} className="text-sm text-red-600 hover:text-red-800">
                    <FaTrash />
                  </button>
                </div>
              </div>
            )}
            {bm.children.length > 0 && renderBookmarks(bm.children, level + 1)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        {/* Left Panel - Bookmarks */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">PDF Bookmark Manager</h1>

          {/* File Upload */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={onFileChange}
              className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="flex gap-2">
              <button
                onClick={downloadBookmarks}
                disabled={!bookmarks.length}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                <FaDownload className="mr-2" /> Export
              </button>
              <input
                type="file"
                accept=".json"
                onChange={importBookmarks}
                className="hidden"
                id="import-bookmarks"
              />
              <label
                htmlFor="import-bookmarks"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer flex items-center"
              >
                <FaUpload className="mr-2" /> Import
              </label>
            </div>
          </div>

          {file && (
            <>
              {/* Search and Add Bookmark */}
              <div className="space-y-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bookmarks..."
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <form onSubmit={addBookmark} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newBookmark.title}
                      onChange={(e) => setNewBookmark((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Bookmark Title"
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={newBookmark.page}
                      onChange={(e) => setNewBookmark((prev) => ({ ...prev, page: parseInt(e.target.value) }))}
                      min="1"
                      max={numPages}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-4">
                    <select
                      value={newBookmark.parentId || ""}
                      onChange={(e) => setNewBookmark((prev) => ({ ...prev, parentId: e.target.value || null }))}
                      className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Top Level</option>
                      {bookmarks.map((bm) => (
                        <option key={bm.id} value={bm.id}>
                          {bm.title}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <FaPlus className="mr-2" /> Add
                    </button>
                  </div>
                </form>
              </div>

              {/* Bookmark List */}
              <div className="mt-6 max-h-[50vh] overflow-y-auto">
                {filteredBookmarks(bookmarks).length > 0 ? (
                  renderBookmarks(filteredBookmarks(bookmarks))
                ) : (
                  <p className="text-gray-500 text-center">No bookmarks match your search</p>
                )}
              </div>

              {/* Reset Button */}
              <button
                onClick={reset}
                className="mt-4 w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset All
              </button>
            </>
          )}
        </div>

        {/* Right Panel - PDF Preview */}
        {file && (
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <Document file={file} onLoadSuccess={onDocumentLoadSuccess} className="flex justify-center">
                <Page pageNumber={currentPage} width={Math.min(600, window.innerWidth - 40)} />
              </Document>
            </div>
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="py-2 text-gray-700">
                Page {currentPage} of {numPages || "..."}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(numPages || prev, prev + 1))}
                disabled={currentPage === numPages}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
        <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
          <li>Nested bookmark hierarchy</li>
          <li>Search functionality for bookmarks</li>
          <li>Export and import bookmarks as JSON</li>
          <li>Edit and delete bookmarks</li>
          <li>Responsive PDF preview with navigation</li>
          <li>Dynamic page width adjustment</li>
        </ul>
      </div>
    </div>
  );
};

export default PDFBookmarkManager;