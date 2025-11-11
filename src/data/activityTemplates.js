// Activity templates for different types and age groups

export const activityTypes = {
  PICTURE_MATCHING: 'picture_matching',
  SEQUENCING: 'sequencing',
  ARTICULATION: 'articulation'
};

export const ageGroups = {
  TWO_THREE: '2-3',
  THREE_FOUR: '3-4',
  FOUR_SIX: '4-6'
};

// Content data for different themes
export const themeContent = {
  animals: {
    farm: ['cow', 'pig', 'chicken', 'horse', 'sheep', 'duck', 'goat', 'turkey'],
    zoo: ['lion', 'elephant', 'giraffe', 'monkey', 'zebra', 'bear', 'tiger', 'penguin'],
    pets: ['dog', 'cat', 'fish', 'bird', 'hamster', 'rabbit', 'turtle']
  },
  sounds: {
    b: ['ball', 'bear', 'boat', 'book', 'bus', 'baby', 'bell', 'bird'],
    s: ['sun', 'sock', 'soap', 'seal', 'saw', 'sand', 'sit', 'seven'],
    p: ['pig', 'pan', 'pen', 'pie', 'pot', 'pear', 'play', 'pink'],
    t: ['toy', 'top', 'tea', 'ten', 'toe', 'two', 'tree', 'tent'],
    k: ['cat', 'car', 'key', 'cake', 'kite', 'king', 'can', 'cup'],
    m: ['man', 'moon', 'mom', 'milk', 'mouse', 'map', 'mat', 'mop'],
    d: ['dog', 'door', 'duck', 'doll', 'dad', 'dig', 'dish', 'dance']
  },
  routines: {
    morning: [
      { step: 1, action: 'wake up', description: 'Child waking up in bed' },
      { step: 2, action: 'brush teeth', description: 'Child brushing teeth' },
      { step: 3, action: 'eat breakfast', description: 'Child eating breakfast' },
      { step: 4, action: 'get dressed', description: 'Child putting on clothes' }
    ],
    bedtime: [
      { step: 1, action: 'eat dinner', description: 'Child eating dinner' },
      { step: 2, action: 'take bath', description: 'Child taking a bath' },
      { step: 3, action: 'brush teeth', description: 'Child brushing teeth' },
      { step: 4, action: 'go to bed', description: 'Child sleeping in bed' }
    ],
    school: [
      { step: 1, action: 'pack backpack', description: 'Child packing school bag' },
      { step: 2, action: 'ride bus', description: 'Child on school bus' },
      { step: 3, action: 'sit in class', description: 'Child sitting at desk' },
      { step: 4, action: 'play outside', description: 'Child playing at recess' }
    ]
  }
};

// Age-specific guidelines
export const ageGuidelines = {
  [ageGroups.TWO_THREE]: {
    maxItems: 4,
    steps: 1,
    complexity: 'simple',
    instructions: 'single-step',
    visualSize: 'large'
  },
  [ageGroups.THREE_FOUR]: {
    maxItems: 6,
    steps: 2,
    complexity: 'medium',
    instructions: '2-step',
    visualSize: 'medium'
  },
  [ageGroups.FOUR_SIX]: {
    maxItems: 10,
    steps: 3,
    complexity: 'complex',
    instructions: 'multi-step',
    visualSize: 'normal'
  }
};

// Simple color themes for customization
export const colorThemes = {
  default: {
    primary: '#8B5CF6',
    secondary: '#EC4899',
    background: '#F3F4F6',
    text: '#1F2937'
  },
  ocean: {
    primary: '#0EA5E9',
    secondary: '#06B6D4',
    background: '#E0F2FE',
    text: '#0C4A6E'
  },
  forest: {
    primary: '#10B981',
    secondary: '#34D399',
    background: '#D1FAE5',
    text: '#065F46'
  },
  sunset: {
    primary: '#F97316',
    secondary: '#FB923C',
    background: '#FFEDD5',
    text: '#7C2D12'
  }
};

export default {
  activityTypes,
  ageGroups,
  themeContent,
  ageGuidelines,
  colorThemes
};
