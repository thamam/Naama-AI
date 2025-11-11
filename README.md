# Speech Therapy Activity Generator MVP

A web application for speech therapy clinicians to generate age-appropriate activities for children aged 2-6 using natural language descriptions.

## Prerequisites

Before you begin, make sure you have **Node.js** installed on your computer:

1. Check if Node.js is installed:
   ```bash
   node --version
   ```
   You should see version 16.0.0 or higher (e.g., `v20.11.0`)

2. If Node.js is not installed, download it from: https://nodejs.org
   - Choose the **LTS (Long Term Support)** version
   - Works on Mac, Windows, and Linux

## Installation & Setup

### Step 1: Get the Code

**Option A: Clone the repository (if you have git)**
```bash
git clone <repository-url>
cd Naama-AI
```

**Option B: Download ZIP**
1. Download the project as a ZIP file
2. Extract it to a folder on your computer
3. Open Terminal (Mac/Linux) or Command Prompt (Windows)
4. Navigate to the folder:
   ```bash
   cd path/to/Naama-AI
   ```
   Example:
   - Mac: `cd ~/Downloads/Naama-AI`
   - Windows: `cd C:\Users\YourName\Downloads\Naama-AI`

### Step 2: Install Dependencies

Make sure you're in the project folder (where `package.json` is located), then run:

```bash
npm install
```

This will take 1-2 minutes to download all required packages.

### Step 3: Run the Application

Start the development server:

```bash
npm run dev
```

You should see output like:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 4: Open in Browser

- The app should automatically open in your default browser
- If not, manually open: **http://localhost:3000**
- You should see the "Speech Therapy Activity Generator" page

**That's it! You're ready to use the app.**

## Usage

Once the app is running:

1. **Enter a description** in the text box, like:
   - "Create a 'S' sound practice activity for a 4-year-old"

2. **Click "Generate Activity"** or press Enter

3. **Interact with the activity:**
   - Picture Matching: Click on pictures
   - Sequencing: Drag and drop cards
   - Articulation: Click through words

4. **Customize** using the panel on the right:
   - Change age/difficulty level
   - Switch color themes

5. **Click "New Activity"** to start over

## Troubleshooting

**Port 3000 is already in use?**
- Vite will automatically use port 3001, 3002, etc.
- Check the terminal output for the correct URL

**Module not found errors?**
- Make sure you ran `npm install` first
- Try deleting `node_modules` folder and `package-lock.json`, then run `npm install` again

**Page won't load?**
- Make sure `npm run dev` is still running in the terminal
- Check that you're using the correct URL from the terminal output
- Try a different browser (Chrome, Firefox, Safari, Edge)

## Building for Production

To create a production-ready build:

```bash
npm run build
```

The built files will be in the `dist/` folder. You can deploy these to any static hosting service (Netlify, Vercel, GitHub Pages, etc.)

To preview the production build locally:

```bash
npm run preview
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