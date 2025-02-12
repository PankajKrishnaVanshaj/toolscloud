"use client";
import { useState } from "react";

const MarkdownPreviewer = () => {
  const [markdown, setMarkdown] = useState(`# Welcome to Markdown Previewer!`);

  const renderMarkdown = (text) => {
    // Escape special HTML characters
    text = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headers
    text = text.replace(/^###### (.*$)/gm, "<h6>$1</h6>");
    text = text.replace(/^##### (.*$)/gm, "<h5>$1</h5>");
    text = text.replace(/^#### (.*$)/gm, "<h4>$1</h4>");
    text = text.replace(/^### (.*$)/gm, "<h3>$1</h3>");
    text = text.replace(/^## (.*$)/gm, "<h2>$1</h2>");
    text = text.replace(/^# (.*$)/gm, "<h1>$1</h1>");

    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/__(.*?)__/g, "<strong>$1</strong>");

    // Italic
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
    text = text.replace(/_(.*?)_/g, "<em>$1</em>");

    // Strikethrough
    text = text.replace(/~~(.*?)~~/g, "<del>$1</del>");

    // Blockquotes
    text = text.replace(
      /^> (.*$)/gm,
      "<blockquote class='border-l-4 pl-4 italic'>$1</blockquote>"
    );

    // Unordered lists
    text = text.replace(/^[-*+] (.*$)/gm, "<li>$1</li>");
    text = text.replace(
      /(<li>.*<\/li>)/g,
      "<ul class='list-disc list-inside'>$1</ul>"
    );

    // Ordered lists
    text = text.replace(/^\d+\. (.*$)/gm, "<li>$1</li>");
    text = text.replace(
      /(<li>.*<\/li>)/g,
      "<ol class='list-decimal list-inside'>$1</ol>"
    );

    // Horizontal rule
    text = text.replace(/^\s*[-*_]{3,}\s*$/gm, "<hr class='border-t-2 my-4'/>");

    // Inline code
    text = text.replace(
      /`([^`]+)`/g,
      "<code class='bg-gray-100 p-1 rounded'>$1</code>"
    );

    // Code blocks
    text = text.replace(
      /```([\s\S]*?)```/g,
      "<pre class='bg-gray-200 p-3 rounded'><code>$1</code></pre>"
    );

    // Links
    text = text.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">$1</a>'
    );

    // Images
    text = text.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" class="w-full max-w-sm my-2"/>'
    );

    // Line breaks
    text = text.replace(/\n/g, "<br/>");

    return text;
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg flex flex-col md:flex-row gap-3">
      <textarea
        className="flex-1 p-2 border rounded-lg min-h-52"
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        placeholder="Enter your Markdown here..."
      />
      <div
        className="flex-1 p-2 border rounded-lg min-h-52 overflow-y-auto"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
      ></div>
    </div>
  );
};

export default MarkdownPreviewer;
