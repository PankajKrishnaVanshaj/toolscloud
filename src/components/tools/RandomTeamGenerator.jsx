// components/RandomTeamGenerator.js
'use client';

import React, { useState } from 'react';

const RandomTeamGenerator = () => {
  const [names, setNames] = useState('');
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState('');

  const generateTeams = () => {
    // Clear previous error
    setError('');
    
    // Parse names into array and filter out empty lines
    const nameList = names.split('\n').map(name => name.trim()).filter(name => name);
    
    if (nameList.length < 2) {
      setError('Please enter at least 2 names.');
      setTeams([]);
      return;
    }
    
    if (teamCount < 1 || teamCount > nameList.length) {
      setError(`Number of teams must be between 1 and ${nameList.length}.`);
      setTeams([]);
      return;
    }

    // Shuffle array
    const shuffledNames = [...nameList].sort(() => Math.random() - 0.5);
    
    // Calculate team sizes
    const baseSize = Math.floor(shuffledNames.length / teamCount);
    const extraMembers = shuffledNames.length % teamCount;
    
    // Generate teams
    const newTeams = [];
    let nameIndex = 0;
    
    for (let i = 0; i < teamCount; i++) {
      const teamSize = baseSize + (i < extraMembers ? 1 : 0);
      const teamMembers = shuffledNames.slice(nameIndex, nameIndex + teamSize);
      newTeams.push(teamMembers);
      nameIndex += teamSize;
    }
    
    setTeams(newTeams);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Team Generator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter Names (one per line)
            </label>
            <textarea
              value={names}
              onChange={(e) => setNames(e.target.value)}
              placeholder="John Doe&#10;Jane Smith&#10;Bob Johnson"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 min-h-[150px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Teams
            </label>
            <input
              type="number"
              value={teamCount}
              onChange={(e) => setTeamCount(Math.max(1, Number(e.target.value)))}
              min="1"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={generateTeams}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Teams
          </button>
        </div>

        {/* Results Section */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Teams</h2>
          {error && (
            <p className="text-sm text-red-600 mb-2">{error}</p>
          )}
          {teams.length > 0 ? (
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {teams.map((team, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md">
                  <h3 className="font-medium text-blue-600">
                    Team {index + 1} ({team.length} members)
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {team.map((member, memberIndex) => (
                      <li key={memberIndex} className="text-sm text-gray-700">
                        {member}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No teams generated yet. Enter names and click "Generate Teams"!
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: Teams are generated randomly and distributed as evenly as possible.
      </p>
    </div>
  );
};

export default RandomTeamGenerator;