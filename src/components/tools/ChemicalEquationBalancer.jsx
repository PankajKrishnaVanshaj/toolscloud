"use client";
import { useState, useCallback } from "react";
import { FaBalanceScale, FaSync, FaDownload } from "react-icons/fa";

// Function to parse a chemical equation into reactants and products
const parseEquation = (equation) => {
  if (!equation.includes("=")) {
    return { error: "Missing equals sign '='. Use 'Reactant1 + Reactant2 = Product1 + Product2'." };
  }

  try {
    const [reactantsSide, productsSide] = equation.split("=").map((side) => side.trim());
    const reactants = reactantsSide.split("+").map((compound) => compound.trim());
    const products = productsSide.split("+").map((compound) => compound.trim());

    if (!reactants.length || !products.length || reactants.some((r) => !r) || products.some((p) => !p)) {
      return { error: "Invalid equation. Ensure both sides have valid compounds." };
    }

    return { reactants, products };
  } catch {
    return { error: "Error parsing the equation." };
  }
};

// Simple element parser (e.g., H2O -> { H: 2, O: 1 })
const parseCompound = (compound) => {
  const elements = {};
  const regex = /([A-Z][a-z]?)(\d*)/g;
  let match;

  while ((match = regex.exec(compound)) !== null) {
    const element = match[1];
    const count = match[2] ? parseInt(match[2], 10) : 1;
    elements[element] = (elements[element] || 0) + count;
  }

  return Object.keys(elements).length > 0 ? elements : null;
};

// Helper function to find GCD (Greatest Common Divisor)
const gcd = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
};

// Helper function to normalize coefficients
const normalizeCoefficients = (coeffs) => {
  const nonZero = coeffs.filter((c) => Math.abs(c) > 0.0001);
  if (nonZero.length === 0) return coeffs;

  const factor = 1 / Math.min(...nonZero.map((c) => Math.abs(c)));
  let intCoeffs = coeffs.map((c) => Math.round(c * factor));

  const commonDivisor = intCoeffs.reduce((g, c) => gcd(g, Math.abs(c)), Math.abs(intCoeffs[0]));
  if (commonDivisor > 1) {
    intCoeffs = intCoeffs.map((c) => c / commonDivisor);
  }

  if (intCoeffs.some((c) => c < 0)) {
    intCoeffs = intCoeffs.map((c) => -c);
  }

  return intCoeffs;
};

