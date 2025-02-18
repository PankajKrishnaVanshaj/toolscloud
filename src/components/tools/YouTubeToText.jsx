"use client";
import { useState } from "react";
import { MdSubtitles } from "react-icons/md";

const YouTubeToText = () => {
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  const fetchTranscript = async () => {
    const videoId = extractVideoId(url);

    if (!videoId) {
      setError("Invalid YouTube URL");
      return;
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`
      );
      const data = await response.json();

      if (data.items && data.items.length > 0 && data.items[0].snippet) {
        setTranscript(data.items[0].snippet.text); // Adjust according to response format
      } else {
        setError("No transcript available for this video");
      }
    } catch (err) {
      setError("Error fetching transcript: " + err.message);
    }
  };

  const extractVideoId = (url) => {
    const match = url.match(
      /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:[^\/\n\s]+\/\S+\/|\S*?v=|\S*?\/(?:\S*?v=))([a-zA-Z0-9_-]{11}))/
    );
    return match ? match[1] : null;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold flex items-center">
        <MdSubtitles className="mr-2" /> YouTube Transcript
      </h1>
      <div className="mt-4">
        <input
          type="text"
          placeholder="Enter YouTube Video URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={fetchTranscript}
          className="mt-2 p-2 bg-primary text-white rounded"
        >
          Get Transcript
        </button>
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {transcript && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Transcript:</h2>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default YouTubeToText;
