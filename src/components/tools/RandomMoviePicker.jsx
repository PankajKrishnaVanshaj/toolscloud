// components/RandomMoviePicker.js
'use client';

import React, { useState } from 'react';

const RandomMoviePicker = () => {
  const [movie, setMovie] = useState(null);

  const movies = [
    {
      title: "The Shawshank Redemption",
      genre: "Drama",
      year: 1994,
      description: "Two imprisoned men bond over years, finding solace and redemption through acts of decency."
    },
    {
      title: "Inception",
      genre: "Sci-Fi/Thriller",
      year: 2010,
      description: "A thief with the ability to enter dreams must pull off the ultimate heist."
    },
    {
      title: "The Dark Knight",
      genre: "Action/Thriller",
      year: 2008,
      description: "Batman faces the Joker, a criminal mastermind wreaking havoc in Gotham."
    },
    {
      title: "Pulp Fiction",
      genre: "Crime/Drama",
      year: 1994,
      description: "Interwoven stories of crime, violence, and redemption in Los Angeles."
    },
    {
      title: "Forrest Gump",
      genre: "Drama/Romance",
      year: 1994,
      description: "A man with a low IQ experiences pivotal moments in history."
    },
    {
      title: "The Matrix",
      genre: "Sci-Fi/Action",
      year: 1999,
      description: "A hacker discovers reality is a simulation and joins a rebellion."
    },
    {
      title: "Titanic",
      genre: "Romance/Drama",
      year: 1997,
      description: "A love story unfolds aboard the ill-fated RMS Titanic."
    },
    {
      title: "Jurassic Park",
      genre: "Sci-Fi/Adventure",
      year: 1993,
      description: "A theme park with cloned dinosaurs goes terribly wrong."
    },
    {
      title: "Back to the Future",
      genre: "Sci-Fi/Comedy",
      year: 1985,
      description: "A teen travels back in time and must ensure his parents fall in love."
    },
    {
      title: "The Lion King",
      genre: "Animation/Drama",
      year: 1994,
      description: "A young lion prince flees his kingdom only to return as king."
    }
  ];

  const pickRandomMovie = () => {
    const randomIndex = Math.floor(Math.random() * movies.length);
    setMovie(movies[randomIndex]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Movie Picker</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={pickRandomMovie}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
        >
          Pick a Random Movie
        </button>
      </div>

      {movie && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <h2 className="text-xl font-semibold mb-2 text-purple-600">
            {movie.title}
          </h2>
          <p className="text-gray-700 mb-1">
            <span className="font-medium">Genre:</span> {movie.genre}
          </p>
          <p className="text-gray-700 mb-1">
            <span className="font-medium">Year:</span> {movie.year}
          </p>
          <p className="text-gray-600 italic">
            {movie.description}
          </p>
        </div>
      )}

      {!movie && (
        <p className="text-center text-gray-500">
          Click the button to pick a random movie suggestion!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: Movie suggestions are from a curated list. Enjoy your movie night!
      </p>
    </div>
  );
};

export default RandomMoviePicker;