import React, { useState } from 'react';

const PictureMatchingActivity = ({ activity, colorTheme }) => {
  const [items, setItems] = useState(activity.items);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleItemClick = (itemId) => {
    const item = items.find(i => i.id === itemId);

    if (item.matched) {
      // Unmark if already matched
      setItems(items.map(i =>
        i.id === itemId ? { ...i, matched: false } : i
      ));
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      // Mark as matched
      setItems(items.map(i =>
        i.id === itemId ? { ...i, matched: true } : i
      ));
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const resetActivity = () => {
    setItems(items.map(i => ({ ...i, matched: false })));
    setSelectedItems([]);
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-lg">
        <p className="text-blue-900 font-medium">{activity.instructions}</p>
        <p className="text-blue-700 text-sm mt-2">
          Click on pictures to select them. Selected: {selectedItems.length} / {items.length}
        </p>
      </div>

      {/* Picture Grid */}
      <div className={`grid gap-4 ${
        activity.guidelines.visualSize === 'large' ? 'grid-cols-2' :
        activity.guidelines.visualSize === 'medium' ? 'grid-cols-3' :
        'grid-cols-4'
      }`}>
        {items.map((item) => (
          <PictureCard
            key={item.id}
            item={item}
            onClick={() => handleItemClick(item.id)}
            colorTheme={colorTheme}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={resetActivity}
          className="btn-secondary"
        >
          Reset Activity
        </button>
        {selectedItems.length === items.length && (
          <div className="bg-green-100 border-2 border-green-500 px-6 py-3 rounded-lg">
            <span className="text-green-800 font-bold text-lg">🎉 Great job!</span>
          </div>
        )}
      </div>
    </div>
  );
};

const PictureCard = ({ item, onClick, colorTheme }) => {
  const bgColor = item.matched ? colorTheme.primary : '#FFFFFF';
  const textColor = item.matched ? '#FFFFFF' : colorTheme.text;

  return (
    <button
      onClick={onClick}
      className={`relative aspect-square rounded-xl border-4 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
        item.matched ? 'border-green-400 shadow-lg' : 'border-gray-300 hover:border-purple-300'
      }`}
      style={{ backgroundColor: bgColor }}
    >
      {/* Visual representation using emoji/shapes */}
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-6xl mb-2">
          {getEmojiForWord(item.word)}
        </div>
        <div
          className="font-bold text-lg text-center"
          style={{ color: textColor }}
        >
          {item.word}
        </div>
      </div>

      {/* Check mark for matched items */}
      {item.matched && (
        <div className="absolute top-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center">
          <span className="text-green-600 text-xl">✓</span>
        </div>
      )}
    </button>
  );
};

// Simple emoji mapping for visual representation
function getEmojiForWord(word) {
  const emojiMap = {
    // Animals
    'cow': '🐄', 'pig': '🐷', 'chicken': '🐔', 'horse': '🐴', 'sheep': '🐑',
    'duck': '🦆', 'goat': '🐐', 'turkey': '🦃', 'lion': '🦁', 'elephant': '🐘',
    'giraffe': '🦒', 'monkey': '🐵', 'zebra': '🦓', 'bear': '🐻', 'tiger': '🐯',
    'penguin': '🐧', 'dog': '🐕', 'cat': '🐱', 'fish': '🐠', 'bird': '🐦',
    'hamster': '🐹', 'rabbit': '🐰', 'turtle': '🐢',

    // B sounds
    'ball': '⚽', 'boat': '🚤', 'book': '📖', 'bus': '🚌',
    'baby': '👶', 'bell': '🔔',

    // S sounds
    'sun': '☀️', 'sock': '🧦', 'soap': '🧼', 'seal': '🦭', 'saw': '🪚',
    'sand': '🏖️', 'sit': '💺', 'seven': '7️⃣',

    // P sounds
    'pan': '🍳', 'pen': '✏️', 'pie': '🥧', 'pot': '🍲',
    'pear': '🍐', 'play': '🎮', 'pink': '🩷',

    // T sounds
    'toy': '🧸', 'top': '🔝', 'tea': '🍵', 'ten': '🔟', 'toe': '🦶',
    'two': '2️⃣', 'tree': '🌳', 'tent': '⛺',

    // K sounds
    'car': '🚗', 'key': '🔑', 'cake': '🎂', 'kite': '🪁',
    'king': '🤴', 'can': '🥫', 'cup': '☕',

    // M sounds
    'man': '👨', 'moon': '🌙', 'mom': '👩', 'milk': '🥛', 'mouse': '🐭',
    'map': '🗺️', 'mat': '🧘', 'mop': '🧹',

    // D sounds
    'door': '🚪', 'doll': '🪆', 'dad': '👨',
    'dig': '⛏️', 'dish': '🍽️', 'dance': '💃'
  };

  return emojiMap[word.toLowerCase()] || '🎨';
}

export default PictureMatchingActivity;
