'use client'
import React, { useState } from 'react';

const InvestmentCalculator = () => {
  const [initialInvestment, setInitialInvestment] = useState('');
  const [contribution, setContribution] = useState(''); // Regular contribution
  const [contributionFrequency, setContributionFrequency] = useState('monthly'); // monthly, yearly
  const [interestRate, setInterestRate] = useState(''); // Annual interest rate in percentage
  const [years, setYears] = useState('');
  const [compoundFrequency, setCompoundFrequency] = useState('yearly'); // yearly, quarterly, monthly
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Compound frequency multipliers (compounds per year)
  const compoundFrequencies = {
    yearly: 1,
    quarterly: 4,
    monthly: 12
  };

  // Calculate investment growth
  const calculateInvestment = (initial, contrib, contribFreq, rate, yrs, compFreq) => {
    const initialNum = parseFloat(initial);
    const contribNum = parseFloat(contrib) || 0;
    const rateNum = parseFloat(rate);
    const yearsNum = parseInt(yrs);
    const compoundsPerYear = compoundFrequencies[compFreq];
    const contributionsPerYear = contribFreq === 'monthly' ? 12 : 1;

    if (isNaN(initialNum) || isNaN(contribNum) || isNaN(rateNum) || isNaN(yearsNum)) {
      return { error: 'Please enter valid numbers' };
    }
    if (initialNum < 0 || contribNum < 0 || rateNum < 0 || yearsNum <= 0) {
      return { error: 'Initial investment, contribution, and rate must be non-negative; years must be positive' };
    }

    // Convert annual rate to per-compound period rate
    const periodRate = rateNum / 100 / compoundsPerYear;
    const totalPeriods = yearsNum * compoundsPerYear;
    const contribPerPeriod = contribNum * (contributionsPerYear / compoundsPerYear);

    // Future value of initial investment: FV = PV * (1 + r/n)^(n*t)
    const fvInitial = initialNum * Math.pow(1 + periodRate, totalPeriods);

    // Future value of contributions: FV = PMT * [((1 + r/n)^(n*t) - 1) / (r/n)]
    const fvContributions = contribPerPeriod * ((Math.pow(1 + periodRate, totalPeriods) - 1) / periodRate);

    const totalValue = fvInitial + (contribNum > 0 ? fvContributions : 0);
    const totalContributed = initialNum + (contribNum * contributionsPerYear * yearsNum);
    const totalInterest = totalValue - totalContributed;

    // Year-by-year breakdown
    const breakdown = [];
    let currentBalance = initialNum;
    for (let year = 1; year <= yearsNum; year++) {
      const yearStart = currentBalance;
      const yearContrib = contribNum * contributionsPerYear;
      const periodsThisYear = Math.min(compoundsPerYear, totalPeriods - ((year - 1) * compoundsPerYear));
      
      // Interest for this year (compound within year)
      for (let period = 0; period < periodsThisYear; period++) {
        currentBalance += (currentBalance * periodRate);
        if (period === 0) currentBalance += contribPerPeriod * contributionsPerYear; // Add contribution at start of year
      }

      const yearInterest = currentBalance - yearStart - yearContrib;
      breakdown.push({
        year,
        startBalance: yearStart.toFixed(2),
        contribution: yearContrib.toFixed(2),
        interest: yearInterest.toFixed(2),
        endBalance: currentBalance.toFixed(2)
      });
    }

    return {
      initialInvestment: initialNum.toFixed(2),
      contribution: contribNum.toFixed(2),
      contributionFrequency: contribFreq,
      interestRate: rateNum.toFixed(2),
      years: yearsNum,
      compoundFrequency: compFreq,
      totalValue: totalValue.toFixed(2),
      totalContributed: totalContributed.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      breakdown
    };
  };

  const calculate = () => {
    setError('');
    setResult(null);

    if (!initialInvestment || !interestRate || !years) {
      setError('Please fill in all required fields');
      return;
    }

    const calcResult = calculateInvestment(
      initialInvestment,
      contribution,
      contributionFrequency,
      interestRate,
      years,
      compoundFrequency
    );
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setInitialInvestment('');
    setContribution('');
    setContributionFrequency('monthly');
    setInterestRate('');
    setYears('');
    setCompoundFrequency('yearly');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Investment Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="w-40 text-gray-700">Initial Investment ($):</label>
              <input
                type="number"
                step="0.01"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 1000"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-40 text-gray-700">Contribution ($):</label>
              <input
                type="number"
                step="0.01"
                value={contribution}
                onChange={(e) => setContribution(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 100"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-40 text-gray-700">Contribution Frequency:</label>
              <select
                value={contributionFrequency}
                onChange={(e) => setContributionFrequency(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="w-40 text-gray-700">Annual Interest Rate (%):</label>
              <input
                type="number"
                step="0.01"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 5"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-40 text-gray-700">Years:</label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 10"
                min="1"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-40 text-gray-700">Compound Frequency:</label>
              <select
                value={compoundFrequency}
                onChange={(e) => setCompoundFrequency(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="yearly">Yearly</option>
                <option value="quarterly">Quarterly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-all font-semibold"
            >
              Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all font-semibold"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Investment Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center text-xl">Future Value: ${result.totalValue}</p>
              <p className="text-center">Total Contributed: ${result.totalContributed}</p>
              <p className="text-center">Total Interest: ${result.totalInterest}</p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-4">
                  <div>
                    <p>Input Summary:</p>
                    <ul className="list-disc list-inside">
                      <li>Initial Investment: ${result.initialInvestment}</li>
                      <li>{result.contributionFrequency} Contribution: ${result.contribution}</li>
                      <li>Annual Interest Rate: {result.interestRate}%</li>
                      <li>Years: {result.years}</li>
                      <li>Compound Frequency: {result.compoundFrequency} ({compoundFrequencies[result.compoundFrequency]} times/year)</li>
                    </ul>
                  </div>
                  <div>
                    <p>Yearly Breakdown:</p>
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-2 border">Year</th>
                            <th className="p-2 border">Start</th>
                            <th className="p-2 border">Contrib</th>
                            <th className="p-2 border">Interest</th>
                            <th className="p-2 border">End</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.breakdown.map((yearData) => (
                            <tr key={yearData.year}>
                              <td className="p-2 border text-center">{yearData.year}</td>
                              <td className="p-2 border text-center">${yearData.startBalance}</td>
                              <td className="p-2 border text-center">${yearData.contribution}</td>
                              <td className="p-2 border text-center">${yearData.interest}</td>
                              <td className="p-2 border text-center">${yearData.endBalance}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentCalculator;