"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload, FaDumbbell } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading workout plan

const RandomWorkoutGenerator = () => {
  const [workout, setWorkout] = useState(null);
  const [difficulty, setDifficulty] = useState("medium");
  const [muscleFocus, setMuscleFocus] = useState("balanced");
  const [equipment, setEquipment] = useState("none");
  const workoutRef = React.useRef(null);

  const exercises = {
    upperBody: {
      none: ["Push-ups", "Tricep Dips", "Plank Shoulder Taps"],
      basic: [
        "Pull-ups",
        "Bench Press",
        "Shoulder Press",
        "Bicep Curls",
        "Dumbbell Rows",
      ],
    },
    lowerBody: {
      none: ["Squats", "Lunges", "Calf Raises"],
      basic: ["Deadlifts", "Leg Press", "Step-ups"],
    },
    core: {
      none: ["Plank", "Crunches", "Russian Twists", "Leg Raises", "Bicycle Crunches"],
      basic: ["Mountain Climbers", "Hanging Leg Raises"],
    },
    cardio: {
      none: ["Jumping Jacks", "High Knees", "Running in Place"],
      basic: ["Burpees", "Jump Rope", "Box Jumps"],
    },
  };

  const difficultySettings = {
    easy: { exercises: 3, sets: 2, reps: "8-12", rest: "60s", warmup: "3 min" },
    medium: { exercises: 4, sets: 3, reps: "10-15", rest: "45s", warmup: "5 min" },
    hard: { exercises: 5, sets: 4, reps: "12-20", rest: "30s", warmup: "7 min" },
  };

  const muscleFocusWeights = {
    balanced: { upperBody: 0.25, lowerBody: 0.25, core: 0.25, cardio: 0.25 },
    upper: { upperBody: 0.6, lowerBody: 0.1, core: 0.2, cardio: 0.1 },
    lower: { upperBody: 0.1, lowerBody: 0.6, core: 0.2, cardio: 0.1 },
    core: { upperBody: 0.2, lowerBody: 0.2, core: 0.5, cardio: 0.1 },
    cardio: { upperBody: 0.1, lowerBody: 0.1, core: 0.1, cardio: 0.7 },
  };

  const generateWorkout = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const weights = muscleFocusWeights[muscleFocus];
    const workoutPlan = [];

    // Filter exercises based on equipment
    const availableExercises = {};
    Object.keys(exercises).forEach((category) => {
      availableExercises[category] =
        equipment === "none"
          ? exercises[category].none
          : [...exercises[category].none, ...exercises[category].basic];
    });

    // Calculate number of exercises per category
    const totalExercises = settings.exercises;
    const exerciseDistribution = {
      upperBody: Math.round(totalExercises * weights.upperBody),
      lowerBody: Math.round(totalExercises * weights.lowerBody),
      core: Math.round(totalExercises * weights.core),
      cardio: Math.round(totalExercises * weights.cardio),
    };

    // Adjust to ensure total matches settings.exercises
    let sum = Object.values(exerciseDistribution).reduce((a, b) => a + b, 0);
    while (sum !== totalExercises) {
      const diff = totalExercises - sum;
      const key = Object.keys(exerciseDistribution)[Math.floor(Math.random() * 4)];
      exerciseDistribution[key] += diff > 0 ? 1 : -1;
      sum = Object.values(exerciseDistribution).reduce((a, b) => a + b, 0);
    }

    // Generate workout plan
    Object.keys(exerciseDistribution).forEach((category) => {
      const count = exerciseDistribution[category];
      const shuffled = availableExercises[category].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, count);
      selected.forEach((exercise) => {
        workoutPlan.push({
          name: exercise,
          category,
          sets: settings.sets,
          reps: settings.reps,
          rest: settings.rest,
        });
      });
    });

    setWorkout({
      difficulty,
      muscleFocus,
      equipment,
      warmup: settings.warmup,
      exercises: workoutPlan.sort(() => 0.5 - Math.random()), // Randomize order
      duration: `${settings.exercises * 5} - ${settings.exercises * 10} mins`,
    });
  }, [difficulty, muscleFocus, equipment]);

  const downloadWorkout = () => {
    if (workoutRef.current) {
      html2canvas(workoutRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `workout-plan-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  const reset = () => {
    setWorkout(null);
    setDifficulty("medium");
    setMuscleFocus("balanced");
    setEquipment("none");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Workout Generator
        </h1>

        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(difficultySettings).map((level) => (
                <option key={level} value={level} className="capitalize">
                  {level}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Muscle Focus</label>
            <select
              value={muscleFocus}
              onChange={(e) => setMuscleFocus(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="balanced">Balanced</option>
              <option value="upper">Upper Body</option>
              <option value="lower">Lower Body</option>
              <option value="core">Core</option>
              <option value="cardio">Cardio</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">None (Bodyweight)</option>
              <option value="basic">Basic (Weights/Gym)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={generateWorkout}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <FaDumbbell className="mr-2" /> Generate Workout
          </button>
          <button
            onClick={downloadWorkout}
            disabled={!workout}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download Plan
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Workout Display */}
        {workout && (
          <div ref={workoutRef} className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 text-center text-green-600">
              Your {workout.difficulty} {workout.muscleFocus} Workout (
              {workout.equipment === "none" ? "Bodyweight" : "Equipment"})
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                <strong>Warm-up:</strong> {workout.warmup} light cardio
              </p>
              {workout.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="border-b pb-2 flex justify-between items-start"
                >
                  <div>
                    <p className="font-medium text-gray-800">{exercise.name}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {exercise.category.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {exercise.sets} sets of {exercise.reps} reps
                    </p>
                    <p className="text-sm text-gray-600">Rest: {exercise.rest}</p>
                  </div>
                </div>
              ))}
              <p className="text-sm text-gray-700 mt-2">
                <strong>Estimated Duration:</strong> {workout.duration}
              </p>
            </div>
          </div>
        )}

        {!workout && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaDumbbell className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">
              Customize your workout and click "Generate Workout" to begin!
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable difficulty: Easy, Medium, Hard</li>
            <li>Muscle focus options: Balanced, Upper, Lower, Core, Cardio</li>
            <li>Equipment choice: Bodyweight or Basic Gym</li>
            <li>Warm-up recommendations</li>
            <li>Download workout plan as PNG</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: Consult a fitness professional before starting any new workout routine.
        </p>
      </div>
    </div>
  );
};

export default RandomWorkoutGenerator;