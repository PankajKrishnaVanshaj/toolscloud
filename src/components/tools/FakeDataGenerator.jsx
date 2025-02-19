'use client'
import React, { useState } from 'react';

const generateUniqueId = () => Math.random().toString(36).substr(2, 9);

const generateFakeData = (type, existingData = {}) => {
  const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
  let newData;

  switch (type) {
    case 'user':
      newData = {
        firstName: randomChoice(['John', 'Jane', 'Mike', 'Emily', 'Alex', 'Sam']),
        lastName: randomChoice(['Doe', 'Smith', 'Johnson', 'Brown', 'Taylor', 'Lee']),
        email: `${generateUniqueId()}@${randomChoice(['gmail', 'yahoo', 'outlook'])}.com`,
        age: Math.floor(Math.random() * 80) + 18,
        phone: `(${Math.floor(Math.random() * 900) + 100})-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        occupation: randomChoice(['Software Developer', 'Teacher', 'Accountant', 'Artist', 'Manager', 'Engineer']),
        gender: randomChoice(['Male', 'Female', 'Non-binary']),
      };
      break;
    case 'address':
      newData = {
        street: `${Math.floor(Math.random() * 10000)} ${randomChoice(['Main', 'Park', 'Oak', 'Pine', 'Maple'])} St.`,
        city: randomChoice(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']),
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        state: randomChoice(['CA', 'NY', 'TX', 'FL', 'IL', 'AZ']),
        country: 'USA',
      };
      break;
    case 'company':
      newData = {
        name: `${randomChoice(['Tech', 'Health', 'Finance', 'Retail'])} ${randomChoice(['Systems', 'Solutions', 'Group', 'Innovations'])} ${generateUniqueId()}`,
        industry: randomChoice(['Tech', 'Health', 'Finance', 'Retail', 'Education', 'Energy']),
        foundedYear: Math.floor(Math.random() * (2025 - 1950) + 1950),
        employeeCount: Math.floor(Math.random() * 50000) + 1,
        website: `www.${generateUniqueId()}.${randomChoice(['com', 'net', 'org'])}`,
        revenue: `${Math.floor(Math.random() * 1000)}M`,
      };
      break;
    default:
      return null;
  }

  // Ensure uniqueness for specific fields
  let attempts = 0;
  const maxAttempts = 1000; // Prevent infinite loops
  while (attempts < maxAttempts) {
    const uniqueKey = JSON.stringify(newData);
    if (!existingData[uniqueKey]) {
      existingData[uniqueKey] = true;
      return newData;
    }
    // If we've seen this data before, regenerate certain fields
    switch (type) {
      case 'user':
        newData.email = `${generateUniqueId()}@${randomChoice(['gmail', 'yahoo', 'outlook'])}.com`;
        break;
      case 'company':
        newData.name = `${randomChoice(['Tech', 'Health', 'Finance', 'Retail'])} ${randomChoice(['Systems', 'Solutions', 'Group', 'Innovations'])} ${generateUniqueId()}`;
        newData.website = `www.${generateUniqueId()}.${randomChoice(['com', 'net', 'org'])}`;
        break;
    }
    attempts++;
  }
  console.error("Failed to generate unique data after multiple attempts");
  return newData; // Return the last attempt even if not unique, with a warning
};

const FakeDataGenerator = () => {
  const [selectedType, setSelectedType] = useState('user');
  const [generatedData, setGeneratedData] = useState(null);
  const [allData, setAllData] = useState({}); // Store all generated data for uniqueness check

  const handleGenerate = () => {
    const data = generateFakeData(selectedType, allData);
    if (data) {
      setGeneratedData(data);
      setAllData(prevData => ({
        ...prevData,
        [JSON.stringify(data)]: true
      }));
    }
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setGeneratedData(null); // Clear data when type changes
    setAllData({}); // Reset allData when type changes
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Fake Data Generator</h1>
      <p className="text-gray-600 mb-4">Generating unique fake data for testing purposes.</p>
      
      <select 
        onChange={handleTypeChange}
        value={selectedType}
        className="mb-4 p-2 border rounded"
      >
        <option value="user">User</option>
        <option value="address">Address</option>
        <option value="company">Company</option>
      </select>

      <button 
        onClick={handleGenerate}
        className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded"
      >
        Generate Unique Data
      </button>

      {generatedData && (
        <div className="mt-4 bg-gray-100 p-4 rounded">
          {Object.entries(generatedData).map(([key, value]) => (
            <p key={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default FakeDataGenerator;