import React, { useState } from 'react';

const ArticulationActivity = ({ activity, colorTheme }) => {
  const [items, setItems] = useState(activity.items);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleWordClick = (itemId) => {
    // Toggle repeated status
    setItems(items.map(i =>
      i.id === itemId ? { ...i, repeated: !i.repeated } : i
    ));

    // Play audio feedback (simple beep using Web Audio API)
    playSuccessSound();
  };

  const nextWord = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const previousWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const resetActivity = () => {
    setItems(items.map(i => ({ ...i, repeated: false })));
    setCurrentIndex(0);
  };

  const completedCount = items.filter(i => i.repeated).length;
  const isComplete = completedCount === items.length;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-lg">
        <p className="text-green-900 font-medium">{activity.instructions}</p>
        <p className="text-green-700 text-sm mt-2">
          Click on each word after the child repeats it. Progress: {completedCount} / {items.length}
        </p>
      </div>

      {/* Main Word Display */}
      <div className="flex justify-center">
        <WordCard
          item={items[currentIndex]}
          onWordClick={handleWordClick}
          colorTheme={colorTheme}
          isLarge={true}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <button
          onClick={previousWord}
          disabled={currentIndex === 0}
          className="px-6 py-3 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed rounded-lg font-semibold transition-all"
        >
          ← Previous
        </button>

        <div className="px-6 py-3 bg-purple-100 rounded-lg font-semibold text-purple-900">
          Word {currentIndex + 1} of {items.length}
        </div>

        <button
          onClick={nextWord}
          disabled={currentIndex === items.length - 1}
          className="px-6 py-3 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed rounded-lg font-semibold transition-all"
        >
          Next →
        </button>
      </div>

      {/* All Words Grid */}
      <div className="border-t-2 border-gray-200 pt-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4">All Words:</h3>
        <div className={`grid gap-3 ${
          activity.guidelines.visualSize === 'large' ? 'grid-cols-2' :
          activity.guidelines.visualSize === 'medium' ? 'grid-cols-3' :
          'grid-cols-4'
        }`}>
          {items.map((item, index) => (
            <WordCard
              key={item.id}
              item={item}
              onWordClick={handleWordClick}
              colorTheme={colorTheme}
              isActive={index === currentIndex}
              isLarge={false}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={resetActivity}
          className="btn-secondary"
        >
          Reset Activity
        </button>

        {isComplete && (
          <div className="bg-green-100 border-2 border-green-500 px-6 py-3 rounded-lg">
            <span className="text-green-800 font-bold text-lg">🎉 All words practiced!</span>
          </div>
        )}
      </div>
    </div>
  );
};

const WordCard = ({ item, onWordClick, colorTheme, isActive, isLarge }) => {
  const size = isLarge ? 'large' : 'small';

  return (
    <button
      onClick={() => onWordClick(item.id)}
      className={`relative rounded-xl border-4 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
        item.repeated
          ? 'border-green-400 bg-green-50'
          : isActive
          ? 'border-purple-500 bg-purple-50 shadow-lg'
          : 'border-gray-300 bg-white hover:border-purple-300'
      } ${size === 'large' ? 'p-12' : 'p-6'}`}
      style={{
        borderColor: item.repeated ? '#4ADE80' : (isActive ? colorTheme.primary : undefined)
      }}
    >
      {/* Sound badge */}
      <div
        className={`absolute top-2 left-2 rounded-full ${size === 'large' ? 'w-12 h-12 text-lg' : 'w-8 h-8 text-sm'} flex items-center justify-center shadow-md font-bold text-white`}
        style={{ backgroundColor: colorTheme.primary }}
      >
        {item.sound.toUpperCase()}
      </div>

      {/* Check mark for completed */}
      {item.repeated && (
        <div className={`absolute top-2 right-2 bg-green-500 rounded-full ${size === 'large' ? 'w-10 h-10' : 'w-8 h-8'} flex items-center justify-center`}>
          <span className="text-white text-xl">✓</span>
        </div>
      )}

      {/* Visual and word */}
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className={size === 'large' ? 'text-9xl' : 'text-5xl'}>
          {getEmojiForWord(item.word)}
        </div>
        <div className={`font-bold capitalize ${size === 'large' ? 'text-4xl' : 'text-xl'}`}
          style={{ color: colorTheme.text }}
        >
          {item.word}
        </div>
      </div>

      {/* Click prompt */}
      {!item.repeated && size === 'large' && (
        <div className="mt-4 text-sm text-gray-600">
          Click after child repeats
        </div>
      )}
    </button>
  );
};

// Audio feedback using Web Audio API
function playSuccessSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (e) {
    // Silent fail if audio not supported
  }
}

// Emoji mapping (same as PictureMatchingActivity)
function getEmojiForWord(word) {
  const emojiMap = {
    'ball': '⚽', 'bear': '🐻', 'boat': '🚤', 'book': '📖', 'bus': '🚌',
    'baby': '👶', 'bell': '🔔', 'bird': '🐦',
    'sun': '☀️', 'sock': '🧦', 'soap': '🧼', 'seal': '🦭', 'saw': '🪚',
    'sand': '🏖️', 'sit': '💺', 'seven': '7️⃣',
    'pig': '🐷', 'pan': '🍳', 'pen': '✏️', 'pie': '🥧', 'pot': '🍲',
    'pear': '🍐', 'play': '🎮', 'pink': '🩷',
    'toy': '🧸', 'top': '🔝', 'tea': '🍵', 'ten': '🔟', 'toe': '🦶',
    'two': '2️⃣', 'tree': '🌳', 'tent': '⛺',
    'cat': '🐱', 'car': '🚗', 'key': '🔑', 'cake': '🎂', 'kite': '🪁',
    'king': '🤴', 'can': '🥫', 'cup': '☕',
    'man': '👨', 'moon': '🌙', 'mom': '👩', 'milk': '🥛', 'mouse': '🐭',
    'map': '🗺️', 'mat': '🧘', 'mop': '🧹',
    'dog': '🐕', 'door': '🚪', 'duck': '🦆', 'doll': '🪆', 'dad': '👨',
    'dig': '⛏️', 'dish': '🍽️', 'dance': '💃'
  };

  return emojiMap[word.toLowerCase()] || '🎨';
}

export default ArticulationActivity;
