// components/BudgetPlanner.js
'use client';

import React, { useState, useEffect } from 'react';

const BudgetPlanner = () => {
  const [income, setIncome] = useState([{ source: '', amount: 0 }]);
  const [expenses, setExpenses] = useState([{ category: '', amount: 0 }]);
  const [totals, setTotals] = useState({ income: 0, expenses: 0, remaining: 0 });

  const defaultCategories = [
    'Housing', 'Transportation', 'Food', 'Utilities', 'Entertainment', 
    'Healthcare', 'Insurance', 'Debt', 'Savings', 'Miscellaneous'
  ];

  // Calculate totals whenever income or expenses change
  useEffect(() => {
    const totalIncome = income.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const remaining = totalIncome - totalExpenses;
    
    setTotals({
      income: totalIncome,
      expenses: totalExpenses,
      remaining: remaining
    });
  }, [income, expenses]);

  // Add new income source
  const addIncome = () => {
    setIncome([...income, { source: '', amount: 0 }]);
  };

  // Add new expense
  const addExpense = () => {
    setExpenses([...expenses, { category: '', amount: 0 }]);
  };

  // Update income item
  const updateIncome = (index, field, value) => {
    const newIncome = [...income];
    newIncome[index][field] = field === 'amount' ? Number(value) : value;
    setIncome(newIncome);
  };

  // Update expense item
  const updateExpense = (index, field, value) => {
    const newExpenses = [...expenses];
    newExpenses[index][field] = field === 'amount' ? Number(value) : value;
    setExpenses(newExpenses);
  };

  // Remove income item
  const removeIncome = (index) => {
    setIncome(income.filter((_, i) => i !== index));
  };

  // Remove expense item
  const removeExpense = (index) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Budget Planner</h1>

      {/* Income Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Income</h2>
        {income.map((item, index) => (
          <div key={index} className="flex gap-4 mb-2 items-center">
            <input
              type="text"
              value={item.source}
              onChange={(e) => updateIncome(index, 'source', e.target.value)}
              placeholder="Income Source"
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              value={item.amount}
              onChange={(e) => updateIncome(index, 'amount', e.target.value)}
              placeholder="Amount"
              className="w-32 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
            />
            {income.length > 1 && (
              <button
                onClick={() => removeIncome(index)}
                className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                X
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addIncome}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Income Source
        </button>
      </div>

      {/* Expenses Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Expenses</h2>
        {expenses.map((item, index) => (
          <div key={index} className="flex gap-4 mb-2 items-center">
            <select
              value={item.category}
              onChange={(e) => updateExpense(index, 'category', e.target.value)}
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {defaultCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="number"
              value={item.amount}
              onChange={(e) => updateExpense(index, 'amount', e.target.value)}
              placeholder="Amount"
              className="w-32 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
            />
            {expenses.length > 1 && (
              <button
                onClick={() => removeExpense(index)}
                className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                X
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addExpense}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Expense
        </button>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Budget Summary</h2>
        <div className="space-y-2">
          <p>
            Total Income:{' '}
            <span className="font-bold text-green-600">${totals.income.toLocaleString()}</span>
          </p>
          <p>
            Total Expenses:{' '}
            <span className="font-bold text-red-600">${totals.expenses.toLocaleString()}</span>
          </p>
          <p>
            Remaining:{' '}
            <span className={`font-bold ${totals.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totals.remaining.toLocaleString()}
            </span>
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Note: This is a simple budget planner. Adjust amounts and categories as needed.
      </p>
    </div>
  );
};

export default BudgetPlanner;