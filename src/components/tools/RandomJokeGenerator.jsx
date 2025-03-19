"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaLaugh, FaRedo, FaShareAlt, FaVolumeUp } from "react-icons/fa";

const RandomJokeGenerator = () => {
  const [joke, setJoke] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("random");
  const [history, setHistory] = useState([]);

  // Fetch joke based on category
  const fetchJoke = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const url =
        category === "random"
          ? "https://official-joke-api.appspot.com/random_joke"
          : `https://official-joke-api.appspot.com/jokes/${category}/random`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch joke");
      const data = category === "random" ? await response.json() : (await response.json())[0];
      const newJoke = {
        setup: data.setup,
        punchline: data.punchline,
        timestamp: new Date().toLocaleTimeString(),
      };
      setJoke(newJoke);
      setHistory((prev) => [newJoke, ...prev].slice(0, 10)); // Keep last 10 jokes
    } catch (err) {
      setError("Oops! Couldn’t fetch a joke. Try again!");
    } finally {
      setLoading(false);
    }
  }, [category]);

  // Fetch a joke on initial load
  useEffect(() => {
    fetchJoke();
  }, [fetchJoke]);

  // Share joke
  const shareJoke = () => {
    if (joke && navigator.share) {
      navigator.share({
        title: "Funny Joke",
        text: `${joke.setup}\n${joke.punchline}`,
        url: window.location.href,
      }).catch((err) => console.error("Share failed:", err));
    } else {
      alert("Sharing not supported on this device!");
    }
  };

  // Text-to-speech for joke
  const speakJoke = () => {
    if (joke && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(`${joke.setup} ... ${joke.punchline}`);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech not supported in this browser!");
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center flex items-center justify-center gap-2">
          <FaLaugh /> Random Joke Generator
        </h1>

        {/* Controls */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Joke Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 bg-white text-gray-800"
                disabled={loading}
              >
                <option value="random">Random</option>
                <option value="programming">Programming</option>
                <option value="general">General</option>
                <option value="knock-knock">Knock-Knock</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={fetchJoke}
                disabled={loading}
                className={`flex-1 py-2 px-4 bg-green-600 text-white rounded-md transition-colors flex items-center justify-center ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
                }`}
              >
                <FaRedo className="mr-2" /> {loading ? "Loading..." : "New Joke"}
              </button>
            </div>
          </div>

          {/* Joke Display */}
          {joke && (
            <div className="p-4 rounded-lg text-center bg-gray-50">
              <p className="text-lg text-gray-800 mb-3">{joke.setup}</p>
              <p className="text-xl font-semibold text-green-600">{joke.punchline}</p>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={shareJoke}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  title="Share Joke"
                >
                  <FaShareAlt />
                </button>
                <button
                  onClick={speakJoke}
                  className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
                  title="Listen to Joke"
                >
                  <FaVolumeUp />
                </button>
              </div>
            </div>
          )}

          {!joke && !error && !loading && (
            <p className="text-center text-gray-500">Waiting for your first laugh...</p>
          )}

          {error && <p className="text-center text-red-600">{error}</p>}

          {/* Joke History */}
          {history.length > 0 && (
            <div className="p-4 rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Joke History</h3>
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                {history.map((pastJoke, index) => (
                  <li key={index} className="p-2 rounded-md bg-white">
                    <p className="text-sm text-gray-800">{pastJoke.setup}</p>
                    <p className="text-sm font-medium text-green-500">{pastJoke.punchline}</p>
                    <p className="text-xs text-gray-400">{pastJoke.timestamp}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-xs mt-6 text-center text-gray-500">
          Jokes provided by the{" "}
          <a
            href="https://github.com/15Dkatz/official_joke_api"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-green-500"
          >
            Official Joke API
          </a>
        </p>

        {/* Features */}
        <div className="mt-6 p-4 rounded-lg border bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
            <li>Categories: Random, Programming, General, Knock-Knock</li>
            <li>Joke history (last 10 jokes)</li>
            <li>Share jokes via Web Share API</li>
            <li>Listen to jokes with text-to-speech</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RandomJokeGenerator;