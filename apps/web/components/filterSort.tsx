"use client";
import React, { useState } from "react";

const SortFilter: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className=" w-full">
      {/* Toggle Button for Small Screens */}
      <div className="w-full fixed top-14 left-0 bg-gray-200 z-40">
        <p
          onClick={toggleVisibility}
          className="w-full text-black opacity-70 p-2 text-center text-sm font-medium cursor-pointer"
        >
          Sort & Filter
        </p>
      </div>

      {/* Sort & Filter Section */}
      {isVisible && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md p-4 z-50">
          {/* Sort by Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Sort by</h2>
            <div>
              <p className="text-lg font-medium mb-2">Price</p>
              <label className="flex items-center space-x-2 mb-2">
                <input
                  type="radio"
                  name="sortPrice"
                  value="low"
                  className="form-radio text-blue-500"
                />
                <span className="text-sm">Low to High</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="sortPrice"
                  value="high"
                  className="form-radio text-blue-500"
                />
                <span className="text-sm">High to Low</span>
              </label>
            </div>
          </div>

          {/* Filter by Rent Budget */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Filter by</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rent Budget</label>
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>₹0</span>
                <span>₹5000</span>
              </div>
            </div>
            <button className="p-1.5 bg-gray-600 text-white rounded w-full">
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SortFilter;
