"use client";
import { useState } from "react";

const RandomNumberGenerator = () => {
  const [numbers, setNumbers] = useState([]);
  const [history, setHistory] = useState([]);
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [sortOrder, setSortOrder] = useState("none");
  const [unique, setUnique] = useState(false);
  const [filter, setFilter] = useState("all");

  const generateNumbers = () => {
    if (min >= max) {
      alert("Min should be less than Max.");
      return;
    }
    if (count < 1 || count > 10) {
      alert("You can generate between 1 to 10 numbers.");
      return;
    }

    let newNumbers = [];
    if (unique) {
      const availableNumbers = Array.from(
        { length: max - min + 1 },
        (_, i) => i + min
      );
      newNumbers = availableNumbers
        .sort(() => 0.5 - Math.random())
        .slice(0, count);
    } else {
      newNumbers = Array.from(
        { length: count },
        () => Math.floor(Math.random() * (max - min + 1)) + min
      );
    }

    if (filter === "even")
      newNumbers = newNumbers.filter((num) => num % 2 === 0);
    if (filter === "odd")
      newNumbers = newNumbers.filter((num) => num % 2 !== 0);

    if (sortOrder === "asc") newNumbers.sort((a, b) => a - b);
    if (sortOrder === "desc") newNumbers.sort((a, b) => b - a);

    setNumbers(newNumbers);
    setHistory((prev) => [...prev, newNumbers]);
  };

  const reset = () => {
    setNumbers([]);
    setHistory([]);
    setMin(1);
    setMax(100);
    setCount(1);
    setSortOrder("none");
    setUnique(false);
    setFilter("all");
  };

  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const average = numbers.length ? (sum / numbers.length).toFixed(2) : 0;

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-2xl ">
      {/* Summary Row */}
      <p className="mb-4 text-gray-700 text-center font-medium">
        Min: {min} | Max: {max} | Sample: {count}
      </p>

      {/* Input Section */}
      <div className="flex flex-wrap justify-center gap-4">
        {/* Unique Checkbox */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <input
              type="checkbox"
              checked={unique}
              onChange={() => setUnique(!unique)}
              className="w-4 h-4"
            />
            Unique Values
          </label>
        </div>

        {/* Min Value */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium w-28 text-right">
            Min Value:
          </label>
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
            min="1"
            max="100"
            className="p-2 border rounded-lg text-center w-28"
            placeholder="Min"
          />
        </div>

        {/* Max Value */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium w-28 text-right">
            Max Value:
          </label>
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
            min="1"
            max="100"
            className="p-2 border rounded-lg text-center w-28"
            placeholder="Max"
          />
        </div>

        {/* Count */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium w-28 text-right">Count:</label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            min="1"
            max="10"
            className="p-2 border rounded-lg text-center w-28"
            placeholder="Count"
          />
        </div>

        {/* Sort Order */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium w-28 text-right">
            Sort Order:
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-2 border rounded-lg w-32"
          >
            <option value="none">No Sorting</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        <button
          onClick={generateNumbers}
          className="px-4 py-2 font-semibold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text border border-gray-300 rounded-xl shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:border-primary"
        >
          Generate Numbers
        </button>

        <button
          onClick={reset}
          className="px-4 py-2 font-semibold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text border border-gray-300 rounded-xl shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:border-primary"
        >
          Reset
        </button>
      </div>

      {/* Generated Numbers */}
      {numbers.length > 0 && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Generated Numbers:
          </h3>

          {/* Flex-wrap container for numbers */}
          <div className="flex flex-wrap gap-2">
            {numbers.map((num, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-primary rounded-lg text-sm font-medium"
              >
                {num}
              </span>
            ))}
          </div>

          <p className="mt-2 text-gray-900 font-medium">
            Sum: {sum} | Average: {average}
          </p>
        </div>
      )}
    </div>
  );
};

export default RandomNumberGenerator;
