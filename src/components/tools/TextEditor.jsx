"use client";

import { useState } from "react";
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
} from "react-icons/fa";

const TextEditor = () => {
  const [text, setText] = useState("");
  const [history, setHistory] = useState([""]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleTextChange = (e) => {
    setText(e.target.innerHTML);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(e.target.innerHTML);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setText(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setText(history[historyIndex + 1]);
    }
  };

  const handleClear = () => {
    setText("");
    setHistory([""]);
    setHistoryIndex(0);
  };

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const handleInsertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      document.execCommand("createLink", false, url);
    }
  };

  const handleCopy = () => {
    const editor = document.getElementById("editor");
    if (editor) {
      navigator.clipboard.writeText(editor.innerText);
      alert("Copied to clipboard!");
    }
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-2xl">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          className="bg-gray-200 p-2 rounded-md"
          onClick={() => applyFormat("bold")}
        >
          <FaBold />
        </button>
        <button
          className="bg-gray-200 p-2 rounded-md"
          onClick={() => applyFormat("italic")}
        >
          <FaItalic />
        </button>
        <button
          className="bg-gray-200 p-2 rounded-md"
          onClick={() => applyFormat("underline")}
        >
          <FaUnderline />
        </button>
        <button
          className="bg-gray-200 p-2 rounded-md"
          onClick={() => applyFormat("strikeThrough")}
        >
          <FaStrikethrough />
        </button>
        <button
          className="bg-gray-200 p-2 rounded-md"
          onClick={() => applyFormat("justifyLeft")}
        >
          <FaAlignLeft />
        </button>
        <button
          className="bg-gray-200 p-2 rounded-md"
          onClick={() => applyFormat("justifyCenter")}
        >
          <FaAlignCenter />
        </button>
        <button
          className="bg-gray-200 p-2 rounded-md"
          onClick={() => applyFormat("justifyRight")}
        >
          <FaAlignRight />
        </button>
        <button
          className="bg-gray-200 p-2 rounded-md"
          onClick={() => applyFormat("justifyFull")}
        >
          <FaAlignJustify />
        </button>
        <button
          className="bg-gray-200 p-2 rounded-md"
          onClick={() => applyFormat("insertUnorderedList")}
        >
          <FaListUl />
        </button>
        <button
          className="bg-gray-200 p-2 rounded-md"
          onClick={() => applyFormat("insertOrderedList")}
        >
          <FaListOl />
        </button>
        <button
          className="bg-gray-200 p-2 rounded-md"
          onClick={() => applyFormat("indent")}
        >
          <FaIndent />
        </button>
        <button
          className="bg-gray-200 p-2 rounded-md"
          onClick={() => applyFormat("outdent")}
        >
          <FaOutdent />
        </button>
        <button
          className="bg-gray-200 p-2 rounded-md"
          onClick={() => applyFormat("superscript")}
        >
          <FaSuperscript />
        </button>
        <button
          className="bg-gray-200 p-2 rounded-md"
          onClick={() => applyFormat("subscript")}
        >
          <FaSubscript />
        </button>
        <button
          className="bg-gray-200 p-2 rounded-md"
          onClick={handleInsertLink}
        >
          <FaLink />
        </button>
        <button
          className="bg-gray-200 p-2 rounded-md"
          onClick={() => applyFormat("unlink")}
        >
          <FaUnlink />
        </button>
        <input
          type="color"
          className="w-10 h-10"
          onChange={(e) => applyFormat("foreColor", e.target.value)}
          title="Text Color"
        />
        <input
          type="color"
          className="w-10 h-10"
          onChange={(e) => applyFormat("hiliteColor", e.target.value)}
          title="Background Color"
        />

        {/* Font Size */}
        <select
          className="p-2 border rounded-md"
          defaultValue="3"
          onChange={(e) => applyFormat("fontSize", e.target.value)}
        >
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="7">Extra Large</option>
        </select>

        {/* Font Family */}
        <select
          className="p-2 border rounded-md"
          defaultValue="Arial"
          onChange={(e) => applyFormat("fontName", e.target.value)}
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
        </select>

        <button
          className="font-bold px-6 py-1 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text shadow-md border border-gray-300 rounded-xl hover:border-primary hover:shadow-lg"
          onClick={handleUndo}
        >
          Undo 
        </button>
        <button
          className="font-bold px-6 py-1 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text shadow-md border border-gray-300 rounded-xl hover:border-primary hover:shadow-lg"
          onClick={handleRedo}
        >
          Redo 
        </button>
        <button
          className="font-bold px-6 py-1 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text shadow-md border border-gray-300 rounded-xl hover:border-primary hover:shadow-lg"
          onClick={handleClear}
        >
          Eraser 
        </button>
        <button
          className="font-bold px-6 py-1 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text shadow-md border border-gray-300 rounded-xl hover:border-primary hover:shadow-lg"
          onClick={handleCopy}
        >
          Copy 
        </button>
      </div>

      {/* Editor */}
      <div
        id="editor"
        className="w-full h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary overflow-auto"
        contentEditable
        onInput={handleTextChange}
        dangerouslySetInnerHTML={{ __html: text }}
      ></div>
    </div>
  );
};

export default TextEditor;
