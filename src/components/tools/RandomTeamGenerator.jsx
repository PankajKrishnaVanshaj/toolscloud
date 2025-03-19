"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload, FaRandom } from "react-icons/fa";

const RandomTeamGenerator = () => {
  const [names, setNames] = useState("");
  const [teamCount, setTeamCount] = useState(2);
  const [teamSize, setTeamSize] = useState("");
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("teamCount"); // "teamCount" or "teamSize"
  const [history, setHistory] = useState([]);
  const teamsRef = React.useRef(null);

  // Generate teams
  const generateTeams = useCallback(() => {
    setError("");
    const nameList = names.split("\n").map((name) => name.trim()).filter((name) => name);

    if (nameList.length < 2) {
      setError("Please enter at least 2 names.");
      setTeams([]);
      return;
    }

    let numTeams = mode === "teamCount" ? teamCount : Math.ceil(nameList.length / teamSize);
    let sizePerTeam = mode === "teamSize" ? teamSize : Math.floor(nameList.length / teamCount);

    if (mode === "teamCount" && (teamCount < 1 || teamCount > nameList.length)) {
      setError(`Number of teams must be between 1 and ${nameList.length}.`);
      setTeams([]);
      return;
    }
    if (mode === "teamSize" && (teamSize < 1 || teamSize > nameList.length)) {
      setError(`Team size must be between 1 and ${nameList.length}.`);
      setTeams([]);
      return;
    }

    // Shuffle names
    const shuffledNames = [...nameList].sort(() => Math.random() - 0.5);
    const newTeams = [];
    let nameIndex = 0;

    if (mode === "teamCount") {
      const baseSize = Math.floor(shuffledNames.length / teamCount);
      const extraMembers = shuffledNames.length % teamCount;

      for (let i = 0; i < teamCount; i++) {
        const teamSize = baseSize + (i < extraMembers ? 1 : 0);
        const teamMembers = shuffledNames.slice(nameIndex, nameIndex + teamSize);
        newTeams.push(teamMembers);
        nameIndex += teamSize;
      }
    } else {
      for (let i = 0; nameIndex < shuffledNames.length; i++) {
        const teamMembers = shuffledNames.slice(nameIndex, nameIndex + teamSize);
        if (teamMembers.length > 0) newTeams.push(teamMembers);
        nameIndex += teamSize;
      }
    }

    setTeams(newTeams);
    setHistory((prev) => [...prev.slice(-9), newTeams]); // Keep last 10 generations
  }, [names, teamCount, teamSize, mode]);

  // Reset form
  const reset = () => {
    setNames("");
    setTeamCount(2);
    setTeamSize("");
    setTeams([]);
    setError("");
    setMode("teamCount");
    setHistory([]);
  };

  // Download teams as text file
  const downloadTeams = () => {
    if (teams.length === 0) return;
    const textContent = teams
      .map((team, index) => `Team ${index + 1}:\n${team.join("\n")}`)
      .join("\n\n");
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `teams-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Team Generator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter Names (one per line)
              </label>
              <textarea
                value={names}
                onChange={(e) => setNames(e.target.value)}
                placeholder="John Doe&#10;Jane Smith&#10;Bob Johnson"
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 min-h-[200px] resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="teamCount">Number of Teams</option>
                  <option value="teamSize">Team Size</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {mode === "teamCount" ? "Number of Teams" : "Team Size"}
                </label>
                <input
                  type="number"
                  value={mode === "teamCount" ? teamCount : teamSize}
                  onChange={(e) =>
                    mode === "teamCount"
                      ? setTeamCount(Math.max(1, Number(e.target.value)))
                      : setTeamSize(Math.max(1, Number(e.target.value)))
                  }
                  min="1"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={generateTeams}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaRandom className="mr-2" /> Generate Teams
              </button>
              <button
                onClick={downloadTeams}
                disabled={teams.length === 0}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Teams</h2>
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            {teams.length > 0 ? (
              <div
                ref={teamsRef}
                className="space-y-4 max-h-[400px] overflow-y-auto p-2 bg-gray-50 rounded-lg"
              >
                {teams.map((team, index) => (
                  <div key={index} className="bg-white p-3 rounded-md shadow-sm">
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
              <p className="text-sm text-gray-500 italic">
                No teams generated yet. Enter names and click "Generate Teams"!
              </p>
            )}
          </div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Generation History</h3>
            <div className="max-h-40 overflow-y-auto">
              {history.slice().reverse().map((pastTeams, idx) => (
                <div key={idx} className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">
                    Generation {history.length - idx} ({pastTeams.length} teams):
                  </span>{" "}
                  {pastTeams.flat().length} members
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Generate teams by number or size</li>
            <li>Randomized and even distribution</li>
            <li>Download teams as text file</li>
            <li>History of previous generations</li>
            <li>Easy reset functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RandomTeamGenerator;