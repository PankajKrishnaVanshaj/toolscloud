"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { FaCopy, FaDownload, FaSearch, FaFilter, FaStar, FaExpand } from 'react-icons/fa';

const GitCommandHelper = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [copiedCommand, setCopiedCommand] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [expandedCommand, setExpandedCommand] = useState(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const gitCommands = [
    { category: 'Basics', command: 'git init', description: 'Initialize a new Git repository', example: 'git init', options: '--bare' },
    { category: 'Basics', command: 'git clone', description: 'Clone a repository into a new directory', example: 'git clone https://github.com/user/repo.git', options: '--depth 1' },
    { category: 'Staging & Committing', command: 'git add', description: 'Add file contents to the index', example: 'git add file.txt', options: '-A' },
    { category: 'Staging & Committing', command: 'git commit', description: 'Record changes to the repository', example: 'git commit -m "Add new feature"', options: '--amend' },
    { category: 'Branching', command: 'git branch', description: 'List, create, or delete branches', example: 'git branch feature-branch', options: '-d' },
    { category: 'Branching', command: 'git checkout', description: 'Switch branches or restore working tree files', example: 'git checkout feature-branch', options: '-b' },
    { category: 'Merging & Rebasing', command: 'git merge', description: 'Join two or more development histories together', example: 'git merge feature-branch', options: '--no-ff' },
    { category: 'Merging & Rebasing', command: 'git rebase', description: 'Reapply commits on top of another base tip', example: 'git rebase main', options: '-i' },
    { category: 'Remote', command: 'git push', description: 'Update remote refs along with associated objects', example: 'git push origin main', options: '--force' },
    { category: 'Remote', command: 'git pull', description: 'Fetch from and integrate with another repository or branch', example: 'git pull origin main', options: '--rebase' },
    { category: 'Inspection', command: 'git log', description: 'Show commit logs', example: 'git log --oneline', options: '--graph' },
    { category: 'Inspection', command: 'git status', description: 'Show the working tree status', example: 'git status', options: '-s' },
    { category: 'Advanced', command: 'git stash', description: 'Stash changes in a dirty working directory', example: 'git stash push', options: '--include-untracked' },
    { category: 'Advanced', command: 'git cherry-pick', description: 'Apply changes from specific commits', example: 'git cherry-pick abc123', options: '--edit' },
  ];

  const categories = useMemo(() => ['all', ...new Set(gitCommands.map(cmd => cmd.category))], []);

  const filteredCommands = useMemo(() => {
    return gitCommands.filter(cmd => {
      const matchesSearch = cmd.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cmd.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === 'all' || cmd.category === category;
      const matchesFavorites = !showFavoritesOnly || favorites.includes(cmd.command);
      return matchesSearch && matchesCategory && matchesFavorites;
    });
  }, [searchTerm, category, showFavoritesOnly, favorites]);

  const handleCopy = useCallback((command) => {
    navigator.clipboard.writeText(command);
    setCopiedCommand(command);
    setTimeout(() => setCopiedCommand(null), 2000);
  }, []);

  const toggleFavorite = useCallback((command) => {
    setFavorites(prev => 
      prev.includes(command) ? prev.filter(c => c !== command) : [...prev, command]
    );
  }, []);

  const handleDownload = () => {
    const content = filteredCommands.map(cmd => 
      `${cmd.command}\n${cmd.description}\nExample: ${cmd.example}\nOptions: ${cmd.options || 'None'}\n---`
    ).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'git-commands.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Git Command Helper</h2>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search commands..."
            />
          </div>
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={(e) => setShowFavoritesOnly(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-600">Show Favorites Only</span>
          </label>
        </div>

        {/* Command List */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg transition-all">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleFavorite(cmd.command)}
                      className={`text-xl ${favorites.includes(cmd.command) ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600`}
                    >
                      <FaStar />
                    </button>
                    <h3 className="font-semibold text-gray-700">{cmd.command}</h3>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCopy(cmd.example)}
                      className={`px-3 py-1 text-sm rounded transition-colors flex items-center ${
                        copiedCommand === cmd.example ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <FaCopy className="mr-1" />
                      {copiedCommand === cmd.example ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={() => setExpandedCommand(expandedCommand === cmd.command ? null : cmd.command)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <FaExpand />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{cmd.description}</p>
                <p className="text-sm font-mono text-gray-800 mt-1">
                  Example: <code>{cmd.example}</code>
                </p>
                {expandedCommand === cmd.command && (
                  <div className="mt-2 p-2 bg-gray-100 rounded">
                    <p className="text-sm text-gray-700">
                      Options: <code>{cmd.options || 'None'}</code>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Category: {cmd.category}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600 text-center py-4">No commands match your criteria.</p>
          )}
        </div>

        {/* Controls */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FaDownload className="mr-2" /> Download List
          </button>
        </div>

        {/* Tips and Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Tips</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Search by command or description</li>
            <li>Filter by category or favorites</li>
            <li>Mark commands as favorites with the star</li>
            <li>Expand commands for more details</li>
            <li>Copy examples to clipboard</li>
            <li>Download filtered command list</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GitCommandHelper;