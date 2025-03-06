// components/RandomTriviaQuestionGenerator.js
'use client';

import React, { useState } from 'react';

const RandomTriviaQuestionGenerator = () => {
  const [trivia, setTrivia] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const categories = {
    Science: [
      {
        question: "What gas makes up most of the Earth's atmosphere?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"],
        answer: "Nitrogen"
      },
      {
        question: "What is the largest organ in the human body?",
        options: ["Liver", "Brain", "Skin", "Heart"],
        answer: "Skin"
      }
    ],
    History: [
      {
        question: "Who was the first President of the United States?",
        options: ["Abraham Lincoln", "George Washington", "Thomas Jefferson", "John Adams"],
        answer: "George Washington"
      },
      {
        question: "In which year did World War II end?",
        options: ["1945", "1939", "1941", "1950"],
        answer: "1945"
      }
    ],
    Geography: [
      {
        question: "What is the largest desert in the world?",
        options: ["Sahara", "Gobi", "Antarctic", "Kalahari"],
        answer: "Antarctic"
      },
      {
        question: "Which country has the most islands?",
        options: ["Indonesia", "Sweden", "Japan", "Philippines"],
        answer: "Sweden"
      }
    ],
    PopCulture: [
      {
        question: "Who played Iron Man in the Marvel Cinematic Universe?",
        options: ["Chris Evans", "Robert Downey Jr.", "Chris Hemsworth", "Mark Ruffalo"],
        answer: "Robert Downey Jr."
      },
      {
        question: "What is the name of the fictional continent in Game of Thrones?",
        options: ["Westeros", "Middle-earth", "Narnia", "Panem"],
        answer: "Westeros"
      }
    ]
  };

  const generateTrivia = () => {
    setShowAnswer(false);
    const categoryKeys = Object.keys(categories);
    const randomCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    const questions = categories[randomCategory];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    setTrivia({
      category: randomCategory,
      question: randomQuestion.question,
      options: randomQuestion.options,
      answer: randomQuestion.answer
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Trivia Question Generator</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generateTrivia}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
        >
          Generate New Question
        </button>
      </div>

      {trivia && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-3 text-purple-600">
            Category: {trivia.category}
          </h2>
          <p className="text-gray-700 mb-4">{trivia.question}</p>
          <div className="grid grid-cols-1 gap-2 mb-4">
            {trivia.options.map((option, index) => (
              <div
                key={index}
                className="p-2 bg-white border rounded-md hover:bg-gray-100"
              >
                {option}
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </button>
          {showAnswer && (
            <p className="mt-3 text-center text-green-600 font-medium">
              Answer: {trivia.answer}
            </p>
          )}
        </div>
      )}

      {!trivia && (
        <p className="text-center text-gray-500">
          Click the button to generate a random trivia question!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Test your knowledge with randomly generated trivia questions!
      </p>
    </div>
  );
};

export default RandomTriviaQuestionGenerator;