import React from 'react';

export default function SortControls({ sortBy, setSortBy }) {
  const options = ['overall_score', 'skills_score', 'experience_score'];

  return (
    <div className="flex items-center gap-3">
      <span className="text-white/60">Sort by:</span>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => setSortBy(option)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            sortBy === option
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          {option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </button>
      ))}
    </div>
  );
}