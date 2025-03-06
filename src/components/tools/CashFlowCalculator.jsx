// components/CashFlowCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const CashFlowCalculator = () => {
  const [incomes, setIncomes] = useState([{ name: '', amount: 0 }]);
  const [expenses, setExpenses] = useState([{ name: '', amount: 0 }]);
  const [netCashFlow, setNetCashFlow] = useState(0);

  // Calculate total income, total expenses, and net cash flow
  const calculateCashFlow = () => {
    const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
    setNetCashFlow(totalIncome - totalExpenses);
  };

  useEffect(() => {
    calculateCashFlow();
  }, [incomes, expenses]);

  // Handle input changes
  const handleIncomeChange = (index, field, value) => {
    const newIncomes = [...incomes];
    newIncomes[index][field] = value;
    setIncomes(newIncomes);
  };

  const handleExpenseChange = (index, field, value) => {
    const newExpenses = [...expenses];
    newExpenses[index][field] = value;
    setExpenses(newExpenses);
  };

  // Add new income/expense item
  const addIncome = () => setIncomes([...incomes, { name: '', amount: 0 }]);
  const addExpense = () => setExpenses([...expenses, { name: '', amount: 0 }]);

  // Remove income/expense item
  const removeIncome = (index) => {
    if (incomes.length > 1) {
      setIncomes(incomes.filter((_, i) => i !== index));
    }
  };

  const removeExpense = (index) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Cash Flow Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Section */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Income</h2>
          {incomes.map((income, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <input
                type="text"
                placeholder="Source"
                value={income.name}
                onChange={(e) => handleIncomeChange(index, 'name', e.target.value)}
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                placeholder="Amount"
                value={income.amount}
                onChange={(e) => handleIncomeChange(index, 'amount', e.target.value)}
                className="w-32 p-2 border rounded-md focus:ring-2 focus:ring-green-500"
                min="0"
              />
              {incomes.length > 1 && (
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
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add Income
          </button>
        </div>

        {/* Expenses Section */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Expenses</h2>
          {expenses.map((expense, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <input
                type="text"
                placeholder="Description"
                value={expense.name}
                onChange={(e) => handleExpenseChange(index, 'name', e.target.value)}
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-red-500"
              />
              <input
                type="number"
                placeholder="Amount"
                value={expense.amount}
                onChange={(e) => handleExpenseChange(index, 'amount', e.target.value)}
                className="w-32 p-2 border rounded-md focus:ring-2 focus:ring-red-500"
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
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Add Expense
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="mt-6 bg-gray-50 p-4 rounded-md text-center">
        <h2 className="text-lg font-semibold mb-2">Cash Flow Summary</h2>
        <p>
          Total Income:{' '}
          <span className="font-medium text-green-600">
            ${incomes.reduce((sum, item) => sum + Number(item.amount), 0).toLocaleString()}
          </span>
        </p>
        <p>
          Total Expenses:{' '}
          <span className="font-medium text-red-600">
            ${expenses.reduce((sum, item) => sum + Number(item.amount), 0).toLocaleString()}
          </span>
        </p>
        <p className="mt-2">
          Net Cash Flow:{' '}
          <span className={`font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${netCashFlow.toLocaleString()}
          </span>
        </p>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: Enter your monthly or annual figures to calculate cash flow.
      </p>
    </div>
  );
};

export default CashFlowCalculator;