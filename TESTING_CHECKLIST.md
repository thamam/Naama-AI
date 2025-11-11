# Testing Checklist for Speech Therapy Activity Generator MVP

## Pre-Test Setup
- [ ] Run `npm install` to install dependencies
- [ ] Run `npm run dev` to start the development server
- [ ] Verify the application opens in browser at http://localhost:3000

## Test Scenario 1: Articulation Practice (4-year-old, 'S' sound)

### Input
Enter: "Create a 'S' sound practice activity for a 4-year-old"

### Expected Behavior
- [ ] Activity generates within 1-2 seconds
- [ ] Title: "Practice 'S' Sound"
- [ ] Age badge shows "4-6 years"
- [ ] Activity type shows "Articulation Practice"
- [ ] Displays 8-10 words starting with 'S' (sun, sock, soap, seal, saw, sand, sit, seven)
- [ ] Each word has emoji visual representation
- [ ] Sound badge shows "S" on each card
- [ ] Large word card displayed prominently
- [ ] Navigation arrows (Previous/Next) work correctly
- [ ] Clicking on word marks it as completed (green checkmark)
- [ ] Progress counter updates (e.g., "3 / 8")
- [ ] All words grid shows all cards below
- [ ] Active word is highlighted in grid
- [ ] Success message appears when all words are practiced
- [ ] Audio feedback plays on word click (optional, may not work in all browsers)

### Customization Panel
- [ ] Shows "Difficulty Level" with 3 age options
- [ ] Shows "Visual Theme" with 4 color themes
- [ ] Activity info shows correct type, item count, and complexity
- [ ] Changing difficulty updates the activity appropriately
- [ ] Changing theme updates colors throughout the activity

## Test Scenario 2: Picture Matching (2-year-old, Farm Animals)

### Input
Enter: "Picture matching game for 2-year-old, farm animals"

### Expected Behavior
- [ ] Activity generates within 1-2 seconds
- [ ] Title: "Farm Animals Matching"
- [ ] Age badge shows "2-3 years"
- [ ] Activity type shows "Picture Matching"
- [ ] Displays 4 farm animals (cow, pig, chicken, horse)
- [ ] Large card size (2 columns grid)
- [ ] Each animal has emoji representation
- [ ] Instructions are clear for clinician
- [ ] Clicking on card marks it as matched (green border, checkmark)
- [ ] Progress counter shows selected/total (e.g., "2 / 4")
- [ ] Cards can be unmarked by clicking again
- [ ] Success message "Great job!" appears when all are selected
- [ ] Reset button works and clears all selections

### Customization Panel
- [ ] Can change to 3-4 age range (should show ~6 animals)
- [ ] Can change to 4-6 age range (should show more animals)
- [ ] Color themes update card colors
- [ ] Activity info updates when customizations change

## Test Scenario 3: Story Sequencing (5-year-old, Morning Routine)

### Input
Enter: "Story sequencing for 5-year-old, morning routine"

### Expected Behavior
- [ ] Activity generates within 1-2 seconds
- [ ] Title: "Morning Routine Story"
- [ ] Age badge shows "4-6 years"
- [ ] Activity type shows "Sequencing"
- [ ] Displays 4 steps: wake up, brush teeth, eat breakfast, get dressed
- [ ] Each card has emoji and description
- [ ] Cards are shuffled initially (not in order)
- [ ] Position number shown on each card (1, 2, 3, 4)
- [ ] Cards are draggable
- [ ] Drag and drop works to reorder cards
- [ ] Cards swap positions when dropped
- [ ] Green borders appear when sequence is correct
- [ ] Checkmarks appear on correctly positioned cards
- [ ] Success message "Perfect order!" when complete
- [ ] "Shuffle Again" button works
- [ ] Answer guide is hidden in collapsible section
- [ ] Answer guide shows correct order for clinician

### Customization Panel
- [ ] Can adjust age ranges
- [ ] Different age ranges may show different number of steps
- [ ] Theme changes affect card colors
- [ ] Activity info is accurate

## General UI/UX Tests

### Layout and Design
- [ ] Header is clear and centered
- [ ] Input textarea is large enough for comfortable typing
- [ ] Generate button is prominent and easy to click
- [ ] Example prompts are visible and clickable
- [ ] Clicking example prompt fills the input field
- [ ] Activity cards have clear borders and good spacing
- [ ] Customization panel is easy to read and use
- [ ] "New Activity" button is easy to find
- [ ] Colors are appropriate for children's content
- [ ] Text is readable (good contrast)
- [ ] No visual glitches or overlapping elements

### Interactions
- [ ] Hover effects work on all interactive elements
- [ ] Button animations (scale on hover) work smoothly
- [ ] Loading animation appears during generation
- [ ] All buttons respond to clicks
- [ ] No broken interactions
- [ ] Generate button disabled when input is empty
- [ ] Pressing Enter in textarea generates activity

### Responsiveness (Optional for MVP)
- [ ] Works on desktop browsers (Chrome, Firefox, Safari, Edge)
- [ ] Layout doesn't break on different screen sizes
- [ ] Text remains readable at different sizes

## Edge Cases

### Input Variations
- [ ] Test: "b sound activity" (minimal input)
- [ ] Test: "I need a very complex articulation practice activity for a 6 year old child who is working on their 's' sounds" (verbose input)
- [ ] Test: "farm animals" (no age specified - should default to 3-4)
- [ ] Test: "matching game" (no theme or age - should use defaults)
- [ ] Test: Empty input (should not generate, button disabled)

### Activity Behavior
- [ ] Resetting activity and generating new one works
- [ ] Switching between different activities works
- [ ] Customizing and then generating new activity works
- [ ] Multiple rapid clicks don't break the UI
- [ ] Long activity sessions don't cause performance issues

## Performance

- [ ] Initial page load is fast (< 2 seconds)
- [ ] Activity generation is fast (< 1 second perceived)
- [ ] No lag when interacting with activities
- [ ] No console errors in browser DevTools
- [ ] Build completes without errors (`npm run build`)
- [ ] Build has no warnings about code quality

## Browser Compatibility

### Chrome/Edge
- [ ] All features work
- [ ] Audio feedback works (optional)
- [ ] Drag and drop works

### Firefox
- [ ] All features work
- [ ] Visual themes render correctly
- [ ] Interactions are smooth

### Safari
- [ ] All features work
- [ ] Emojis render correctly
- [ ] Gradients display properly

## Accessibility (Bonus)

- [ ] Buttons have clear labels
- [ ] Interactive elements are keyboard accessible (Tab key)
- [ ] Color contrast is sufficient
- [ ] Text is legible

## Final Checks

- [ ] No console errors when using the app
- [ ] No visual bugs or glitches
- [ ] All 3 activity types work as expected
- [ ] Customization works for all activity types
- [ ] Documentation (README, USAGE_GUIDE) matches actual behavior
- [ ] Application is demo-ready for clinicians

## Clinician Demo Preparation

- [ ] Prepare 2-3 activities in advance to show
- [ ] Have example prompts ready
- [ ] Be prepared to explain customization options
- [ ] Know how to reset and generate new activities quickly
- [ ] Have feedback form or questions ready
- [ ] Take notes during demo for improvements

## Success Criteria (MVP Goals)

- [x] Clinician can input natural language description
- [x] System generates appropriate activity based on age
- [x] Activity is interactive and visually appropriate
- [x] Clinician can customize at least 2 parameters (age, theme)
- [x] Generated activity appears in < 5 seconds
- [ ] Demo-able to 3-5 clinicians for feedback
