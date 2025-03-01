"use client";

import React, { useState } from 'react';

const GitCommandHelper = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [copiedCommand, setCopiedCommand] = useState(null);

  const gitCommands = [
    {
      category: 'Basics',
      command: 'git init',
      description: 'Initialize a new Git repository',
      example: 'git init'
    },
    {
      category: 'Basics',
      command: 'git clone',
      description: 'Clone a repository into a new directory',
      example: 'git clone https://github.com/user/repo.git'
    },
    {
      category: 'Staging & Committing',
      command: 'git add',
      description: 'Add file contents to the index',
      example: 'git add file.txt'
    },
    {
      category: 'Staging & Committing',
      command: 'git commit',
      description: 'Record changes to the repository',
      example: 'git commit -m "Add new feature"'
    },
    {
      category: 'Branching',
      command: 'git branch',
      description: 'List, create, or delete branches',
      example: 'git branch feature-branch'
    },
    {
      category: 'Branching',
      command: 'git checkout',
      description: 'Switch branches or restore working tree files',
      example: 'git checkout feature-branch'
    },
    {
      category: 'Merging & Rebasing',
      command: 'git merge',
      description: 'Join two or more development histories together',
      example: 'git merge feature-branch'
    },
    {
      category: 'Merging & Rebasing',
      command: 'git rebase',
      description: 'Reapply commits on top of another base tip',
      example: 'git rebase main'
    },
    {
      category: 'Remote',
      command: 'git push',
      description: 'Update remote refs along with associated objects',
      example: 'git push origin main'
    },
    {
      category: 'Remote',
      command: 'git pull',
      description: 'Fetch from and integrate with another repository or branch',
      example: 'git pull origin main'
    },
    {
      category: 'Inspection',
      command: 'git log',
      description: 'Show commit logs',
      example: 'git log --oneline'
    },
    {
      category: 'Inspection',
      command: 'git status',
      description: 'Show the working tree status',
      example: 'git status'
    }
  ];

  const categories = ['all', ...new Set(gitCommands.map(cmd => cmd.category))];

  const filteredCommands = gitCommands.filter(cmd => {
    const matchesSearch = cmd.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cmd.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || cmd.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (command) => {
    navigator.clipboard.writeText(command);
    setCopiedCommand(command);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Git Command Helper</h2>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Commands
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., commit, branch"
            />
          </div>
          <div className="w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Command List */}
        <div className="space-y-4">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-700">{cmd.command}</h3>
                  <button
                    onClick={() => handleCopy(cmd.example)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      copiedCommand === cmd.example ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {copiedCommand === cmd.example ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-1">{cmd.description}</p>
                <p className="text-sm font-mono text-gray-800">
                  Example: <code>{cmd.example}</code>
                </p>
                <p className="text-xs text-gray-500 mt-1">Category: {cmd.category}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600 text-center">No commands match your search or category.</p>
          )}
        </div>

        {/* Notes */}
        <div className="mt-6 text-sm text-gray-600">
          <p>Use this tool to explore common Git commands, their usage, and examples.</p>
          <p className="mt-1">Tips:</p>
          <ul className="list-disc pl-5">
            <li>Search by command name or description</li>
            <li>Filter by category to focus on specific tasks</li>
            <li>Click "Copy" to copy the example command to your clipboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GitCommandHelper;