// Balancing algorithm with steps tracking
const balanceEquation = (equation) => {
  const parsed = parseEquation(equation);
  if (parsed.error) return { error: parsed.error };

  const { reactants, products } = parsed;

  // Parse elements in each compound
  const reactantElements = reactants.map(parseCompound);
  const productElements = products.map(parseCompound);

  if (reactantElements.some((e) => !e) || productElements.some((e) => !e)) {
    return { error: "Invalid compound in equation." };
  }

  // Collect all unique elements
  const allElements = Array.from(
    new Set([
      ...reactantElements.flatMap((e) => Object.keys(e)),
      ...productElements.flatMap((e) => Object.keys(e)),
    ])
  );

  // Build coefficient matrix
  const matrix = allElements.map(() => Array(reactants.length + products.length).fill(0));

  // Fill matrix for reactants (positive)
  reactantElements.forEach((elements, rIndex) => {
    Object.entries(elements).forEach(([elem, count]) => {
      const eIndex = allElements.indexOf(elem);
      matrix[eIndex][rIndex] = count;
    });
  });

  // Fill matrix for products (negative)
  productElements.forEach((elements, pIndex) => {
    Object.entries(elements).forEach(([elem, count]) => {
      const eIndex = allElements.indexOf(elem);
      matrix[eIndex][reactants.length + pIndex] = -count;
    });
  });

  // Steps for explanation
  const steps = [
    `Parsed equation: ${reactants.join(" + ")} = ${products.join(" + ")}`,
    `Identified elements: ${allElements.join(", ")}`,
  ];

  // Generate equations for each element
  const elementEquations = allElements.map((elem, eIndex) => {
    const reactantTerms = reactants
      .map((r, i) => {
        const count = matrix[eIndex][i] || 0;
        return count ? `${count > 1 ? count : ""}a${i + 1}` : "";
      })
      .filter((t) => t)
      .join(" + ");
    const productTerms = products
      .map((p, i) => {
        const count = -matrix[eIndex][reactants.length + i] || 0;
        return count ? `${count > 1 ? count : ""}b${i + 1}` : "";
      })
      .filter((t) => t)
      .join(" + ");
    return `${elem}: ${reactantTerms} = ${productTerms}`;
  });
  steps.push(`Set up equations for conservation of mass:\n${elementEquations.join("\n")}`);

  // Solve using brute-force integer search
  try {
    const numCompounds = reactants.length + products.length;
    let coefficients = Array(numCompounds).fill(1);
    let balanced = false;
    const maxTries = 1000;
    let tryCount = 0;

    const testCoefficients = (coeffs) => {
      return allElements.every((elem, eIndex) => {
        const reactantSum = coeffs
          .slice(0, reactants.length)
          .reduce((sum, c, i) => sum + c * (matrix[eIndex][i] || 0), 0);
        const productSum = coeffs
          .slice(reactants.length)
          .reduce((sum, c, i) => sum + c * (matrix[eIndex][reactants.length + i] || 0), 0);
        return reactantSum + productSum === 0;
      });
    };

    const tryCombinations = (index, current) => {
      if (tryCount > maxTries) return false;
      if (index === numCompounds) {
        if (testCoefficients(current) && current.every((c) => c > 0)) {
          coefficients = [...current];
          balanced = true;
          return true;
        }
        return false;
      }

      for (let i = 1; i <= 10; i++) {
        tryCount++;
        current[index] = i;
        if (tryCombinations(index + 1, current)) return true;
      }
      return false;
    };

    tryCombinations(0, Array(numCompounds).fill(1));

    if (!balanced) {
      return { error: "Unable to balance with simple integer coefficients within limits.", steps };
    }

    // Normalize coefficients
    coefficients = normalizeCoefficients(coefficients);

    // Add final step
    const finalEquation = `${reactants
      .map((r, i) => `${coefficients[i] > 1 ? coefficients[i] : ""}${r}`)
      .join(" + ")} = ${products
      .map((p, i) => `${coefficients[i + reactants.length] > 1 ? coefficients[i + reactants.length] : ""}${p}`)
      .join(" + ")}`;
    steps.push(
      `Tested coefficients: [${coefficients.slice(0, reactants.length).join(", ")}] for reactants, [${coefficients
        .slice(reactants.length)
        .join(", ")}] for products`,
      `Normalized to smallest integers, resulting in: ${finalEquation}`
    );

    return { coefficients, reactants, products, steps };
  } catch (e) {
    return { error: "Failed to balance equation: " + e.message, steps };
  }
};

