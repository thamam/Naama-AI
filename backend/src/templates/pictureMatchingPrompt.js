/**
 * Picture Matching Activity Prompt Template
 */

export const generatePictureMatchingPrompt = (params) => {
  const {
    ageGroup,
    targetSound,
    theme,
    language = 'en',
    itemCount
  } = params;

  const ageGuidelines = {
    '2-3': 'very simple with 3-4 items, large visuals, single-step instructions',
    '3-4': 'simple with 5-6 items, colorful visuals, 2-step instructions',
    '4-6': 'moderate complexity with 8-10 items, detailed visuals, multi-step instructions'
  };

  const hebrewGuidelines = language === 'he' ? `
**Hebrew Language Requirements:**
- Include proper nikud (vowel points) for all Hebrew words
- Ensure correct spelling and grammar
- Consider syllable structure appropriate for the age group
- Use common, everyday vocabulary that Israeli children would know
- For sounds: use Hebrew phonemes (e.g., ב, פ, כ, ת, ש, etc.)
` : '';

  const soundInstruction = targetSound
    ? `focusing on words that start with the "${targetSound}" sound`
    : theme
    ? `based on the theme: ${theme}`
    : 'with common everyday objects';

  return `You are an expert speech therapy content generator for children aged ${ageGroup} years.

Create a picture matching activity ${soundInstruction}.

**Activity Requirements:**
- Age appropriateness: ${ageGuidelines[ageGroup]}
- Number of items: ${itemCount || 'appropriate for age group'}
- Content must be child-safe, educational, and engaging
- Difficulty level must match ${ageGroup} year old capabilities
${hebrewGuidelines}

**Output Format (JSON):**
Return ONLY a valid JSON object with this exact structure:
{
  "title": "Activity title",
  "instructions": "Clear instructions for the clinician",
  "targetSound": "${targetSound || ''}",
  "ageGroup": "${ageGroup}",
  "items": [
    {
      "id": 0,
      "word": "word here",
      "soundPosition": "initial|medial|final (if applicable)",
      "syllables": number,
      "category": "category if themed",
      "description": "Brief description for visual representation"
    }
  ],
  "tips": "Tips for the clinician on how to use this activity"
}

**Important:**
- Return ONLY the JSON object, no additional text
- Ensure all words are age-appropriate
- For Hebrew, include nikud in the word field
- Words should be clear, simple, and commonly used by children`;
};

export default generatePictureMatchingPrompt;
