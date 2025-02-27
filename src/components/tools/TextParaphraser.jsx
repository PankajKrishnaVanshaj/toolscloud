"use client";
import React, { useState, useCallback } from "react";

// Expanded synonym dictionary with more nuanced options
const synonymDictionary = {
  happy: ["joyful", "content", "elated", "cheerful"],
  sad: ["sorrowful", "downcast", "gloomy", "melancholic"],
  big: ["large", "substantial", "massive", "grand"],
  small: ["tiny", "modest", "slight", "compact"],
  good: ["excellent", "superb", "splendid", "admirable"],
  bad: ["poor", "dreadful", "subpar", "lousy"],
  quick: ["swift", "brisk", "prompt", "hasty"],
  slow: ["gradual", "leisurely", "lagging", "unhurried"],
  begin: ["start", "launch", "initiate", "embark"],
  end: ["conclude", "terminate", "finalize", "cease"],
  make: ["create", "construct", "formulate", "craft"],
  use: ["employ", "utilize", "apply", "implement"],
  // Added common words
  think: ["consider", "ponder", "reflect", "contemplate"],
  say: ["state", "express", "declare", "mention"],
  go: ["proceed", "travel", "move", "advance"],
};

const TextParaphraser = () => {
  const [inputText, setInputText] = useState("");
  const [paraphrasedText, setParaphrasedText] = useState("");
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Enhanced paraphrasing function with better handling
  const paraphraseText = useCallback((text) => {
    if (!text.trim()) {
      return { error: "Please provide text to paraphrase" };
    }

    if (text.length > 1000) {
      return { error: "Text exceeds 1000 character limit" };
    }

    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
    const changes = [];
    let paraphrasedSentences = sentences.map((sentence) => {
      const words = sentence.trim().split(/\s+/);
      let swapped = false;

      const paraphrasedWords = words.map((word, index) => {
        const cleanWord = word.toLowerCase().replace(/[^a-z']/gi, "");
        const synonyms = synonymDictionary[cleanWord];

        // More intelligent synonym replacement
        if (synonyms && synonyms.length > 0 && Math.random() > 0.3) {
          const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
          changes.push(`"${cleanWord}" → "${synonym}"`);
          return word.replace(cleanWord, synonym);
        }

        // Sophisticated word swapping with context check
        if (
          index > 0 &&
          !swapped &&
          Math.random() > 0.85 &&
          !/[.!?]/.test(words[index - 1]) &&
          words[index].length > 2 &&
          words[index - 1].length > 2
        ) {
          swapped = true;
          changes.push(`Swapped "${words[index - 1]}" and "${word}"`);
          return `${words[index]} ${words[index - 1]}`;
        }

        return word;
      });

      return paraphrasedWords.join(" ").trim();
    });

    let finalText = paraphrasedSentences.join(" ");
    finalText = finalText.replace(/([.!?])\s*/g, "$1 ").trim();
    finalText = finalText.charAt(0).toUpperCase() + finalText.slice(1);

    return {
      original: text,
      paraphrased: finalText,
      steps: changes.length > 0 ? changes : ["No significant changes made"],
    };
  }, []);

  const handleParaphrase = async () => {
    setError("");
    setParaphrasedText("");
    setIsLoading(true);

    try {
      // Simulate async processing for realism
      await new Promise((resolve) => setTimeout(resolve, 500));
      const calcResult = paraphraseText(inputText);

      if (calcResult.error) {
        setError(calcResult.error);
        return;
      }

      setParaphrasedText(calcResult.paraphrased);
      setResult(calcResult);
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setParaphrasedText("");
    setError("");
    setShowDetails(false);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl transition-all duration-300">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Advanced Text Paraphraser
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Your Text (max 1000 characters):
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-40 resize-y transition-all"
              placeholder="e.g., The quick brown fox jumps over the lazy dog."
              maxLength={1000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/1000
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleParaphrase}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isLoading ? "Processing..." : "Paraphrase"}
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

        {/* Result Display */}
        {paraphrasedText && (
          <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Paraphrased Result:
            </h2>
            <p className="mt-3 text-lg text-center text-gray-700">
              {paraphrasedText}
            </p>

            {/* Details Toggle */}
            <div className="text-center mt-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-indigo-600 hover:underline focus:outline-none"
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </button>
            </div>

            {showDetails && result && (
              <div className="mt-4 text-sm text-gray-600">
                <p className="font-medium">Paraphrasing Process:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Original: "{result.original}"</li>
                  {result.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                  <li>Result: "{result.paraphrased}"</li>
                </ul>
              </div>
            )}
          </div>
        )}

       
      </div>
    </div>
  );
};

export default TextParaphraser;