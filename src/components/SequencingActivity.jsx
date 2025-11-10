import React, { useState } from 'react';

const SequencingActivity = ({ activity, colorTheme }) => {
  const [items, setItems] = useState(activity.items);
  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();

    if (!draggedItem || draggedItem.id === targetItem.id) {
      return;
    }

    const draggedIndex = items.findIndex(i => i.id === draggedItem.id);
    const targetIndex = items.findIndex(i => i.id === targetItem.id);

    const newItems = [...items];
    newItems[draggedIndex] = items[targetIndex];
    newItems[targetIndex] = items[draggedIndex];

    setItems(newItems);
    setDraggedItem(null);
  };

  const checkOrder = () => {
    return items.every((item, index) => item.step === index + 1);
  };

  const resetActivity = () => {
    const shuffled = [...activity.items].sort(() => Math.random() - 0.5);
    setItems(shuffled);
  };

  const isCorrect = checkOrder();

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-purple-100 border-l-4 border-purple-500 p-4 rounded-lg">
        <p className="text-purple-900 font-medium">{activity.instructions}</p>
        <p className="text-purple-700 text-sm mt-2">
          Drag and drop the cards to put them in the correct order.
        </p>
      </div>

      {/* Sequence Cards */}
      <div className={`grid gap-4 ${
        activity.guidelines.visualSize === 'large' ? 'grid-cols-1' :
        activity.guidelines.visualSize === 'medium' ? 'grid-cols-2' :
        'grid-cols-2 lg:grid-cols-4'
      }`}>
        {items.map((item, index) => (
          <SequenceCard
            key={item.id}
            item={item}
            index={index}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            colorTheme={colorTheme}
            isCorrect={isCorrect}
          />
        ))}
      </div>

      {/* Controls and Feedback */}
      <div className="flex justify-center gap-4 flex-wrap">
        <button
          onClick={resetActivity}
          className="btn-secondary"
        >
          Shuffle Again
        </button>

        {isCorrect && (
          <div className="bg-green-100 border-2 border-green-500 px-6 py-3 rounded-lg">
            <span className="text-green-800 font-bold text-lg">🎉 Perfect order!</span>
          </div>
        )}
      </div>

      {/* Answer Guide (for clinician) */}
      <details className="bg-gray-100 rounded-lg p-4">
        <summary className="cursor-pointer font-semibold text-gray-700">
          Show Answer Guide (for clinician)
        </summary>
        <div className="mt-3 space-y-2">
          {activity.items
            .sort((a, b) => a.step - b.step)
            .map((item) => (
              <div key={item.id} className="text-sm text-gray-600">
                Step {item.step}: {item.action}
              </div>
            ))}
        </div>
      </details>
    </div>
  );
};

const SequenceCard = ({ item, index, onDragStart, onDragOver, onDrop, colorTheme, isCorrect }) => {
  const isInCorrectPosition = item.step === index + 1;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, item)}
      className={`relative rounded-xl border-4 p-6 cursor-move transition-all duration-300 transform hover:scale-105 ${
        isCorrect && isInCorrectPosition
          ? 'border-green-400 bg-green-50'
          : 'border-purple-300 bg-white hover:border-purple-500'
      }`}
      style={{
        borderColor: isCorrect ? '#4ADE80' : colorTheme.primary
      }}
    >
      {/* Position number */}
      <div className="absolute top-2 left-2 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md border-2"
        style={{ borderColor: colorTheme.primary }}
      >
        <span className="font-bold text-lg" style={{ color: colorTheme.primary }}>
          {index + 1}
        </span>
      </div>

      {/* Correct step indicator (shown when complete) */}
      {isCorrect && (
        <div className="absolute top-2 right-2 bg-green-500 rounded-full w-8 h-8 flex items-center justify-center">
          <span className="text-white text-lg">✓</span>
        </div>
      )}

      {/* Visual representation */}
      <div className="flex flex-col items-center justify-center space-y-3 mt-6">
        <div className="text-6xl">
          {getEmojiForAction(item.action)}
        </div>
        <div className="text-center">
          <p className="font-bold text-lg capitalize" style={{ color: colorTheme.text }}>
            {item.action}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
};

// Emoji mapping for routine actions
function getEmojiForAction(action) {
  const emojiMap = {
    'wake up': '🌅',
    'brush teeth': '🪥',
    'eat breakfast': '🍳',
    'get dressed': '👕',
    'eat dinner': '🍽️',
    'take bath': '🛁',
    'go to bed': '😴',
    'pack backpack': '🎒',
    'ride bus': '🚌',
    'sit in class': '✏️',
    'play outside': '⚽'
  };

  return emojiMap[action.toLowerCase()] || '📋';
}

export default SequencingActivity;