const ChemicalEquationBalancer = () => {
  const [inputEquation, setInputEquation] = useState("");
  const [balancedEquation, setBalancedEquation] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [balancingSteps, setBalancingSteps] = useState([]);

  const handleBalance = useCallback(() => {
    setErrorMessage("");
    setBalancingSteps([]);
    setIsProcessing(true);

    setTimeout(() => {
      const { coefficients, reactants, products, error, steps } = balanceEquation(inputEquation);

      if (error) {
        setErrorMessage(error);
        setBalancedEquation("");
        setBalancingSteps(steps || []);
      } else {
        const balanced = `${reactants
          .map((compound, i) => `${coefficients[i] > 1 ? coefficients[i] : ""}${compound}`)
          .join(" + ")} = ${products
          .map((compound, i) => `${coefficients[i + reactants.length] > 1 ? coefficients[i + reactants.length] : ""}${compound}`)
          .join(" + ")}`;

        setBalancedEquation(balanced);
        setHistory((prev) => [balanced, ...prev.slice(0, 9)]);
        setBalancingSteps(steps || []);
      }
      setIsProcessing(false);
    }, 500);
  }, [inputEquation]);

  const handleClear = () => {
    setInputEquation("");
    setBalancedEquation("");
    setErrorMessage("");
    setShowSteps(false);
    setBalancingSteps([]);
  };

  const downloadResult = () => {
    if (balancedEquation) {
      const blob = new Blob([balancedEquation], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `balanced-equation-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Presets for common chemical equations
  const presets = [
    { equation: "H2 + O2 = H2O", label: "Water Formation" },
    { equation: "CH4 + O2 = CO2 + H2O", label: "Methane Combustion" },
    { equation: "Na + Cl2 = NaCl", label: "Sodium Chloride" },
    { equation: "Al + O2 = Al2O3", label: "Aluminum Oxide" },
  ];

  const handlePreset = (equation) => {
    setInputEquation(equation);
    setBalancedEquation("");
    setErrorMessage("");
    setShowSteps(false);
    setBalancingSteps([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Chemical Equation Balancer</h2>

        {/* Input Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Chemical Equation
          </label>
          <input
            type="text"
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g., H2 + O2 = H2O"
            value={inputEquation}
            onChange={(e) => setInputEquation(e.target.value)}
            disabled={isProcessing}
            aria-label="Chemical equation input"
          />
        </div>

        {/* Presets */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Presets</label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => handlePreset(preset.equation)}
                className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isProcessing}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{errorMessage}</div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={handleBalance}
            disabled={!inputEquation || isProcessing}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
              <FaBalanceScale className="mr-2" />
            )}
            {isProcessing ? "Balancing..." : "Balance"}
          </button>
          <button
            onClick={handleClear}
            disabled={isProcessing}
            className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Clear
          </button>
          <button
            onClick={downloadResult}
            disabled={!balancedEquation || isProcessing}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download
          </button>
        </div>

        {/* Balanced Equation and Steps */}
        {balancedEquation && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <strong className="text-gray-700 text-lg">Balanced Equation:</strong>
            <p className="mt-1 text-gray-800 text-lg font-mono">{balancedEquation}</p>
            <label className="flex items-center mt-4">
              <input
                type="checkbox"
                checked={showSteps}
                onChange={() => setShowSteps(!showSteps)}
                className="mr-2 h-5 w-5 accent-blue-500"
                aria-label="Show balancing steps"
              />
              <span className="text-sm text-gray-700">Show Balancing Steps</span>
            </label>
            {showSteps && balancingSteps.length > 0 && (
              <div className="mt-4">
                <h3 className="text-md font-semibold text-gray-700 mb-3">Balancing Steps</h3>
                <div className="space-y-2">
                  {balancingSteps.map((step, index) => (
                    <div
                      key={index}
                      className="p-4 bg-white border border-gray-200 rounded-md"
                      role="region"
                      aria-labelledby={`step-${index}`}
                    >
                      <h4
                        id={`step-${index}`}
                        className="text-sm font-medium text-gray-700 mb-2"
                      >
                        Step {index + 1}
                      </h4>
                      <div className="text-sm text-gray-600">
                        {step.startsWith("Parsed equation") && (
                          <>
                            <p>
                              <strong>Parsed Equation:</strong> We split your input into{" "}
                              <strong>reactants</strong> (left side) and{" "}
                              <strong>products</strong> (right side) to understand the
                              equation.
                            </p>
                            <p className="font-mono mt-1">
                              {step.replace("Parsed equation: ", "")}
                            </p>
                          </>
                        )}
                        {step.startsWith("Identified elements") && (
                          <>
                            <p>
                              <strong>Elements Found:</strong> We listed all the unique{" "}
                              <strong>chemical elements</strong> (like H for hydrogen) in
                              the equation.
                            </p>
                            <p className="mt-1">
                              {step.replace("Identified elements: ", "")}
                            </p>
                          </>
                        )}
                        {step.startsWith("Set up equations") && (
                          <>
                            <p>
                              <strong>Balancing Elements:</strong> To balance the
                              equation, we ensure each <strong>element</strong> has the
                              same number of atoms on both sides. We set up equations for
                              this.
                            </p>
                            <ul className="list-disc list-inside mt-1 font-mono">
                              {step
                                .split("\n")
                                .slice(1)
                                .map((eq, idx) => (
                                  <li key={idx}>{eq}</li>
                                ))}
                            </ul>
                          </>
                        )}
                        {step.startsWith("Tested coefficients") && (
                          <>
                            <p>
                              <strong>Finding Coefficients:</strong> We tested numbers
                              (called <strong>coefficients</strong>) to multiply each
                              compound, making the equation balanced.
                            </p>
                            <p className="mt-1">
                              {step.replace("Tested coefficients: ", "")}
                            </p>
                          </>
                        )}
                        {step.startsWith("Normalized to") && (
                          <>
                            <p>
                              <strong>Final Equation:</strong> We simplified the{" "}
                              <strong>coefficients</strong> to the smallest whole
                              numbers to get the final balanced equation.
                            </p>
                            <p className="font-mono mt-1">
                              {step.replace(
                                "Normalized to smallest integers, resulting in: ",
                                ""
                              )}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">History (Last 10):</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 max-h-40 overflow-y-auto">
              {history.map((eq, index) => (
                <li key={index} className="py-1">{eq}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Balances simple and complex chemical equations</li>
            <li>Shows detailed balancing steps with formulas</li>
            <li>History of balanced equations</li>
            <li>Download balanced equation as text</li>
            <li>Presets for common equations</li>
          </ul>
        </div>

        {/* Note */}
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-700 text-sm">
            <strong>Note:</strong> Balances most common equations. Complex cases may require manual verification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChemicalEquationBalancer;