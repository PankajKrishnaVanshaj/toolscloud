"use client";
import React, { useState, useCallback } from "react";
import { FaRandom, FaSync, FaFilm, FaPlus, FaSort } from "react-icons/fa";

const RandomMoviePicker = () => {
  const [movie, setMovie] = useState(null);
  const [filters, setFilters] = useState({
    genre: "all",
    minYear: "",
    maxYear: "",
    minRating: "",
    industry: "all",
  });
  const [sortBy, setSortBy] = useState("random");
  const [history, setHistory] = useState([]);
  const [movies, setMovies] = useState([]);
  const [newMovie, setNewMovie] = useState({
    title: "",
    genre: "",
    year: "",
    rating: "",
    industry: "",
    description: "",
  });

  // Unique filter options
  const genres = ["all", ...new Set(movies.map((m) => m.genre || "Unknown").filter(Boolean))];
  const industries = ["all", ...new Set(movies.map((m) => m.industry || "Unknown").filter(Boolean))];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMovie((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Add new movie
  const addMovie = (e) => {
    e.preventDefault();
    if (newMovie.title.trim()) {
      setMovies((prev) => [
        ...prev,
        {
          ...newMovie,
          year: newMovie.year ? parseInt(newMovie.year) : undefined,
          rating: newMovie.rating ? parseFloat(newMovie.rating) : undefined,
        },
      ]);
      setNewMovie({ title: "", genre: "", year: "", rating: "", industry: "", description: "" });
    }
  };

  // Filter and sort movies
  const getFilteredMovies = useCallback(() => {
    let filtered = movies.filter((m) => {
      const matchesGenre = filters.genre === "all" || (m.genre || "Unknown") === filters.genre;
      const matchesIndustry = filters.industry === "all" || (m.industry || "Unknown") === filters.industry;
      const matchesMinYear = !filters.minYear || (m.year && m.year >= parseInt(filters.minYear));
      const matchesMaxYear = !filters.maxYear || (m.year && m.year <= parseInt(filters.maxYear));
      const matchesRating = !filters.minRating || (m.rating && m.rating >= parseFloat(filters.minRating));
      
      return matchesGenre && matchesIndustry && matchesMinYear && matchesMaxYear && matchesRating;
    });

    // Apply sorting
    if (sortBy === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "year") {
      filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return filtered;
  }, [filters, sortBy, movies]);

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
    setHistory((prev) => [selectedMovie, ...prev].slice(0, 5));
  }, [getFilteredMovies]);

  // Reset all
  const reset = () => {
    setMovie(null);
    setFilters({ genre: "all", minYear: "", maxYear: "", minRating: "", industry: "all" });
    setSortBy("random");
    setHistory([]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Movie Picker
        </h1>

        {/* Movie Input Form */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Add a Movie</h3>
          <form onSubmit={addMovie} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" name="title" value={newMovie.title} onChange={handleInputChange} placeholder="Movie Title (required)" className="w-full p-2 border rounded-md" required />
            <input type="text" name="genre" value={newMovie.genre} onChange={handleInputChange} placeholder="Genre" className="w-full p-2 border rounded-md" />
            <input type="number" name="year" value={newMovie.year} onChange={handleInputChange} placeholder="Year" min="1900" max={new Date().getFullYear()} className="w-full p-2 border rounded-md" />
            <input type="number" name="rating" value={newMovie.rating} onChange={handleInputChange} placeholder="Rating (0-10)" min="0" max="10" step="0.1" className="w-full p-2 border rounded-md" />
            <input type="text" name="industry" value={newMovie.industry} onChange={handleInputChange} placeholder="Industry (e.g., Hollywood)" className="w-full p-2 border rounded-md" />
            <input type="text" name="description" value={newMovie.description} onChange={handleInputChange} placeholder="Description" className="w-full p-2 border rounded-md sm:col-span-2" />
            <button type="submit" className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 sm:col-span-2">
              <FaPlus className="mr-2 inline" /> Add Movie
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
            <select name="genre" value={filters.genre} onChange={handleFilterChange} className="w-full p-2 border rounded-md">
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre === "all" ? "All Genres" : genre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <select name="industry" value={filters.industry} onChange={handleFilterChange} className="w-full p-2 border rounded-md">
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry === "all" ? "All Industries" : industry}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Year</label>
            <input type="number" name="minYear" value={filters.minYear} onChange={handleFilterChange} placeholder="e.g., 1990" className="w-full p-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Year</label>
            <input type="number" name="maxYear" value={filters.maxYear} onChange={handleFilterChange} placeholder="e.g., 2025" className="w-full p-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
            <input type="number" name="minRating" value={filters.minRating} onChange={handleFilterChange} placeholder="0-10" min="0" max="10" step="0.1" className="w-full p-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full p-2 border rounded-md">
              <option value="random">Random</option>
              <option value="title">Title</option>
              <option value="year">Year (Newest First)</option>
              <option value="rating">Rating (Highest First)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button onClick={pickRandomMovie} className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700">
            <FaRandom className="mr-2 inline" /> Pick Movie
          </button>
          <button onClick={reset} className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700">
            <FaSync className="mr-2 inline" /> Reset
          </button>
        </div>

        {/* Movie Display */}
        {movie ? (
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner text-center">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-purple-600">{movie.title}</h2>
            {movie.genre && <p className="text-gray-700"><span className="font-medium">Genre:</span> {movie.genre}</p>}
            {movie.year && <p className="text-gray-700"><span className="font-medium">Year:</span> {movie.year}</p>}
            {movie.rating && <p className="text-gray-700"><span className="font-medium">Rating:</span> {movie.rating}/10</p>}
            {movie.industry && <p className="text-gray-700"><span className="font-medium">Industry:</span> {movie.industry}</p>}
            {movie.description && <p className="text-gray-600 italic mt-2">{movie.description}</p>}
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaFilm className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Add movies and set filters to find your perfect pick!</p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Recent Picks</h3>
            <ul className="text-sm text-blue-600 space-y-2 max-h-40 overflow-y-auto">
              {history.map((prevMovie, index) => (
                <li key={index} className="flex justify-between items-center hover:bg-blue-100 p-1 rounded">
                  <span>{prevMovie.title} {prevMovie.year ? `(${prevMovie.year})` : ""}</span>
                  <button onClick={() => setMovie(prevMovie)} className="text-blue-500 hover:text-blue-700">View</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-purple-600 text-sm space-y-1">
            <li>Add movies with detailed info</li>
            <li>Filter by genre, industry, year range, and minimum rating</li>
            <li>Sort by title, year, or rating</li>
            <li>History of recent picks</li>
            <li>Quick reset option</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Total movies: {movies.length} | Filtered: {getFilteredMovies().length}
        </p>
      </div>
    </div>
  );
};

export default RandomMoviePicker;