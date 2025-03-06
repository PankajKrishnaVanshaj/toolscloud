// components/RandomJokeGenerator.js
'use client';

import React, { useState, useEffect } from 'react';

const RandomJokeGenerator = () => {
  const [joke, setJoke] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchJoke = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://official-joke-api.appspot.com/random_joke');
      if (!response.ok) throw new Error('Failed to fetch joke');
      const data = await response.json();
      setJoke({
        setup: data.setup,
        punchline: data.punchline,
      });
    } catch (err) {
      setError('Oops! Couldn’t fetch a joke. Try again!');
    } finally {
      setLoading(false);
    }
  };

  // Fetch a joke on initial load
  useEffect(() => {
    fetchJoke();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Joke Generator</h1>

      <div className="flex justify-center mb-6">
        <button
          onClick={fetchJoke}
          disabled={loading}
          className={`px-6 py-2 bg-green-600 text-white rounded-md transition-colors duration-200 ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
          }`}
        >
          {loading ? 'Loading...' : 'Get New Joke'}
        </button>
      </div>

      {joke && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <p className="text-lg text-gray-800 mb-3">{joke.setup}</p>
          <p className="text-xl font-semibold text-green-600">{joke.punchline}</p>
        </div>
      )}

      {!joke && !error && !loading && (
        <p className="text-center text-gray-500">
          Waiting for your first laugh...
        </p>
      )}

      {error && (
        <p className="text-center text-red-600">{error}</p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Jokes provided by the Official Joke API
      </p>
    </div>
  );
};

export default RandomJokeGenerator;