"use client";
import { useState, useCallback } from "react";
import { FaDownload, FaSync, FaCopy } from "react-icons/fa";
import { MdSubtitles } from "react-icons/md"; // Correct import for MdSubtitles

const YouTubeToText = () => {
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("en"); // Default to English
  const [format, setFormat] = useState("text"); // Text or SRT

  // Extract YouTube video ID
  const extractVideoId = (url) => {
    const match = url.match(
      /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:[^\/\n\s]+\/\S+\/|\S*?v=|\S*?\/(?:\S*?v=))([a-zA-Z0-9_-]{11}))/
    );
    return match ? match[1] : null;
  };

  // Fetch transcript
  const fetchTranscript = useCallback(async () => {
    const videoId = extractVideoId(url);
    if (!videoId) {
      setError("Invalid YouTube URL");
      return;
    }

    setIsLoading(true);
    setError("");
    setTranscript("");

    try {
      // Step 1: Get available captions
      const captionsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}&part=snippet`
      );
      const captionsData = await captionsResponse.json();

      if (!captionsData.items || captionsData.items.length === 0) {
        setError("No captions available for this video");
        setIsLoading(false);
        return;
      }

      // Find caption track for selected language
      const captionTrack = captionsData.items.find(
        (item) => item.snippet.language === language
      ) || captionsData.items[0]; // Fallback to first available

      if (!captionTrack) {
        setError(`No captions found for language: ${language}`);
        setIsLoading(false);
        return;
      }

      // Step 2: Fetch the actual caption content
      const captionId = captionTrack.id;
      const captionResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/captions/${captionId}?key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}&tfmt=${format === "srt" ? "srt" : "sbv"}`
      );
      const captionText = await captionResponse.text();

      setTranscript(captionText);
    } catch (err) {
      setError("Error fetching transcript: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [url, language, format]);

  // Download transcript as a file
  const downloadTranscript = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `transcript-${extractVideoId(url) || "youtube"}.${format === "srt" ? "srt" : "txt"}`;
    link.click();
  };

  // Copy transcript to clipboard
  const copyToClipboard = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    alert("Transcript copied to clipboard!");
  };

  // Reset form
  const reset = () => {
    setUrl("");
    setTranscript("");
    setError("");
    setLanguage("en");
    setFormat("text");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <MdSubtitles className="mr-2" /> YouTube Transcript Extractor
        </h1>

        {/* Input and Settings */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                YouTube URL
              </label>
              <input
                type="text"
                placeholder="Enter YouTube Video URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  {/* Add more languages as needed */}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  <option value="text">Plain Text</option>
                  <option value="srt">SRT (Subtitles)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={fetchTranscript}
              disabled={!url || isLoading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <MdSubtitles className="mr-2" />
              )}
              {isLoading ? "Fetching..." : "Get Transcript"}
            </button>
            <button
              onClick={downloadTranscript}
              disabled={!transcript || isLoading}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
            <button
              onClick={copyToClipboard}
              disabled={!transcript || isLoading}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCopy className="mr-2" /> Copy
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Error and Transcript Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        {transcript && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Transcript:</h2>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap">{transcript}</pre>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Extract transcripts from YouTube videos</li>
            <li>Support for multiple languages</li>
            <li>Choose between plain text or SRT format</li>
            <li>Download transcript as a file</li>
            <li>Copy transcript to clipboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default YouTubeToText;