# Speech Therapy Activity Generator - Usage Guide

## Overview
This MVP web application helps speech therapy clinicians generate age-appropriate activities for children aged 2-6 years using natural language descriptions.

## Features
- **Natural Language Input**: Describe activities in plain English
- **3 Activity Types**: Picture Matching, Sequencing, and Articulation Practice
- **Age-Appropriate Content**: Automatically adjusts complexity based on age (2-3, 3-4, 4-6 years)
- **Interactive Activities**: Click, drag, and interact with visual elements
- **Customization**: Adjust difficulty level and visual themes
- **Client-Side Only**: No backend or data collection

## Getting Started

### Installation
```bash
npm install
```

### Running the Application
```bash
npm run dev
```

The application will open in your browser at `http://localhost:3000`

### Building for Production
```bash
npm run build
npm run preview
```

## How to Use

### 1. Describe Your Activity
In the text box, type a natural language description of the activity you want to create. For example:
- "Create a 'S' sound practice activity for a 4-year-old"
- "Picture matching game for 2-year-old, farm animals"
- "Story sequencing for 5-year-old, morning routine"

### 2. Generate Activity
Click the "Generate Activity" button or press Enter. The system will:
- Parse your description
- Detect age group
- Identify activity type
- Select appropriate content
- Generate an interactive activity

### 3. Use the Activity
The generated activity will display with:
- **Clear instructions** for the clinician
- **Interactive elements** the child can engage with
- **Visual feedback** (colors, checkmarks, animations)
- **Progress tracking**

### 4. Customize (Optional)
Use the customization panel to:
- **Adjust difficulty**: Change age group (2-3, 3-4, 4-6 years)
- **Change theme**: Select different color schemes (Default, Ocean, Forest, Sunset)
- **View activity info**: See item count and complexity level

## Activity Types

### Picture Matching
- **Best for**: Sound identification, vocabulary building
- **How it works**: Children click on pictures that match a criteria (e.g., start with "B")
- **Example**: "Find all pictures that start with 'B' sound"

### Sequencing
- **Best for**: Story comprehension, routine understanding
- **How it works**: Children drag and drop cards to put a story in order
- **Example**: "Morning routine sequencing for a 4-year-old"

### Articulation Practice
- **Best for**: Sound production, word repetition
- **How it works**: Display words one at a time for the child to repeat
- **Example**: "Practice 'S' sounds with a 3-year-old"

## Age-Appropriate Guidelines

### 2-3 Years
- **Items**: 3-4 items max
- **Instructions**: Single-step
- **Visuals**: Large, high-contrast
- **Complexity**: Very simple
- **Focus**: Sound repetition, basic matching

### 3-4 Years
- **Items**: 5-6 items
- **Instructions**: 2-step
- **Visuals**: Colorful, medium-sized
- **Complexity**: Medium
- **Focus**: Categorization, basic sequencing

### 4-6 Years
- **Items**: 8-10 items
- **Instructions**: Multi-step
- **Visuals**: Normal-sized, more detailed
- **Complexity**: More complex
- **Focus**: Articulation, sentence building, story sequencing

## Testing Scenarios

### Scenario 1: Articulation Practice
**Input**: "Create a 'S' sound practice activity for a 4-year-old"

**Expected Result**:
- Activity Type: Articulation
- Age: 4-6 years
- Words: sun, sock, soap, seal, saw, sand, sit, seven
- Interactive word cards with sound badges
- Navigation between words
- Progress tracking

### Scenario 2: Picture Matching
**Input**: "Picture matching game for 2-year-old, farm animals"

**Expected Result**:
- Activity Type: Picture Matching
- Age: 2-3 years
- Animals: cow, pig, chicken, horse (4 items max)
- Large visual cards
- Simple click interaction
- Completion feedback

### Scenario 3: Story Sequencing
**Input**: "Story sequencing for 5-year-old, morning routine"

**Expected Result**:
- Activity Type: Sequencing
- Age: 4-6 years
- Steps: wake up, brush teeth, eat breakfast, get dressed
- Drag-and-drop cards
- Order validation
- Answer guide for clinician

## Feedback Collection Guide

When demoing to clinicians, collect feedback on:

### Usability
- [ ] Was the natural language input intuitive?
- [ ] Did the generated activities match expectations?
- [ ] Were the instructions clear?
- [ ] Was customization easy to use?

### Content Quality
- [ ] Were activities age-appropriate?
- [ ] Was the content therapeutically useful?
- [ ] Were there enough variety in words/themes?
- [ ] Would you use these in real therapy sessions?

### Feature Requests
- [ ] What activity types are missing?
- [ ] What customization options would be helpful?
- [ ] What themes/content would you like to see?
- [ ] What age ranges need better support?

### Technical
- [ ] Did everything load quickly (< 5 seconds)?
- [ ] Were there any bugs or errors?
- [ ] Was the interface responsive?
- [ ] Did interactions feel smooth?

## Limitations (MVP Scope)

### Out of Scope for MVP
- Patient data storage
- Progress tracking across sessions
- Activity library/saving favorites
- Multi-user support
- Mobile app version
- Printing activities
- Real voice recording/playback
- Advanced analytics

### Current Limitations
- Uses placeholder emojis instead of professional illustrations
- Limited to 3 activity types
- Basic customization options
- No real-time collaboration
- English language only

## Technical Details

### Stack
- **Frontend**: React 18
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Deployment**: Static site (can deploy to Netlify, Vercel, GitHub Pages)

### Browser Requirements
- Modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- No backend or database required

## Troubleshooting

### Activities not generating
- Check console for errors
- Ensure input text is not empty
- Try one of the example prompts

### Drag and drop not working
- Ensure you're using a modern browser
- Try clicking instead of dragging
- Check if JavaScript is enabled

### Visuals not displaying
- Emojis require Unicode support
- Try a different browser
- Check font rendering settings

## Next Steps

Based on clinician feedback, consider adding:
1. More activity types (e.g., rhyming, categorization)
2. Professional illustrations instead of emojis
3. Real audio playback for pronunciation
4. Activity library and favorites
5. Export/print functionality
6. Mobile optimization
7. More themes and customization options

## Support

For issues or feature requests, please contact the development team.
