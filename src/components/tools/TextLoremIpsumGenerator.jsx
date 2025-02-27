"use client";
import React, { useState } from "react";

// Base Lorem Ipsum words
const loremWords = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
  "duis",
  "aute",
  "irure",
  "in",
  "reprehenderit",
  "voluptate",
  "velit",
  "esse",
  "cillum",
  "fugiat",
  "nulla",
  "pariatur",
  "excepteur",
  "sint",
  "occaecat",
  "cupidatat",
  "non",
  "proident",
  "sunt",
  "culpa",
  "qui",
  "officia",
  "deserunt",
  "mollit",
  "anim",
  "id",
  "est",
  "laborum",
];

const TextLoremIpsumGenerator = () => {
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    type: "paragraphs", // paragraphs, sentences, words
    count: 3,
    startWithLorem: true,
    minWordsPerSentence: 5,
    maxWordsPerSentence: 15,
  });

  // Generate Lorem Ipsum text
  const generateLoremIpsum = () => {
    const {
      type,
      count,
      startWithLorem,
      minWordsPerSentence,
      maxWordsPerSentence,
    } = options;

    if (count < 1 || count > 100) {
      return { error: "Count must be between 1 and 100" };
    }

    let result = [];
    const getRandomWord = () =>
      loremWords[Math.floor(Math.random() * loremWords.length)];
    const getRandomLength = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    if (type === "paragraphs") {
      for (let i = 0; i < count; i++) {
        const sentences = getRandomLength(3, 8); // 3-8 sentences per paragraph
        let paragraph = [];
        for (let j = 0; j < sentences; j++) {
          const words = getRandomLength(
            minWordsPerSentence,
            maxWordsPerSentence
          );
          let sentence = [];
          if (j === 0 && i === 0 && startWithLorem) {
            sentence.push("Lorem ipsum dolor sit amet");
          }
          while (sentence.length < words) {
            sentence.push(getRandomWord());
          }
          paragraph.push(sentence.join(" ") + ".");
        }
        result.push(paragraph.join(" "));
      }
      return result.join("\n\n");
    } else if (type === "sentences") {
      for (let i = 0; i < count; i++) {
        const words = getRandomLength(minWordsPerSentence, maxWordsPerSentence);
        let sentence = [];
        if (i === 0 && startWithLorem) {
          sentence.push("Lorem ipsum dolor sit amet");
        }
        while (sentence.length < words) {
          sentence.push(getRandomWord());
        }
        result.push(sentence.join(" ") + ".");
      }
      return result.join(" ");
    } else {
      // words
      let words = [];
      if (startWithLorem) {
        words.push("lorem");
      }
      while (words.length < count) {
        words.push(getRandomWord());
      }
      return words.join(" ");
    }
  };

  const handleGenerate = async () => {
    setError("");
    setOutputText("");
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate processing
      const result = generateLoremIpsum();

      if (result.error) {
        setError(result.error);
        return;
      }

      setOutputText(result);
    } catch (err) {
      setError("An error occurred while generating text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setOutputText("");
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions((prev) => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Lorem Ipsum Generator
        </h1>

        {/* Options Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Generation Options:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Type:
                </label>
                <select
                  value={options.type}
                  onChange={(e) => handleOptionChange("type", e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="paragraphs">Paragraphs</option>
                  <option value="sentences">Sentences</option>
                  <option value="words">Words</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Count (1-100):
                </label>
                <input
                  type="number"
                  value={options.count}
                  onChange={(e) =>
                    handleOptionChange(
                      "count",
                      Math.max(1, Math.min(100, parseInt(e.target.value) || 1))
                    )
                  }
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  min="1"
                  max="100"
                />
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.startWithLorem}
                  onChange={() =>
                    handleOptionChange(
                      "startWithLorem",
                      !options.startWithLorem
                    )
                  }
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500"
                />
                <span>Start with "Lorem ipsum"</span>
              </label>
              {options.type !== "words" && (
                <>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Min Words/Sentence:
                    </label>
                    <input
                      type="number"
                      value={options.minWordsPerSentence}
                      onChange={(e) =>
                        handleOptionChange(
                          "minWordsPerSentence",
                          Math.max(
                            1,
                            Math.min(
                              options.maxWordsPerSentence,
                              parseInt(e.target.value) || 1
                            )
                          )
                        )
                      }
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      min="1"
                      max={options.maxWordsPerSentence}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Max Words/Sentence:
                    </label>
                    <input
                      type="number"
                      value={options.maxWordsPerSentence}
                      onChange={(e) =>
                        handleOptionChange(
                          "maxWordsPerSentence",
                          Math.max(
                            options.minWordsPerSentence,
                            parseInt(e.target.value) || 15
                          )
                        )
                      }
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      min={options.minWordsPerSentence}
                      max="50"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-cyan-400 cursor-not-allowed"
                  : "bg-cyan-600 hover:bg-cyan-700"
              }`}
            >
              {isLoading ? "Generating..." : "Generate Lorem Ipsum"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Output Display */}
        {outputText && (
          <div className="mt-8 p-6 bg-cyan-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Generated Lorem Ipsum
            </h2>
            <p className="mt-3 text-gray-700 whitespace-pre-wrap">
              {outputText}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(outputText)}
              className="mt-4 w-full py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all font-semibold"
            >
              Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextLoremIpsumGenerator;
