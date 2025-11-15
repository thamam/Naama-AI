import React, { useState } from 'react';
import api from '../services/api';

const NewActivityGenerator = ({ user, onLogout }) => {
  const [formData, setFormData] = useState({
    activityType: 'articulation',
    ageGroup: '3-4',
    language: 'he',
    targetSound: '',
    soundPosition: 'initial',
    theme: '',
    itemCount: 6,
    nikudLevel: 'auto',
    prosodyType: 'mixed',
    primaryLanguage: 'he',
    activitySubtype: 'translation'
  });

  const [activity, setActivity] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const activityTypes = [
    { value: 'articulation', label: 'Articulation (תרגול ארטיקולציה)', requiresSound: true },
    { value: 'rhyming', label: 'Rhyming (פעילויות חרוזים)', requiresTheme: true },
    { value: 'morphological', label: 'Morphological (תבניות מורפולוגיות)' },
    { value: 'prosody', label: 'Prosody (פעילויות פרוסודיה)' },
    { value: 'bilingual', label: 'Bilingual (דו-לשוניות)' },
    { value: 'picture_matching', label: 'Picture Matching (התאמת תמונות)', requiresTheme: true },
    { value: 'sequencing', label: 'Sequencing (סדרת אירועים)', requiresTheme: true }
  ];

  const hebrewSounds = ['ב', 'פ', 'כ', 'ת', 'ש', 'ר', 'ל', 'ד', 'ג', 'ז', 'ס', 'צ', 'ח', 'ק'];

  const themes = [
    'animals', 'food', 'family', 'toys', 'colors', 'body parts',
    'clothes', 'vehicles', 'weather', 'emotions'
  ];

  const prosodyTypes = [
    { value: 'syllable', label: 'Syllable Counting' },
    { value: 'stress', label: 'Stress Patterns' },
    { value: 'rhythm', label: 'Rhythm Games' },
    { value: 'intonation', label: 'Intonation Practice' },
    { value: 'mixed', label: 'Mixed Activities' }
  ];

  const bilingualSubtypes = [
    { value: 'translation', label: 'Translation Pairs' },
    { value: 'codeSwitch', label: 'Code-Switching' },
    { value: 'cognates', label: 'Cognates' },
    { value: 'cultural', label: 'Cultural Context' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleGenerate = async () => {
    setError('');
    setIsGenerating(true);

    try {
      // Build request payload based on activity type
      const payload = {
        activityType: formData.activityType,
        ageGroup: formData.ageGroup,
        language: formData.language,
      };

      // Add type-specific fields
      const selectedType = activityTypes.find(t => t.value === formData.activityType);

      if (selectedType?.requiresSound && formData.targetSound) {
        payload.targetSound = formData.targetSound;
        payload.soundPosition = formData.soundPosition;
      }

      if (selectedType?.requiresTheme && formData.theme) {
        payload.theme = formData.theme;
      }

      if (formData.activityType === 'articulation') {
        payload.nikudLevel = formData.nikudLevel;
        payload.itemCount = parseInt(formData.itemCount);
      }

      if (formData.activityType === 'prosody') {
        payload.prosodyType = formData.prosodyType;
      }

      if (formData.activityType === 'bilingual') {
        payload.primaryLanguage = formData.primaryLanguage;
        payload.activitySubtype = formData.activitySubtype;
      }

      if (['rhyming', 'morphological'].includes(formData.activityType)) {
        payload.itemCount = parseInt(formData.itemCount);
      }

      const response = await api.generateActivity(payload);
      setActivity(response.activity);
    } catch (err) {
      setError(err.message || 'Failed to generate activity. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setActivity(null);
    setError('');
  };

  const selectedType = activityTypes.find(t => t.value === formData.activityType);

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                Naama-AI Speech Therapy
              </h1>
              <p className="text-gray-600 mt-2">
                AI-Powered Hebrew Activity Generator for Israeli Clinicians
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
              <button
                onClick={onLogout}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {!activity ? (
          /* Activity Generation Form */
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Generate New Activity
            </h2>

            <div className="space-y-6">
              {/* Activity Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Activity Type
                </label>
                <select
                  name="activityType"
                  value={formData.activityType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {activityTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Age Group */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Age Group
                </label>
                <div className="flex gap-4">
                  {['2-3', '3-4', '4-6'].map(age => (
                    <label key={age} className="flex items-center">
                      <input
                        type="radio"
                        name="ageGroup"
                        value={age}
                        checked={formData.ageGroup === age}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span>{age} years</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Language
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="language"
                      value="he"
                      checked={formData.language === 'he'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span>Hebrew (עברית)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="language"
                      value="en"
                      checked={formData.language === 'en'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span>English</span>
                  </label>
                </div>
              </div>

              {/* Conditional Fields Based on Activity Type */}
              {selectedType?.requiresSound && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Target Sound
                    </label>
                    <select
                      name="targetSound"
                      value={formData.targetSound}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select sound...</option>
                      {hebrewSounds.map(sound => (
                        <option key={sound} value={sound}>{sound}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sound Position
                    </label>
                    <select
                      name="soundPosition"
                      value={formData.soundPosition}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="initial">Initial</option>
                      <option value="medial">Medial</option>
                      <option value="final">Final</option>
                      <option value="any">Any Position</option>
                    </select>
                  </div>
                </>
              )}

              {selectedType?.requiresTheme && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    name="theme"
                    value={formData.theme}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select theme...</option>
                    {themes.map(theme => (
                      <option key={theme} value={theme}>{theme}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.activityType === 'prosody' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prosody Type
                  </label>
                  <select
                    name="prosodyType"
                    value={formData.prosodyType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {prosodyTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.activityType === 'bilingual' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Activity Subtype
                  </label>
                  <select
                    name="activitySubtype"
                    value={formData.activitySubtype}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {bilingualSubtypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Item Count */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Items: {formData.itemCount}
                </label>
                <input
                  type="range"
                  name="itemCount"
                  min="3"
                  max="15"
                  value={formData.itemCount}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Activity with AI...
                  </span>
                ) : (
                  'Generate Activity'
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Activity Display */
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-purple-600 mb-2">
                  {activity.title || 'Generated Activity'}
                </h2>
                <div className="flex gap-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Age {activity.ageGroup}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {activity.activityType}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {activity.language === 'he' ? 'Hebrew' : 'English'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
              >
                New Activity
              </button>
            </div>

            {/* Activity Content */}
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap bg-gray-50 p-6 rounded-lg">
                {JSON.stringify(activity, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewActivityGenerator;
