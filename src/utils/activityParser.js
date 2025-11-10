import { activityTypes, ageGroups, themeContent, ageGuidelines } from '../data/activityTemplates';

/**
 * Parse natural language input and generate activity configuration
 */
export function parseActivityInput(inputText) {
  const lowerInput = inputText.toLowerCase();

  // Detect age group
  const age = detectAge(lowerInput);

  // Detect activity type
  const type = detectActivityType(lowerInput);

  // Detect theme/content
  const theme = detectTheme(lowerInput, type);

  // Detect specific sound for articulation activities
  const targetSound = detectTargetSound(lowerInput);

  // Generate activity based on detected parameters
  return generateActivity({
    age,
    type,
    theme,
    targetSound,
    originalInput: inputText
  });
}

function detectAge(input) {
  if (input.match(/2[\s-]year|two[\s-]year/)) return ageGroups.TWO_THREE;
  if (input.match(/3[\s-]year|three[\s-]year/)) return ageGroups.THREE_FOUR;
  if (input.match(/4[\s-]year|5[\s-]year|6[\s-]year|four[\s-]year|five[\s-]year|six[\s-]year/)) return ageGroups.FOUR_SIX;

  // Default to middle age group if not specified
  return ageGroups.THREE_FOUR;
}

function detectActivityType(input) {
  // Picture matching keywords
  if (input.match(/match|matching|picture|find|identify/)) {
    return activityTypes.PICTURE_MATCHING;
  }

  // Sequencing keywords
  if (input.match(/sequenc|story|order|step|routine/)) {
    return activityTypes.SEQUENCING;
  }

  // Articulation/sound practice keywords
  if (input.match(/sound|articulation|practice|repeat|say/)) {
    return activityTypes.ARTICULATION;
  }

  // Default to picture matching
  return activityTypes.PICTURE_MATCHING;
}

function detectTheme(input, activityType) {
  // For sequencing activities, look for routine themes
  if (activityType === activityTypes.SEQUENCING) {
    if (input.match(/morning|wake|breakfast/)) return 'morning';
    if (input.match(/bedtime|sleep|night/)) return 'bedtime';
    if (input.match(/school/)) return 'school';
    return 'morning'; // default
  }

  // For other activities, look for animal themes
  if (input.match(/farm/)) return 'farm';
  if (input.match(/zoo/)) return 'zoo';
  if (input.match(/pet/)) return 'pets';
  if (input.match(/animal/)) return 'farm'; // default animal theme

  return null; // will be determined by target sound
}

function detectTargetSound(input) {
  // Look for sound patterns like "'b' sound" or "b sounds" or "letter b"
  const soundMatch = input.match(/['"]?([bsptkmdrfvlngh])['"]?\s*sound/i);
  if (soundMatch) return soundMatch[1].toLowerCase();

  // Look for "practicing [sound]"
  const practiceMatch = input.match(/practic\w*\s+['"]?([bsptkmdrfvlngh])['"]?/i);
  if (practiceMatch) return practiceMatch[1].toLowerCase();

  return null;
}

function generateActivity(config) {
  const { age, type, theme, targetSound, originalInput } = config;
  const guidelines = ageGuidelines[age];

  let activity = {
    id: Date.now(),
    age,
    type,
    theme,
    targetSound,
    guidelines,
    title: '',
    instructions: '',
    items: [],
    customization: {
      difficulty: age,
      colorTheme: 'default',
      itemCount: guidelines.maxItems
    }
  };

  switch (type) {
    case activityTypes.PICTURE_MATCHING:
      activity = generatePictureMatching(activity, guidelines);
      break;
    case activityTypes.SEQUENCING:
      activity = generateSequencing(activity, guidelines);
      break;
    case activityTypes.ARTICULATION:
      activity = generateArticulation(activity, guidelines);
      break;
  }

  return activity;
}

function generatePictureMatching(activity, guidelines) {
  const { targetSound, theme } = activity;

  // Get words based on sound or theme
  let words = [];
  if (targetSound && themeContent.sounds[targetSound]) {
    words = themeContent.sounds[targetSound];
    activity.title = `Find pictures that start with "${targetSound.toUpperCase()}"`;
    activity.instructions = `Help the child find all the pictures that start with the "${targetSound}" sound.`;
  } else {
    const animalTheme = theme || 'farm';
    words = themeContent.animals[animalTheme] || themeContent.animals.farm;
    activity.title = `${animalTheme.charAt(0).toUpperCase() + animalTheme.slice(1)} Animals Matching`;
    activity.instructions = `Help the child match and identify ${animalTheme} animals.`;
  }

  // Limit words based on age guidelines
  const selectedWords = words.slice(0, guidelines.maxItems);

  // Create items with mock image data
  activity.items = selectedWords.map((word, index) => ({
    id: index,
    word,
    matched: false,
    color: getColorForIndex(index)
  }));

  return activity;
}

function generateSequencing(activity, guidelines) {
  const routineType = activity.theme || 'morning';
  const routine = themeContent.routines[routineType];

  activity.title = `${routineType.charAt(0).toUpperCase() + routineType.slice(1)} Routine Story`;
  activity.instructions = `Help the child put the ${routineType} routine steps in the correct order.`;

  // Limit steps based on age
  const maxSteps = Math.min(guidelines.maxItems, routine.length);
  const selectedSteps = routine.slice(0, maxSteps);

  // Shuffle for the activity (child needs to reorder)
  const shuffled = [...selectedSteps].sort(() => Math.random() - 0.5);

  activity.items = shuffled.map((step, index) => ({
    id: index,
    ...step,
    currentPosition: index,
    correctPosition: step.step - 1,
    color: getColorForIndex(index)
  }));

  return activity;
}

function generateArticulation(activity, guidelines) {
  const { targetSound } = activity;
  const sound = targetSound || 's'; // default sound

  const words = themeContent.sounds[sound] || themeContent.sounds.s;
  activity.title = `Practice "${sound.toUpperCase()}" Sound`;
  activity.instructions = `Have the child repeat each word, focusing on the "${sound}" sound at the beginning.`;

  const selectedWords = words.slice(0, guidelines.maxItems);

  activity.items = selectedWords.map((word, index) => ({
    id: index,
    word,
    sound,
    repeated: false,
    color: getColorForIndex(index)
  }));

  return activity;
}

function getColorForIndex(index) {
  const colors = [
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#F59E0B', // amber
    '#10B981', // green
    '#3B82F6', // blue
    '#EF4444', // red
    '#14B8A6', // teal
    '#F97316', // orange
  ];
  return colors[index % colors.length];
}

export default parseActivityInput;
