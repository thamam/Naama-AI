/**
 * Articulation Practice Activity Prompt Template
 */

export const generateArticulationPrompt = (params) => {
  const {
    ageGroup,
    targetSound,
    language = 'en',
    soundPosition = 'initial', // initial, medial, final
    itemCount
  } = params;

  const ageGuidelines = {
    '2-3': '3-4 very simple words, single syllable when possible',
    '3-4': '5-6 words, 1-2 syllables, clear pronunciation',
    '4-6': '8-10 words, varied syllable counts, can include simple phrases'
  };

  const hebrewGuidelines = language === 'he' ? `
**Hebrew Language Requirements:**
- Include proper nikud (vowel points) for all words
- Consider Hebrew phonology and sound system
- Hebrew target sounds: ב, פ, כ, ת, ד, ג, ק, ר, ש, צ, ח, etc.
- Account for dagesh (dot) in letters where relevant
- Include syllable breakdown for complex words
- Use words from children's everyday vocabulary
- Consider which sounds are typically challenging for Hebrew-speaking children
` : '';

  if (!targetSound) {
    throw new Error('targetSound is required for articulation activities');
  }

  const positionGuidance = {
    'initial': 'at the beginning of words',
    'medial': 'in the middle of words',
    'final': 'at the end of words',
    'all': 'in various positions within words'
  };

  return `You are an expert speech therapist creating articulation practice materials for children aged ${ageGroup} years.

Create an articulation practice activity targeting the "${targetSound}" sound ${positionGuidance[soundPosition]}.

**Activity Requirements:**
- Age appropriateness: ${ageGuidelines[ageGroup]}
- Number of words: ${itemCount || 'appropriate for age group'}
- Target sound: "${targetSound}"
- Sound position: ${soundPosition}
- Words must be phonetically appropriate and commonly used
- Progression from simple to slightly more complex within the set
${hebrewGuidelines}

**Output Format (JSON):**
Return ONLY a valid JSON object with this exact structure:
{
  "title": "Practice '${targetSound}' Sound",
  "instructions": "Detailed instructions for the clinician on how to conduct this articulation practice",
  "targetSound": "${targetSound}",
  "soundPosition": "${soundPosition}",
  "ageGroup": "${ageGroup}",
  "words": [
    {
      "word": "the word",
      "phonetic": "phonetic transcription (IPA if possible)",
      "syllables": number,
      "syllableBreakdown": "syl-la-bles",
      "soundPosition": "initial|medial|final",
      "difficulty": "easy|medium|hard (relative to age group)",
      "visualCue": "Description for visual representation",
      "practiceTip": "Specific tip for practicing this word"
    }
  ],
  "warmUpExercises": [
    "Mouth/tongue positioning exercises before starting"
  ],
  "tips": "General tips for practicing this sound with children of this age",
  "commonMistakes": "Common pronunciation mistakes to watch for",
  "progressionSuggestions": "How to progress once child masters these words"
}

**Important:**
- Return ONLY the JSON object, no additional text
- Words must actually contain the target sound in the specified position
- For Hebrew, include precise nikud and consider Hebrew phonology
- Arrange words from easiest to slightly harder within the age-appropriate range
- Include practical, actionable tips for clinicians
- Visual cues should help children associate the word with its meaning`;
};

export default generateArticulationPrompt;
