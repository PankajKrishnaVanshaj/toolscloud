"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaUndo,
  FaRedo,
  FaEraser,
  FaListUl,
  FaListOl,
  FaIndent,
  FaOutdent,
  FaSuperscript,
  FaSubscript,
  FaLink,
  FaUnlink,
  FaCopy,
  FaDownload,
  FaUpload,
  FaHeading,
  FaCode,
  FaQuoteRight,
  FaImage,
} from "react-icons/fa";

const TextEditor = () => {
  const [text, setText] = useState("");
  const [history, setHistory] = useState([""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const editorRef = useRef(null);

  // Ensure initial history reflects the starting text
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = text;
    }
  }, []);

  const updateHistory = useCallback((newText) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newText);
    setHistory(newHistory.slice(-20)); // Limit history to last 20 changes
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleTextChange = (e) => {
    const newText = e.target.innerHTML;
    setText(newText);
    updateHistory(newText);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setText(history[historyIndex - 1]);
      if (editorRef.current) {
        editorRef.current.innerHTML = history[historyIndex - 1];
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setText(history[historyIndex + 1]);
      if (editorRef.current) {
        editorRef.current.innerHTML = history[historyIndex + 1];
      }
    }
  };

  const handleClear = () => {
    setText("");
    setHistory([""]);
    setHistoryIndex(0);
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  };

  const applyFormat = (command, value = null) => {
    if (editorRef.current) {
      document.execCommand(command, false, value);
      editorRef.current.focus();
      handleTextChange({ target: editorRef.current });
    }
  };

  const handleInsertLink = () => {
    const url = prompt("Enter URL:");
    if (url) applyFormat("createLink", url);
  };

  const handleInsertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) applyFormat("insertImage", url);
  };

  const handleCopy = () => {
    if (editorRef.current) {
      navigator.clipboard.writeText(editorRef.current.innerText);
      alert("Text copied to clipboard!");
    }
  };

  const exportContent = () => {
    if (text) {
      const blob = new Blob([text], { type: "text/html" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `editor_content_${Date.now()}.html`;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  const importContent = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        setText(content);
        if (editorRef.current) {
          editorRef.current.innerHTML = content;
        }
        updateHistory(content);
      };
      reader.readAsText(file);
    }
  };

  const wordCount = () => {
    if (!editorRef.current) return 0;
    const plainText = editorRef.current.innerText.trim();
    return plainText ? plainText.split(/\s+/).length : 0;
  };

  const charCount = () => {
    if (!editorRef.current) return 0;
    return editorRef.current.innerText.length;
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white shadow-lg rounded-2xl p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-gray-900">
          Advanced Text Editor
        </h1>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 justify-center">
          <button
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            onClick={() => applyFormat("bold")}
            title="Bold"
          >
            <FaBold />
          </button>
          <button
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            onClick={() => applyFormat("italic")}
            title="Italic"
          >
            <FaItalic />
          </button>
          <button
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            onClick={() => applyFormat("underline")}
            title="Underline"
          >
            <FaUnderline />
          </button>
          <button
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            onClick={() => applyFormat("strikeThrough")}
            title="Strikethrough"
          >
            <FaStrikethrough />
          </button>
          <button
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            onClick={() => applyFormat("justifyLeft")}
            title="Align Left"
          >
            <FaAlignLeft />
          </button>
          <button
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            onClick={() => applyFormat("justifyCenter")}
            title="Align Center"
          >
            <FaAlignCenter />
          </button>
          <button
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            onClick={() => applyFormat("justifyRight")}
            title="Align Right"
          >
            <FaAlignRight />
          </button>
          <button
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            onClick={() => applyFormat("justifyFull")}
            title="Justify"
          >
            <FaAlignJustify />
          </button>
          <button
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            onClick={() => applyFormat("insertUnorderedList")}
            title="Unordered List"
          >
            <FaListUl />
          </button>
          <button
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            onClick={() => applyFormat("insertOrderedList")}
            title="Ordered List"
          >
            <FaListOl />
          </button>
          <button
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            onClick={() => applyFormat("indent")}
            title="Indent"
          >
            <FaIndent />
          </button>
          <button
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            onClick={() => applyFormat("outdent")}
            title="Outdent"
          >
            <FaOutdent />
          </button>
          <button
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            onClick={() => applyFormat("superscript")}
            title="Superscript"
          >
            <FaSuperscript />
          </button>
          <button
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            onClick={() => applyFormat("subscript")}
            title="Subscript"
          >
            <FaSubscript />
          </button>
          <button
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            onClick={handleInsertLink}
            title="Insert Link"
          >
            <FaLink />
          </button>
          <button
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            onClick={() => applyFormat("unlink")}
            title="Remove Link"
          >
            <FaUnlink />
          </button>
          <button
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            onClick={handleInsertImage}
            title="Insert Image"
          >
            <FaImage />
          </button>
          <button
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            onClick={() => applyFormat("formatBlock", "H1")}
            title="Heading 1"
          >
            <FaHeading />
          </button>
          <button
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            onClick={() => applyFormat("formatBlock", "PRE")}
            title="Code Block"
          >
            <FaCode />
          </button>
          <button
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            onClick={() => applyFormat("formatBlock", "BLOCKQUOTE")}
            title="Blockquote"
          >
            <FaQuoteRight />
          </button>
          <input
            type="color"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded"
            onChange={(e) => applyFormat("foreColor", e.target.value)}
            title="Text Color"
          />
          <input
            type="color"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded"
            onChange={(e) => applyFormat("hiliteColor", e.target.value)}
            title="Background Color"
          />
          <select
            className="p-2 border rounded-md text-sm sm:text-base"
            defaultValue="3"
            onChange={(e) => applyFormat("fontSize", e.target.value)}
            title="Font Size"
          >
            <option value="1">Tiny</option>
            <option value="2">Small</option>
            <option value="3">Normal</option>
            <option value="4">Medium</option>
            <option value="5">Large</option>
            <option value="6">X-Large</option>
            <option value="7">XX-Large</option>
          </select>
          <select
            className="p-2 border rounded-md text-sm sm:text-base"
            defaultValue="Arial"
            onChange={(e) => applyFormat("fontName", e.target.value)}
            title="Font Family"
          >
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Verdana">Verdana</option>
            <option value="Georgia">Georgia</option>
            <option value="Trebuchet MS">Trebuchet MS</option>
          </select>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 justify-center">
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm disabled:bg-gray-400"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
          >
            <FaUndo /> Undo
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm disabled:bg-gray-400"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
          >
            <FaRedo /> Redo
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-xs sm:text-sm"
            onClick={handleClear}
          >
            <FaEraser /> Clear
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-xs sm:text-sm"
            onClick={handleCopy}
          >
            <FaCopy /> Copy
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs sm:text-sm disabled:bg-gray-400"
            onClick={exportContent}
            disabled={!text}
          >
            <FaDownload /> Export
          </button>
          <label className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs sm:text-sm cursor-pointer">
            <FaUpload /> Import
            <input
              type="file"
              accept=".html,.txt"
              className="hidden"
              onChange={importContent}
            />
          </label>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-2 justify-center">
          <p>Words: <span className="text-blue-600">{wordCount()}</span></p>
          <p>Characters: <span className="text-blue-600">{charCount()}</span></p>
        </div>

        {/* Editor */}
        <div
          id="editor"
          ref={editorRef}
          className="w-full h-48 sm:h-64 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-auto bg-white text-sm sm:text-base"
          contentEditable
          onInput={handleTextChange}
          dangerouslySetInnerHTML={{ __html: text }}
        ></div>

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700 text-sm sm:text-base">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-xs sm:text-sm">
            <li>Rich text formatting (bold, italic, lists, etc.)</li>
            <li>Advanced styling (headings, code, blockquote, images)</li>
            <li>Undo/redo with history tracking</li>
            <li>Import/export as HTML</li>
            <li>Responsive design for all devices</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextEditor;