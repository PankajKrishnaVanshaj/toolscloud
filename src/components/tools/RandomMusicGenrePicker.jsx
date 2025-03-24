"use client";
import React, { useState, useCallback } from "react";
import { FaDice, FaRedo, FaMusic } from "react-icons/fa";

const RandomMusicGenrePicker = () => {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [filterMood, setFilterMood] = useState("");

  const genres = [
    {
      name: "Jazz",
      description: "A genre characterized by improvisation, syncopation, and complex harmonies.",
      origin: "Late 19th century, New Orleans, USA",
      mood: "Smooth, soulful, expressive",
      color: "bg-blue-100",
    },
    {
      name: "Rock",
      description: "A genre featuring electric guitars, strong beats, and rebellious energy.",
      origin: "1950s, United States",
      mood: "Energetic, bold, raw",
      color: "bg-red-100",
    },
    {
      name: "Classical",
      description: "Art music with structured compositions, often orchestral.",
      origin: "Medieval era, Europe",
      mood: "Elegant, sophisticated, timeless",
      color: "bg-yellow-100",
    },
    {
      name: "Hip Hop",
      description: "A cultural movement with rapping, DJing, and breakdancing.",
      origin: "1970s, Bronx, New York",
      mood: "Rhythmic, urban, dynamic",
      color: "bg-green-100",
    },
    {
      name: "Electronic",
      description: "Music created using electronic instruments and technology.",
      origin: "20th century, various",
      mood: "Futuristic, pulsating, immersive",
      color: "bg-purple-100",
    },
    {
      name: "Country",
      description: "Storytelling music with roots in folk and western traditions.",
      origin: "1920s, Southern USA",
      mood: "Heartfelt, rustic, nostalgic",
      color: "bg-orange-100",
    },
    {
      name: "Reggae",
      description: "A genre with offbeat rhythms and social commentary.",
      origin: "1960s, Jamaica",
      mood: "Relaxed, uplifting, soulful",
      color: "bg-teal-100",
    },
    {
      name: "Pop",
      description: "Catchy, mainstream music designed for wide appeal.",
      origin: "Mid-20th century, various",
      mood: "Upbeat, accessible, fun",
      color: "bg-pink-100",
    },
    {
      name: "Blues",
      description: "Soulful music expressing hardship and emotion.",
      origin: "Late 19th century, Southern USA",
      mood: "Melancholic, deep, gritty",
      color: "bg-indigo-100",
    },
    {
      name: "Metal",
      description: "Heavy, aggressive music with distorted guitars.",
      origin: "Late 1960s, UK and USA",
      mood: "Intense, powerful, dark",
      color: "bg-gray-200",
    },
  ];

  // Pick a random genre with optional mood filter
  const pickRandomGenre = useCallback(() => {
    let filteredGenres = genres;
    if (filterMood) {
      filteredGenres = genres.filter((genre) =>
        genre.mood.toLowerCase().includes(filterMood.toLowerCase())
      );
    }
    if (filteredGenres.length === 0) return;

    const randomIndex = Math.floor(Math.random() * filteredGenres.length);
    const newGenre = filteredGenres[randomIndex];
    setSelectedGenre(newGenre);
    setHistory((prev) => [newGenre, ...prev.slice(0, 4)]); // Keep last 5 in history
  }, [filterMood, genres]);

  // Add to favorites
  const toggleFavorite = () => {
    if (!selectedGenre) return;
    setFavorites((prev) =>
      prev.some((fav) => fav.name === selectedGenre.name)
        ? prev.filter((fav) => fav.name !== selectedGenre.name)
        : [...prev, selectedGenre]
    );
  };

  // Reset everything
  const reset = () => {
    setSelectedGenre(null);
    setHistory([]);
    setFilterMood("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Music Genre Picker
        </h1>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={pickRandomGenre}
            className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            <FaDice className="mr-2" /> Pick Random Genre
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaRedo className="mr-2" /> Reset
          </button>
        </div>

        {/* Mood Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Mood
          </label>
          <input
            type="text"
            value={filterMood}
            onChange={(e) => setFilterMood(e.target.value)}
            placeholder="e.g., Energetic, Relaxed"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Selected Genre */}
        {selectedGenre && (
          <div className={`p-4 rounded-md ${selectedGenre.color} shadow-md`}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedGenre.name}
              </h2>
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-full ${
                  favorites.some((fav) => fav.name === selectedGenre.name)
                    ? "bg-yellow-400 text-white"
                    : "bg-gray-200 text-gray-600"
                } hover:bg-yellow-500 transition-colors`}
                title="Add to Favorites"
              >
                <FaMusic />
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium">Description:</span>{" "}
                {selectedGenre.description}
              </p>
              <p>
                <span className="font-medium">Origin:</span> {selectedGenre.origin}
              </p>
              <p>
                <span className="font-medium">Mood:</span> {selectedGenre.mood}
              </p>
            </div>
          </div>
        )}

        {!selectedGenre && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaMusic className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">
              Click "Pick Random Genre" to discover a music genre!
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Recent Picks</h3>
            <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
              {history.map((genre, index) => (
                <li
                  key={index}
                  className="cursor-pointer hover:text-purple-600"
                  onClick={() => setSelectedGenre(genre)}
                >
                  {genre.name} ({genre.mood})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Favorites */}
        {favorites.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-700 mb-2">Favorites</h3>
            <ul className="text-sm text-yellow-600 space-y-1 max-h-32 overflow-y-auto">
              {favorites.map((genre, index) => (
                <li
                  key={index}
                  className="cursor-pointer hover:text-yellow-800"
                  onClick={() => setSelectedGenre(genre)}
                >
                  {genre.name} ({genre.mood})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-purple-600 text-sm space-y-1">
            <li>Random genre selection from 10 diverse options</li>
            <li>Mood-based filtering</li>
            <li>History of recent picks</li>
            <li>Favorite genres list</li>
            <li>Color-coded genre cards</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RandomMusicGenrePicker;