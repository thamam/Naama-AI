import React, { useState } from 'react';
import parseActivityInput from '../utils/activityParser';
import PictureMatchingActivity from './PictureMatchingActivity';
import SequencingActivity from './SequencingActivity';
import ArticulationActivity from './ArticulationActivity';
import CustomizationPanel from './CustomizationPanel';
import { activityTypes, colorThemes } from '../data/activityTemplates';

const ActivityGenerator = () => {
  const [inputText, setInputText] = useState('');
  const [activity, setActivity] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const examplePrompts = [
    "Create a 'S' sound practice activity for a 4-year-old",
    "Picture matching game for 2-year-old, farm animals",
    "Story sequencing for 5-year-old, morning routine"
  ];

  const handleGenerate = () => {
    if (!inputText.trim()) return;

    setIsGenerating(true);

    // Simulate processing time for better UX
    setTimeout(() => {
      const generatedActivity = parseActivityInput(inputText);
      setActivity(generatedActivity);
      setIsGenerating(false);
    }, 800);
  };

  const handleCustomize = (newCustomization) => {
    if (!activity) return;

    setActivity({
      ...activity,
      customization: newCustomization
    });
  };

  const handleReset = () => {
    setActivity(null);
    setInputText('');
  };

  const handleExampleClick = (example) => {
    setInputText(example);
  };

  const currentTheme = activity
    ? colorThemes[activity.customization.colorTheme]
    : colorThemes.default;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            Speech Therapy Activity Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create engaging, age-appropriate activities for children aged 2-6 using simple descriptions
          </p>
        </header>

        {/* Input Section */}
        {!activity && (
          <div className="card max-w-3xl mx-auto space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Describe the activity you want to create:
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Example: Create a picture-matching game for 3-year-olds practicing 'b' sounds"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors min-h-32 text-lg"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!inputText.trim() || isGenerating}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Activity...
                </span>
              ) : (
                'Generate Activity'
              )}
            </button>

            {/* Example Prompts */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Try these examples:
              </p>
              <div className="space-y-2">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-sm text-gray-700 border border-purple-200"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activity Display */}
        {activity && (
          <div className="space-y-6">
            {/* Activity Header */}
            <div className="activity-card" style={{ borderColor: currentTheme.primary }}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2" style={{ color: currentTheme.primary }}>
                    {activity.title}
                  </h2>
                  <div className="flex gap-3 flex-wrap">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      Age {activity.age} years
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium capitalize">
                      {activity.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
                >
                  New Activity
                </button>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Activity Display (2/3 width) */}
              <div className="lg:col-span-2">
                <div className="activity-card" style={{ borderColor: currentTheme.primary }}>
                  {activity.type === activityTypes.PICTURE_MATCHING && (
                    <PictureMatchingActivity activity={activity} colorTheme={currentTheme} />
                  )}
                  {activity.type === activityTypes.SEQUENCING && (
                    <SequencingActivity activity={activity} colorTheme={currentTheme} />
                  )}
                  {activity.type === activityTypes.ARTICULATION && (
                    <ArticulationActivity activity={activity} colorTheme={currentTheme} />
                  )}
                </div>
              </div>

              {/* Customization Panel (1/3 width) */}
              <div className="lg:col-span-1">
                <CustomizationPanel
                  activity={activity}
                  onCustomize={handleCustomize}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityGenerator;
