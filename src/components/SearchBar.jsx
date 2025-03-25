"use client";

import { useEffect, useState } from "react";
import { FaSearchengin } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import ToolList from "../staticData/ToolList";

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTools, setFilteredTools] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!searchTerm) {
      setFilteredTools([]);
      return;
    }

    const results = ToolList.flatMap((category) =>
      category.tools.filter((tool) =>
        tool.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    setFilteredTools(results);
  }, [searchTerm]);

  const handleSelectTool = (slug) => {
    setSearchTerm("");
    setShowSearch(false);
    router.push(`/${slug}/tool`);
  };

  return (
    <div className="relative">
      {/* Desktop Search Bar */}
      <div className="relative hidden md:flex text-sm font-medium border border-gray-300 rounded-lg text-secondary transition-all duration-300 hover:text-gray-900 w-80">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-2 px-4 border border-secondary rounded-md outline-none"
        />
        <button
          className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 focus:outline-none transition-all flex items-center justify-center"
          aria-label="search"
        >
          <FaSearchengin size={24} color="black" />
        </button>
      </div>

      {/* Display filtered tools as suggestions (Desktop) */}
      {searchTerm && (
        <ul className="absolute bg-white shadow-lg border border-gray-200 rounded-md mt-1 w-80 max-h-60 overflow-auto z-10 hidden md:block">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool, index) => (
              <li
                key={`${tool.slug}-${index}`}
                className="p-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                onClick={() => handleSelectTool(tool.slug)}
              >
                <span className="text-secondary">{tool.icon}</span>
                <span className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                  {tool.name}
                </span>
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-500">No results found</li>
          )}
        </ul>
      )}

      {/* Mobile Search Button */}
      <button
        className="md:hidden p-2 rounded-lg transition-all hover:bg-gray-100"
        onClick={() => setShowSearch(!showSearch)}
      >
        <FaSearchengin size={24} color="black" />
      </button>

      {/* Mobile Search Bar */}
      {showSearch && (
        <div className="md:hidden fixed inset-x-0 top-0 z-50 bg-white shadow-md border-b border-gray-200 p-3 rounded-md">
          <div className="relative flex items-center border border-gray-300 rounded-lg">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 px-4 border-none outline-none rounded-lg"
              autoFocus
            />
            <button
              className="absolute right-2 p-1"
              onClick={() => setShowSearch(false)}
            >
              <span className="text-gray-500">×</span>
            </button>
          </div>
          {/* Display filtered tools for mobile */}
          {searchTerm && (
            <ul className="mt-2 bg-white border border-gray-200 rounded-md w-full max-h-[70vh] overflow-auto">
              {filteredTools.length > 0 ? (
                filteredTools.map((tool, index) => (
                  <li
                    key={`${tool.slug}-${index}`}
                    className="p-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                    onClick={() => handleSelectTool(tool.slug)}
                  >
                    <span className="text-secondary">{tool.icon}</span>
                    <span className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                      {tool.name}
                    </span>
                  </li>
                ))
              ) : (
                <li className="p-2 text-gray-500">No results found</li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}