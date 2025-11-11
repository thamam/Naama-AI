# Speech Therapy Activity Generator MVP

A web application for speech therapy clinicians to generate age-appropriate activities for children aged 2-6 using natural language descriptions.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Features

- 🎯 **Natural Language Input**: Describe activities in plain English
- 🎨 **3 Activity Types**: Picture Matching, Sequencing, Articulation Practice
- 👶 **Age-Appropriate**: Auto-adjusts complexity for ages 2-3, 3-4, and 4-6
- 🎮 **Interactive**: Click, drag, and interact with visual elements
- 🎨 **Customizable**: Adjust difficulty and visual themes
- 🔒 **Privacy-First**: Client-side only, no data collection

## Example Prompts

Try these to get started:

1. "Create a 'S' sound practice activity for a 4-year-old"
2. "Picture matching game for 2-year-old, farm animals"
3. "Story sequencing for 5-year-old, morning routine"

## Activity Types

### Picture Matching
Children click on pictures that match a criteria (e.g., start with a specific sound)

### Sequencing
Drag and drop cards to put a story or routine in the correct order

### Articulation Practice
Interactive word cards for practicing specific sounds with visual cues

## Documentation

See [USAGE_GUIDE.md](./USAGE_GUIDE.md) for detailed instructions, testing scenarios, and feedback collection guidelines.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Client-side only (no backend)

## MVP Scope

**Included:**
- 3 activity types
- Age-based filtering (2-3, 3-4, 4-6 years)
- Basic customization (difficulty, themes)
- Interactive preview
- Natural language parsing

**Not Included (Future Enhancements):**
- Patient data storage
- Progress tracking
- Activity library
- Multi-user support
- Mobile optimization
- Professional illustrations

## License

Private - For evaluation purposes only