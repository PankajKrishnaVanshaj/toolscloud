// components/RandomMusicGenrePicker.js
'use client';

import React, { useState } from 'react';

const RandomMusicGenrePicker = () => {
  const [selectedGenre, setSelectedGenre] = useState(null);

  const genres = [
    {
      name: 'Jazz',
      description: 'A genre characterized by improvisation, syncopation, and complex harmonies.',
      origin: 'Late 19th century, New Orleans, USA',
      mood: 'Smooth, soulful, expressive'
    },
    {
      name: 'Rock',
      description: 'A genre featuring electric guitars, strong beats, and rebellious energy.',
      origin: '1950s, United States',
      mood: 'Energetic, bold, raw'
    },
    {
      name: 'Classical',
      description: 'Art music with structured compositions, often orchestral.',
      origin: 'Medieval era, Europe',
      mood: 'Elegant, sophisticated, timeless'
    },
    {
      name: 'Hip Hop',
      description: 'A cultural movement with rapping, DJing, and breakdancing.',
      origin: '1970s, Bronx, New York',
      mood: 'Rhythmic, urban, dynamic'
    },
    {
      name: 'Electronic',
      description: 'Music created using electronic instruments and technology.',
      origin: '20th century, various',
      mood: 'Futuristic, pulsating, immersive'
    },
    {
      name: 'Country',
      description: 'Storytelling music with roots in folk and western traditions.',
      origin: '1920s, Southern USA',
      mood: 'Heartfelt, rustic, nostalgic'
    },
    {
      name: 'Reggae',
      description: 'A genre with offbeat rhythms and social commentary.',
      origin: '1960s, Jamaica',
      mood: 'Relaxed, uplifting, soulful'
    },
    {
      name: 'Pop',
      description: 'Catchy, mainstream music designed for wide appeal.',
      origin: 'Mid-20th century, various',
      mood: 'Upbeat, accessible, fun'
    },
    {
      name: 'Blues',
      description: 'Soulful music expressing hardship and emotion.',
      origin: 'Late 19th century, Southern USA',
      mood: 'Melancholic, deep, gritty'
    },
    {
      name: 'Metal',
      description: 'Heavy, aggressive music with distorted guitars.',
      origin: 'Late 1960s, UK and USA',
      mood: 'Intense, powerful, dark'
    }
  ];

  const pickRandomGenre = () => {
    const randomIndex = Math.floor(Math.random() * genres.length);
    setSelectedGenre(genres[randomIndex]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Music Genre Picker</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={pickRandomGenre}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
        >
          Pick a Random Genre
        </button>
      </div>

      {selectedGenre && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-3 text-center text-purple-600">
            {selectedGenre.name}
          </h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Description:</span> {selectedGenre.description}
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
        <p className="text-center text-gray-500">
          Click the button to discover a random music genre!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Explore different music genres and find something new to listen to!
      </p>
    </div>
  );
};

export default RandomMusicGenrePicker;