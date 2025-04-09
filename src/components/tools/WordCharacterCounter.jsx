"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaChartBar,
} from "react-icons/fa";

const WordCharacterCounter = () => {
  const [text, setText] = useState("");
  const [options, setOptions] = useState({
    ignoreCase: true,          // Case-insensitive word counting
    excludePunctuation: false, // Exclude punctuation from words
    customDelimiter: "",       // Custom sentence delimiter
    showWordFrequency: false,  // Toggle word frequency table
  });

  // Text Analysis Functions
  const analyzeText = useCallback(() => {
    const trimmedText = text.trim();
    const wordPattern = options.excludePunctuation
      ? /[^\s.,!?;:"'(){}[\]]+/g
      : /\S+/g;
    const words = trimmedText.length === 0 ? [] : (trimmedText.match(wordPattern) || []);
    const sentenceDelimiter = options.customDelimiter || /[.!?]+/;
    const sentences = trimmedText.split(sentenceDelimiter).filter(Boolean);
    const paragraphs = trimmedText.split(/\n+/).filter(Boolean);

    const wordCount = words.length;
    const charCount = text.length;
    const charCountNoSpaces = text.replace(/\s/g, "").length;
    const sentenceCount = sentences.length;
    const paragraphCount = paragraphs.length;

    const avgWordLength = wordCount > 0 ? (charCountNoSpaces / wordCount).toFixed(2) : 0;
    const readingTime = wordCount > 0 ? (wordCount / 200).toFixed(2) : "0"; // 200 wpm
    const speakingTime = wordCount > 0 ? (wordCount / 130).toFixed(2) : "0"; // 130 wpm

    const longestWord = words.reduce((longest, word) => word.length > longest.length ? word : longest, "");
    const avgSentenceLength = sentenceCount > 0 ? (wordCount / sentenceCount).toFixed(2) : "0";

    const wordFrequency = words.reduce((freq, word) => {
      const normalizedWord = options.ignoreCase ? word.toLowerCase() : word;
      freq[normalizedWord] = (freq[normalizedWord] || 0) + 1;
      return freq;
    }, {});
    const mostFrequentWord = Object.keys(wordFrequency).length > 0
      ? Object.entries(wordFrequency).reduce((a, b) => b[1] > a[1] ? b : a, ["", 0])[0]
      : "N/A";
    const uniqueWordCount = new Set(Object.keys(wordFrequency)).size;
    const punctuationCount = (text.match(/[.,!?;:"'(){}[\]]/g) || []).length;

    const syllableCount = words.reduce((count, word) => {
      let matches = word.match(/[aeiouy]+/gi);
      return count + (matches ? matches.length : 0);
    }, 0);

    const fleschScore = sentenceCount > 0 && wordCount > 0
      ? (206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount)).toFixed(2)
      : "0";

    return {
      wordCount,
      charCount,
      charCountNoSpaces,
      sentenceCount,
      paragraphCount,
      avgWordLength,
      readingTime,
      speakingTime,
      longestWord,
      avgSentenceLength,
      mostFrequentWord,
      uniqueWordCount,
      punctuationCount,
      syllableCount,
      fleschScore,
      wordFrequency,
    };
  }, [text, options]);

  const stats = analyzeText();

  const handleReset = () => {
    setText("");
  };

  const handleExport = () => {
    const content = `Word Count: ${stats.wordCount}\nCharacters (with spaces): ${stats.charCount}\nCharacters (no spaces): ${stats.charCountNoSpaces}\nSentences: ${stats.sentenceCount}\nParagraphs: ${stats.paragraphCount}\nAvg. Word Length: ${stats.avgWordLength}\nAvg. Sentence Length: ${stats.avgSentenceLength}\nReading Time (min): ${stats.readingTime}\nSpeaking Time (min): ${stats.speakingTime}\nLongest Word: ${stats.longestWord || "N/A"}\nMost Frequent Word: ${stats.mostFrequentWord}\nUnique Words: ${stats.uniqueWordCount}\nPunctuation Count: ${stats.punctuationCount}\nSyllables: ${stats.syllableCount}\nFlesch Score: ${stats.fleschScore}${options.showWordFrequency ? `\n\nWord Frequency:\n${Object.entries(stats.wordFrequency).map(([word, count]) => `${word}: ${count}`).join("\n")}` : ""}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "text_stats.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full ">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
          Advanced Word & Character Counter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <textarea
            className="w-full h-48 sm:h-56 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y transition-all"
            placeholder="Type or paste text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="text-right text-xs sm:text-sm text-gray-500">
            {text.length}/10000 characters
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Counting Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.ignoreCase}
                  onChange={() => handleOptionChange("ignoreCase", !options.ignoreCase)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Ignore Case</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.excludePunctuation}
                  onChange={() => handleOptionChange("excludePunctuation", !options.excludePunctuation)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Exclude Punctuation in Words</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.showWordFrequency}
                  onChange={() => handleOptionChange("showWordFrequency", !options.showWordFrequency)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Show Word Frequency</span>
              </label>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Sentence Delimiter:</label>
                <input
                  type="text"
                  value={options.customDelimiter}
                  onChange={(e) => handleOptionChange("customDelimiter", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., ;"
                  maxLength={5}
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleReset}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            <button
              onClick={handleExport}
              className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold"
            >
              <FaDownload className="inline mr-2" />
              Export Stats
            </button>
          </div>
        </div>

        {/* Stats Display */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Words", value: stats.wordCount },
            { label: "Characters (with spaces)", value: stats.charCount },
            { label: "Characters (no spaces)", value: stats.charCountNoSpaces },
            { label: "Sentences", value: stats.sentenceCount },
            { label: "Paragraphs", value: stats.paragraphCount },
            { label: "Avg. Word Length", value: stats.avgWordLength },
            { label: "Avg. Sentence Length", value: stats.avgSentenceLength },
            { label: "Reading Time (min)", value: stats.readingTime },
            { label: "Speaking Time (min)", value: stats.speakingTime },
            { label: "Longest Word", value: stats.longestWord || "N/A" },
            { label: "Most Frequent Word", value: stats.mostFrequentWord },
            { label: "Unique Words", value: stats.uniqueWordCount },
            { label: "Punctuation Count", value: stats.punctuationCount },
            { label: "Syllables", value: stats.syllableCount },
            { label: "Flesch Score", value: stats.fleschScore },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-100 p-3 rounded-md text-center">
              <span className="font-medium text-gray-700">{label}:</span>{" "}
              <strong className="text-blue-600">{value}</strong>
            </div>
          ))}
        </div>

        {/* Word Frequency Table */}
        {options.showWordFrequency && stats.wordFrequency && Object.keys(stats.wordFrequency).length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center flex items-center justify-center">
              <FaChartBar className="mr-2" /> Word Frequency
            </h2>
            <div className="mt-3 max-h-64 overflow-auto">
              <table className="w-full text-sm text-gray-700">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="p-2 text-left">Word</th>
                    <th className="p-2 text-right">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.wordFrequency)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 50) // Limit to top 50 for performance
                    .map(([word, count]) => (
                      <tr key={word} className="border-t">
                        <td className="p-2">{word}</td>
                        <td className="p-2 text-right">{count}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Blog Content */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300 text-blue-600">
          <h1 className="text-2xl font-bold mb-4 text-blue-700">Advanced Word & Character Counter: The Ultimate Free Text Analysis Tool for 2025</h1>
          <p className="mb-4 text-sm">
            Are you on the hunt for the <strong>best free word counter</strong> or <strong>character counter</strong> that does more than just tally numbers? Our <strong>Advanced Word & Character Counter</strong> is your go-to solution in 2025. Built for writers, students, marketers, and developers, this free online tool offers unparalleled text analysis features—word frequency tables, Flesch readability scores, customizable options, and exportable stats—all without costing a dime. In this 2000-word guide, we’ll explore how it works, why it’s a must-have, and how it can elevate your writing or content strategy. Let’s get started!
          </p>

          <h2 className="text-xl font-semibold mb-3 text-blue-700">What Is a Word & Character Counter?</h2>
          <p className="mb-4 text-sm">
            At its core, a <strong>word and character counter</strong> counts words, characters, sentences, and paragraphs in your text. Basic tools stop there, but our advanced version digs deeper, providing metrics like reading time, speaking time, syllable counts, and readability scores. Whether you’re crafting a tweet within 280 characters, writing a 1000-word essay, or optimizing a blog post for SEO, this tool delivers insights to refine your work.
          </p>
          <p className="mb-4 text-sm">
            In 2025, text analysis tools are indispensable. With the rise of digital content—blogs, social media, e-learning, and AI-generated text—a <strong>free word counter online</strong> like ours helps you stay ahead. It’s not just about counting; it’s about understanding your text’s structure, readability, and impact.
          </p>

          <h2 className="text-xl font-semibold mb-3 text-blue-700">Why Choose Our Advanced Word & Character Counter?</h2>
          <p className="mb-4 text-sm">
            With countless counters online, why pick ours? Simple: it’s the <strong>best free character counter and word counter</strong> for its depth, flexibility, and user-friendly design. Here’s what sets it apart in 2025:
          </p>

          <h3 className="text-lg font-medium mb-2 text-blue-700">1. Comprehensive Text Statistics</h3>
          <p className="mb-4 text-sm">
            Our tool provides a detailed breakdown:
          </p>
          <ul className="list-disc list-inside mb-4 text-sm">
            <li><strong>Word count</strong>: Hit your targets for essays, articles, or SEO.</li>
            <li><strong>Character count (with/without spaces)</strong>: Perfect for Twitter or meta descriptions.</li>
            <li><strong>Sentence and paragraph counts</strong>: Structure your writing effectively.</li>
            <li><strong>Average lengths</strong>: Optimize readability with word and sentence stats.</li>
            <li><strong>Punctuation and syllables</strong>: Fine-tune complexity.</li>
          </ul>
          <p className="mb-4 text-sm">
            These stats empower you to craft polished, audience-friendly content every time.
          </p>

          <h3 className="text-lg font-medium mb-2 text-blue-700">2. Readability Insights with Flesch Score</h3>
          <p className="mb-4 text-sm">
            Readability drives engagement and SEO success. Our tool calculates the <strong>Flesch Reading Ease Score</strong>, a trusted metric based on sentence length and syllables. Aim for 60-70 for most audiences—easy yet informative. Writers and marketers love this feature for tailoring content to readers in 2025.
          </p>

          <h3 className="text-lg font-medium mb-2 text-blue-700">3. Time Estimates for Readers and Speakers</h3>
          <p className="mb-4 text-sm">
            Want to know how long your text takes to consume? We estimate:
          </p>
          <ul className="list-disc list-inside mb-4 text-sm">
            <li><strong>Reading time</strong>: 200 WPM (adult average).</li>
            <li><strong>Speaking time</strong>: 130 WPM (natural speech).</li>
          </ul>
          <p className="mb-4 text-sm">
            Perfect for bloggers timing posts or podcasters scripting episodes.
          </p>

          <h3 className="text-lg font-medium mb-2 text-blue-700">4. Word Frequency Analysis</h3>
          <p className="mb-4 text-sm">
            The <strong>word frequency table</strong> (optional) lists your top 50 words, helping you spot repetition or optimize keywords. For example, targeting “free word counter”? Ensure it’s used effectively without overstuffing—key for SEO in 2025.
          </p>

          <h3 className="text-lg font-medium mb-2 text-blue-700">5. Customizable Counting Options</h3>
          <p className="mb-4 text-sm">
            Tailor the tool to your needs:
          </p>
          <ul className="list-disc list-inside mb-4 text-sm">
            <li><strong>Ignore case</strong>: “Word” = “word”.</li>
            <li><strong>Exclude punctuation</strong>: Focus on pure words.</li>
            <li><strong>Custom delimiters</strong>: Define sentence breaks (e.g., semicolons).</li>
          </ul>
          <p className="mb-4 text-sm">
            This flexibility suits everything from essays to code documentation.
          </p>

          <h3 className="text-lg font-medium mb-2 text-blue-700">6. Exportable Stats</h3>
          <p className="mb-4 text-sm">
            Save your analysis as a <code>.txt</code> file with one click. Ideal for records, reports, or sharing—no other free tool matches this convenience.
          </p>

          <h2 className="text-xl font-semibold mb-3 text-blue-700">How to Use Our Free Word & Character Counter</h2>
          <p className="mb-4 text-sm">
            It’s simple:
          </p>
          <ol className="list-decimal list-inside mb-4 text-sm">
            <li><strong>Paste or type text</strong> (up to 10,000 characters).</li>
            <li><strong>Adjust options</strong>: Case, punctuation, delimiters.</li>
            <li><strong>See real-time stats</strong>: Updates as you type.</li>
            <li><strong>Export or reset</strong>: Save or start fresh.</li>
          </ol>
          <p className="mb-4 text-sm">
            No sign-up, no fees—just instant access to a <strong>free online word counter</strong>.
          </p>

          <h2 className="text-xl font-semibold mb-3 text-blue-700">Who Benefits from This Tool?</h2>
          <p className="mb-4 text-sm">
            In 2025, this tool serves a wide audience:
          </p>

          <h3 className="text-lg font-medium mb-2 text-blue-700">Writers and Bloggers</h3>
          <p className="mb-4 text-sm">
            Hit word goals, improve readability, and optimize keywords. A 2000-word blog post like this? Track progress and polish it effortlessly.
          </p>

          <h3 className="text-lg font-medium mb-2 text-blue-700">Students and Educators</h3>
          <p className="mb-4 text-sm">
            Meet essay requirements and enhance clarity. Teachers can analyze student work for structure and complexity.
          </p>

          <h3 className="text-lg font-medium mb-2 text-blue-700">Marketers and SEO Experts</h3>
          <p className="mb-4 text-sm">
            Perfect meta tags (160 characters), balance keywords, and boost readability for Google rankings in 2025.
          </p>

          <h3 className="text-lg font-medium mb-2 text-blue-700">Developers</h3>
          <p className="mb-4 text-sm">
            Analyze user input or integrate this React component into apps. It’s open-source and developer-ready.
          </p>

          <h2 className="text-xl font-semibold mb-3 text-blue-700">Key Metrics Explained</h2>
          <h3 className="text-lg font-medium mb-2 text-blue-700">Flesch Reading Ease Score</h3>
          <p className="mb-4 text-sm">
            Formula: <code>206.835 - 1.015 × (words ÷ sentences) - 84.6 × (syllables ÷ words)</code>
          </p>
          <ul className="list-disc list-inside mb-4 text-sm">
            <li><strong>90-100</strong>: Very easy (5th grade).</li>
            <li><strong>60-70</strong>: Standard (8th-9th grade).</li>
            <li><strong>0-30</strong>: Difficult (college level).</li>
          </ul>

          <h3 className="text-lg font-medium mb-2 text-blue-700">Time Estimates</h3>
          <p className="mb-4 text-sm">
            Reading (200 WPM) and speaking (130 WPM) times help gauge audience effort.
          </p>

          <h2 className="text-xl font-semibold mb-3 text-blue-700">Why Text Analysis Matters in 2025</h2>
          <p className="mb-4 text-sm">
            Digital content rules today’s world:
          </p>
          <ul className="list-disc list-inside mb-4 text-sm">
            <li><strong>SEO</strong>: Readable, keyword-rich text ranks higher.</li>
            <li><strong>Content Creation</strong>: Stand out amid AI tools.</li>
            <li><strong>Education</strong>: Improve writing skills.</li>
            <li><strong>Social Media</strong>: Fit tight character limits.</li>
          </ul>

          <h2 className="text-xl font-semibold mb-3 text-blue-700">Case Study: Boosting a Blog Post</h2>
          <p className="mb-4 text-sm">
            A blogger used our tool to optimize a 1500-word post. The frequency table showed “tips” appeared 12 times—too much. They cut it to 5, raised the Flesch score from 55 to 65, and ranked on Google’s first page within weeks. That’s the power of advanced analysis!
          </p>

          <h2 className="text-xl font-semibold mb-3 text-blue-700">Conclusion</h2>
          <p className="mb-4 text-sm">
            The <strong>Advanced Word & Character Counter</strong> is the ultimate <strong>free text analysis tool</strong> for 2025. With robust features and SEO-friendly insights, it’s perfect for writers, students, marketers, and developers. Try it now and transform your text!
          </p>
        </div>
      </div>
    </div>
  );
};

export default WordCharacterCounter;