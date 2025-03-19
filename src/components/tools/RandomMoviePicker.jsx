"use client";
import React, { useState, useCallback } from "react";
import { FaRandom, FaSync, FaFilm } from "react-icons/fa";

const RandomMoviePicker = () => {
  const [movie, setMovie] = useState(null);
  const [genreFilter, setGenreFilter] = useState("all");
  const [yearRange, setYearRange] = useState({ min: 1980, max: 2025 });
  const [history, setHistory] = useState([]);

  const movies = [
    {
      title: "The Shawshank Redemption",
      genre: "Drama",
      year: 1994,
      description: "Two imprisoned men bond over years, finding solace and redemption through acts of decency.",
      rating: 9.3,
    },
    {
      title: "Inception",
      genre: "Sci-Fi",
      year: 2010,
      description: "A thief with the ability to enter dreams must pull off the ultimate heist.",
      rating: 8.8,
    },
    {
      title: "The Dark Knight",
      genre: "Action",
      year: 2008,
      description: "Batman faces the Joker, a criminal mastermind wreaking havoc in Gotham.",
      rating: 9.0,
    },
    {
      title: "Pulp Fiction",
      genre: "Crime",
      year: 1994,
      description: "Interwoven stories of crime, violence, and redemption in Los Angeles.",
      rating: 8.9,
    },
    {
      title: "Forrest Gump",
      genre: "Romance",
      year: 1994,
      description: "A man with a low IQ experiences pivotal moments in history.",
      rating: 8.8,
    },
    {
      title: "The Matrix",
      genre: "Sci-Fi",
      year: 1999,
      description: "A hacker discovers reality is a simulation and joins a rebellion.",
      rating: 8.7,
    },
    {
      title: "Titanic",
      genre: "Romance",
      year: 1997,
      description: "A love story unfolds aboard the ill-fated RMS Titanic.",
      rating: 7.8,
    },
    {
      title: "Jurassic Park",
      genre: "Adventure",
      year: 1993,
      description: "A theme park with cloned dinosaurs goes terribly wrong.",
      rating: 8.1,
    },
    {
      title: "Back to the Future",
      genre: "Comedy",
      year: 1985,
      description: "A teen travels back in time and must ensure his parents fall in love.",
      rating: 8.5,
    },
    {
      title: "The Lion King",
      genre: "Animation",
      year: 1994,
      description: "A young lion prince flees his kingdom only to return as king.",
      rating: 8.5,
    },
  ];

  // Unique genres for filter
  const genres = ["all", ...new Set(movies.map((m) => m.genre))];

  // Filter movies based on user preferences
  const getFilteredMovies = useCallback(() => {
    return movies.filter((m) => {
      const matchesGenre = genreFilter === "all" || m.genre === genreFilter;
      const matchesYear = m.year >= yearRange.min && m.year <= yearRange.max;
      return matchesGenre && matchesYear;
    });
  }, [genreFilter, yearRange]);

  // Pick a random movie
  const pickRandomMovie = useCallback(() => {
    const filteredMovies = getFilteredMovies();
    if (filteredMovies.length === 0) {
      setMovie(null);
      return;
    }
    const randomIndex = Math.floor(Math.random() * filteredMovies.length);
    const selectedMovie = filteredMovies[randomIndex];
    setMovie(selectedMovie);
    setHistory((prev) => [selectedMovie, ...prev].slice(0, 5)); // Keep last 5 picks
  }, [getFilteredMovies]);

  // Reset filters and history
  const reset = () => {
    setMovie(null);
    setGenreFilter("all");
    setYearRange({ min: 1980, max: 2025 });
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Movie Picker
        </h1>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500"
            >
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre === "all" ? "All Genres" : genre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Year ({yearRange.min})
            </label>
            <input
              type="number"
              min="1900"
              max={yearRange.max}
              value={yearRange.min}
              onChange={(e) =>
                setYearRange((prev) => ({
                  ...prev,
                  min: Math.max(1900, Math.min(prev.max, e.target.value)),
                }))
              }
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Year ({yearRange.max})
            </label>
            <input
              type="number"
              min={yearRange.min}
              max="2025"
              value={yearRange.max}
              onChange={(e) =>
                setYearRange((prev) => ({
                  ...prev,
                  max: Math.min(2025, Math.max(prev.min, e.target.value)),
                }))
              }
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={pickRandomMovie}
            className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            <FaRandom className="mr-2" /> Pick Random Movie
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Movie Display */}
        {movie ? (
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner text-center">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-purple-600">
              {movie.title}
            </h2>
            <p className="text-gray-700 mb-1">
              <span className="font-medium">Genre:</span> {movie.genre}
            </p>
            <p className="text-gray-700 mb-1">
              <span className="font-medium">Year:</span> {movie.year}
            </p>
            <p className="text-gray-700 mb-1">
              <span className="font-medium">Rating:</span> {movie.rating}/10
            </p>
            <p className="text-gray-600 italic">{movie.description}</p>
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaFilm className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">
              Set your preferences and pick a random movie!
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Recent Picks</h3>
            <ul className="text-sm text-blue-600 space-y-2 max-h-40 overflow-y-auto">
              {history.map((prevMovie, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center hover:bg-blue-100 p-1 rounded"
                >
                  <span>
                    {prevMovie.title} ({prevMovie.year})
                  </span>
                  <button
                    onClick={() => setMovie(prevMovie)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-purple-600 text-sm space-y-1">
            <li>Filter by genre and year range</li>
            <li>View movie ratings</li>
            <li>History of recent picks (up to 5)</li>
            <li>Quick reset option</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: Movie suggestions are from a curated list. Enjoy your movie night!
        </p>
      </div>
    </div>
  );
};

export default RandomMoviePicker;