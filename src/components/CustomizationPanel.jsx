import React from 'react';
import { ageGroups, colorThemes } from '../data/activityTemplates';

const CustomizationPanel = ({ activity, onCustomize }) => {
  const handleAgeChange = (newAge) => {
    onCustomize({ ...activity.customization, difficulty: newAge });
  };

  const handleThemeChange = (newTheme) => {
    onCustomize({ ...activity.customization, colorTheme: newTheme });
  };

  return (
    <div className="card space-y-6">
      <h3 className="text-xl font-bold text-gray-800 border-b-2 border-purple-200 pb-2">
        Customize Activity
      </h3>

      {/* Age/Difficulty Level */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Difficulty Level (Age Group)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(ageGroups).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleAgeChange(value)}
              className={`py-2 px-4 rounded-lg font-medium transition-all ${
                activity.customization.difficulty === value
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {value} years
            </button>
          ))}
        </div>
      </div>

      {/* Color Theme */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Visual Theme
        </label>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(colorThemes).map(([name, theme]) => (
            <button
              key={name}
              onClick={() => handleThemeChange(name)}
              className={`py-3 px-4 rounded-lg font-medium transition-all border-2 ${
                activity.customization.colorTheme === name
                  ? 'border-purple-600 shadow-md'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{
                background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                color: '#FFFFFF'
              }}
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Info */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Activity Type:</span>
          <span className="font-semibold text-gray-800 capitalize">
            {activity.type.replace('_', ' ')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Number of Items:</span>
          <span className="font-semibold text-gray-800">
            {activity.items.length}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Complexity:</span>
          <span className="font-semibold text-gray-800 capitalize">
            {activity.guidelines.complexity}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPanel;
