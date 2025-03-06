// components/RandomWorkoutGenerator.js
'use client';

import React, { useState } from 'react';

const RandomWorkoutGenerator = () => {
  const [workout, setWorkout] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');

  const exercises = {
    upperBody: [
      'Push-ups', 'Pull-ups', 'Bench Press', 'Shoulder Press', 
      'Bicep Curls', 'Tricep Dips', 'Dumbbell Rows'
    ],
    lowerBody: [
      'Squats', 'Lunges', 'Deadlifts', 'Calf Raises', 
      'Leg Press', 'Step-ups'
    ],
    core: [
      'Plank', 'Crunches', 'Russian Twists', 'Leg Raises', 
      'Bicycle Crunches', 'Mountain Climbers'
    ],
    cardio: [
      'Jumping Jacks', 'Burpees', 'High Knees', 'Running in Place', 
      'Jump Rope', 'Box Jumps'
    ]
  };

  const difficultySettings = {
    easy: { exercises: 3, sets: 2, reps: '8-12', rest: '60s' },
    medium: { exercises: 4, sets: 3, reps: '10-15', rest: '45s' },
    hard: { exercises: 5, sets: 4, reps: '12-20', rest: '30s' }
  };

  const generateWorkout = () => {
    const settings = difficultySettings[difficulty];
    const workoutPlan = [];
    
    // Get random exercises from each category
    const allExercises = [
      ...exercises.upperBody,
      ...exercises.lowerBody,
      ...exercises.core,
      ...exercises.cardio
    ];
    
    // Shuffle array and pick required number of exercises
    const shuffled = allExercises.sort(() => 0.5 - Math.random());
    const selectedExercises = shuffled.slice(0, settings.exercises);

    selectedExercises.forEach(exercise => {
      workoutPlan.push({
        name: exercise,
        sets: settings.sets,
        reps: settings.reps,
        rest: settings.rest
      });
    });

    setWorkout({
      difficulty,
      exercises: workoutPlan,
      duration: `${settings.exercises * 5} - ${settings.exercises * 10} mins`
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Workout Generator</h1>

      {/* Difficulty Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
          Select Difficulty
        </label>
        <div className="flex justify-center gap-4">
          {Object.keys(difficultySettings).map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`px-4 py-2 rounded-md capitalize ${
                difficulty === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } transition-colors duration-200`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={generateWorkout}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          Generate Workout
        </button>
      </div>

      {/* Workout Display */}
      {workout && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-3 text-center text-green-600">
            Your {workout.difficulty} Workout
          </h2>
          <div className="space-y-3">
            {workout.exercises.map((exercise, index) => (
              <div key={index} className="border-b pb-2">
                <p className="font-medium">{exercise.name}</p>
                <p className="text-sm text-gray-600">
                  {exercise.sets} sets of {exercise.reps} reps
                </p>
                <p className="text-sm text-gray-600">
                  Rest: {exercise.rest}
                </p>
              </div>
            ))}
            <p className="text-sm text-gray-700 mt-2">
              Estimated Duration: {workout.duration}
            </p>
          </div>
        </div>
      )}

      {!workout && (
        <p className="text-center text-gray-500">
          Select a difficulty and click "Generate Workout" to get started!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: Consult a fitness professional before starting any new workout routine.
      </p>
    </div>
  );
};

export default RandomWorkoutGenerator;