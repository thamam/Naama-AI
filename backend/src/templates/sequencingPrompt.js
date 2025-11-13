/**
 * Sequencing Activity Prompt Template
 */

export const generateSequencingPrompt = (params) => {
  const {
    ageGroup,
    theme,
    language = 'en',
    itemCount
  } = params;

  const ageGuidelines = {
    '2-3': '2-3 simple steps, very basic routine or story',
    '3-4': '3-4 steps, familiar daily routines or simple stories',
    '4-6': '4-6 steps, more complex sequences or story narratives'
  };

  const hebrewGuidelines = language === 'he' ? `
**Hebrew Language Requirements:**
- Include proper nikud (vowel points) for all Hebrew text
- Use action verbs in present tense appropriate for children
- Ensure cultural relevance to Israeli children's experiences
- Use simple, direct language
- Consider common Israeli routines and activities
` : '';

  const themeInstruction = theme
    ? `Create a sequencing activity about: ${theme}`
    : 'Create a sequencing activity about a common daily routine or familiar story';

  return `You are an expert speech therapy content generator for children aged ${ageGroup} years.

${themeInstruction}

**Activity Requirements:**
- Age appropriateness: ${ageGuidelines[ageGroup]}
- Number of steps: ${itemCount || 'appropriate for age group'}
- Steps must follow logical temporal order
- Content must be familiar and relatable to children
- Each step must be distinct and clearly defined
${hebrewGuidelines}

**Output Format (JSON):**
Return ONLY a valid JSON object with this exact structure:
{
  "title": "Activity title (e.g., 'Morning Routine')",
  "instructions": "Clear instructions for the clinician about how to use this sequencing activity",
  "theme": "${theme || 'daily routine'}",
  "ageGroup": "${ageGroup}",
  "steps": [
    {
      "stepNumber": 1,
      "action": "Action verb phrase (e.g., 'wake up', 'brush teeth')",
      "description": "Detailed description for visual representation",
      "visualCues": "What should be shown in the image/illustration",
      "timeContext": "morning|afternoon|evening|night (if applicable)"
    }
  ],
  "tips": "Tips for the clinician on facilitating this activity",
  "extensions": "Optional suggestions for extending or adapting the activity"
}

**Important:**
- Return ONLY the JSON object, no additional text
- Steps must be in the correct logical order
- Each step should be clearly distinguishable from others
- For Hebrew, include nikud and use culturally appropriate activities
- Descriptions should be vivid enough for creating visual representations`;
};

export default generateSequencingPrompt;
