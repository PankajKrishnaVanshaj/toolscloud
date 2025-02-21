"use client";
import { useState, useEffect } from "react";

const MarkdownPreviewer = () => {
  const [markdown, setMarkdown] = useState(`# Welcome to Markdown Previewer!

Try some Markdown:
- **Bold** and *italic* text
- [Links](https://example.com)
- \`Inline code\`
- \`\`\`
Code block
\`\`\`
- > Blockquote
`);

  const [showCopyAlert, setShowCopyAlert] = useState(false);

  // Improved Markdown renderer
  const renderMarkdown = (text) => {
    try {
      // Sanitize input
      let html = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

      // Headers
      html = html.replace(
        /^###### (.*)$/gm,
        '<h6 class="text-sm font-bold mb-2">$1</h6>'
      );
      html = html.replace(
        /^##### (.*)$/gm,
        '<h5 class="text-base font-bold mb-2">$1</h5>'
      );
      html = html.replace(
        /^#### (.*)$/gm,
        '<h4 class="text-lg font-bold mb-2">$1</h4>'
      );
      html = html.replace(
        /^### (.*)$/gm,
        '<h3 class="text-xl font-bold mb-2">$1</h3>'
      );
      html = html.replace(
        /^## (.*)$/gm,
        '<h2 class="text-2xl font-bold mb-3">$1</h2>'
      );
      html = html.replace(
        /^# (.*)$/gm,
        '<h1 class="text-3xl font-bold mb-4">$1</h1>'
      );

      // Bold and Italic
      html = html.replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-bold">$1</strong>'
      );
      html = html.replace(
        /__(.*?)__/g,
        '<strong class="font-bold">$1</strong>'
      );
      html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
      html = html.replace(/_(.*?)_/g, '<em class="italic">$1</em>');

      // Strikethrough
      html = html.replace(/~~(.*?)~~/g, '<del class="line-through">$1</del>');

      // Blockquotes
      html = html.replace(
        /^> (.*)$/gm,
        '<blockquote class="border-l-4 border-gray-300 pl-4 my-2 italic text-gray-600">$1</blockquote>'
      );

      // Lists (improved handling)
      html = html.replace(/(^[-*+]\s+.*(?:\n[-*+]\s+.*)*)/gm, (match) => {
        const items = match
          .split("\n")
          .map((item) =>
            item.replace(/^[-*+]\s+(.*)$/m, '<li class="ml-4">$1</li>')
          )
          .join("");
        return `<ul class="list-disc my-2">${items}</ul>`;
      });

      html = html.replace(/(^\d+\.\s+.*(?:\n\d+\.\s+.*)*)/gm, (match) => {
        const items = match
          .split("\n")
          .map((item) =>
            item.replace(/^\d+\.\s+(.*)$/m, '<li class="ml-4">$1</li>')
          )
          .join("");
        return `<ol class="list-decimal my-2">${items}</ol>`;
      });

      // Horizontal rule
      html = html.replace(
        /^\s*[-*_]{3,}\s*$/gm,
        '<hr class="border-t-2 border-gray-200 my-4"/>'
      );

      // Code
      html = html.replace(
        /`([^`]+)`/g,
        '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>'
      );
      html = html.replace(
        /```([\s\S]*?)```/g,
        '<pre class="bg-gray-800 text-white p-3 rounded my-2 overflow-x-auto"><code>$1</code></pre>'
      );

      // Links and Images
      html = html.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
      );
      html = html.replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        '<img src="$2" alt="$1" class="max-w-full h-auto my-2 rounded"/>'
      );

      // Paragraphs (wrap text not matched by other rules)
      html = html.replace(
        /^(?!<(h[1-6]|ul|ol|blockquote|pre|hr|img|a)).*$/gm,
        '<p class="my-2">$&</p>'
      );

      // Clean up empty lines
      html = html.replace(/^\s*$/gm, "");

      return html;
    } catch (err) {
      return `<p class="text-red-500">Error rendering Markdown: ${err.message}</p>`;
    }
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setShowCopyAlert(true);
    setTimeout(() => setShowCopyAlert(false), 2000);
  };

  // Handle download
  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "preview.md";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="relative w-full bg-white shadow-lg rounded-lg p-6">
        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            Markdown copied to clipboard!
          </div>
        )}

        

        <div className="flex flex-col md:flex-row gap-4">
          {/* Editor */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Markdown Editor
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Copy
                </button>
                <button
                  onClick={handleDownload}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  Download
                </button>
              </div>
            </div>
            <textarea
              className="w-full h-96 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Enter your Markdown here..."
              aria-label="Markdown editor"
            />
          </div>

          {/* Preview */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div
              className="w-full h-96 p-3 border border-gray-300 rounded-lg bg-white overflow-y-auto prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
              aria-label="Markdown preview"
            />
          </div>
        </div>

        {/* Example */}
        <div className="mt-6 text-sm text-gray-600">
          <p>Try these Markdown features:</p>
          <pre className="bg-gray-50 p-2 rounded-md mt-1 overflow-x-auto">
            {`# Heading
**Bold** and *italic*
- List item
> Blockquote
\`code\`
\`\`\`
code block
\`\`\`
[Link](https://example.com)
![Image](https://via.placeholder.com/150)`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default MarkdownPreviewer;
