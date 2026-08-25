# AI Logo Maker - Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from modern Indian tech/startup websites (like Razorpay, CRED, Paytm) combined with creative SaaS tools (like Canva, Looka). The design emphasizes warmth, creativity, and professional polish with distinctly Indian visual language.

## Core Design Principles

1. **Warm Indian Aesthetic**: Bright gradient backgrounds featuring saffron-to-pink transitions, vibrant color accents, and welcoming visual language
2. **Progressive Disclosure**: Step-by-step wizard that guides users through logo creation without overwhelming
3. **Celebration of Output**: Generated logos should feel like achievements with prominent display and easy actions
4. **Persistent Memory**: Logo history creates a portfolio feel, showing creative journey

## Typography

**Font Selection**: Use Google Fonts
- Primary: Inter or Poppins (600-700 weight for headings, 400-500 for body)
- Accent: Optional Devanagari-compatible font for Indian touch

**Hierarchy**:
- Page Titles: text-3xl to text-4xl, font-bold
- Step Titles: text-2xl, font-semibold
- Section Headings: text-xl, font-semibold
- Body Text: text-base, font-normal
- Helper Text: text-sm, text-gray-600
- Button Text: text-base, font-medium

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Section padding: py-12 to py-20
- Card padding: p-6 to p-8
- Element gaps: gap-4 to gap-6
- Form field spacing: space-y-4

**Container Strategy**:
- Max-width: max-w-6xl for main content areas
- Wizard steps: max-w-2xl centered for focus
- History grid: max-w-7xl for spacious display

## Color Palette Guidelines

**Background Treatments**:
- Primary gradient: Saffron (#FF9933) to Pink (#FF69B4) diagonal gradients
- Secondary gradient: Warm orange to coral tones
- Neutral base: Off-white (#FAFAFA) for content areas
- Card backgrounds: White with subtle shadows

**Accent Colors**:
- Primary CTA: Deep saffron or vibrant blue
- Success states: Green (#10B981)
- Warning/Info: Amber (#F59E0B)
- Text: Gray-900 for primary, Gray-600 for secondary

**Indian-Inspired Patterns**: Optional subtle mandala or geometric patterns in background (very low opacity, 0.03-0.05)

## Component Library

### Authentication Pages (Login/Register)

**Layout**: Centered card on gradient background
- Card: max-w-md, rounded-2xl, shadow-2xl, bg-white
- Tab Navigation: Two tabs with underline indicator, smooth transition
- Form Fields: 
  - Full-width inputs with rounded-lg borders
  - Labels above fields (text-sm, font-medium)
  - Input height: h-12
  - Focus states with ring-2 in brand color
- Submit Button: Full-width, h-12, rounded-lg, bold text
- Spacing: space-y-6 between form sections

### Multi-Step Wizard Interface

**Progress Indicator**: 
- Horizontal stepper showing 6 steps at top
- Current step highlighted with gradient background
- Completed steps with checkmark icons
- Future steps in muted gray

**Step Container**:
- Card: bg-white, rounded-2xl, shadow-lg
- Padding: p-8 to p-12
- Min-height ensures no jumping between steps
- Smooth fade transitions (300ms) when changing steps

**Step 1 - Logo Name**:
- Large input field (h-14, text-lg)
- Placeholder with inspiring copy
- Character counter (optional)

**Step 2 - Description**:
- Textarea: min-h-32, rounded-lg
- Helpful placeholder with examples
- Word count display

**Step 3 - Color Palette**:
- Grid of color cards: 5 preset cards (grid-cols-5 on desktop, grid-cols-3 on mobile)
- Each card: w-20, h-20, rounded-xl, with color preview and label
- Selected state: ring-4 with brand color, scale-105 transform
- Custom color picker below presets

**Step 4 - Logo Style Selection**:
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Each style card:
  - Rounded-xl borders
  - Padding: p-6
  - Icon placeholder at top
  - Style name in bold
  - Brief description in smaller text
  - Hover: shadow-md, scale-102
  - Selected: gradient border, bg-gradient-to-br accent

**Step 5 - Design Ideas**:
- List of radio options with descriptions
- Each option in its own card (p-4, rounded-lg)
- Special highlight for "Let AI decide" option (gradient background)

**Step 6 - Generation & Results**:
- Large centered area for generated logo
- Loading state: Spinner with "Generating your logo..." text
- Generated logo display:
  - Image in rounded-2xl container
  - Shadow-2xl for prominence
  - Fade-in animation (animate-fade-in)
- Action buttons row below image:
  - Download button: gradient background, icon + text
  - Regenerate button: outline style with icon
  - Both buttons: h-12, rounded-lg, gap-2 for icon spacing

**Navigation Buttons**:
- Previous: Outline style, rounded-lg
- Continue/Generate: Gradient fill, rounded-lg
- Both: h-12, px-8, font-medium
- Fixed position at bottom of wizard card

### Logo History Section

**Section Layout**:
- Below wizard area with spacing (mt-16)
- Heading: "Your Logo History" (text-2xl, font-bold)
- Subtext: Count of total logos generated

**Grid Layout**:
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Gap: gap-6
- Each history card:
  - bg-white, rounded-xl, shadow-md
  - Padding: p-4
  - Image area: aspect-square, rounded-lg, overflow-hidden
  - Prompt text: text-sm, text-gray-600, line-clamp-2
  - Re-generate button: text-sm, mt-3, full-width, outline style
  - Hover: shadow-lg, scale-102 transition

### Welcome Message

**Position**: Top of main app page after login
- Text: "Welcome, [username] 👋 Let's craft your dream logo!"
- Style: text-xl, font-semibold, gradient text
- Container: p-6, mb-8

### Footer

**Layout**: Full-width, centered text
- Text: "© 2025 Indian AI Logo Maker | Made with ❤️ in India"
- Style: text-sm, text-gray-600
- Padding: py-8
- Border-top: border-gray-200

## Animations

**Transitions**:
- Step changes: 300ms fade with slight scale
- Button hovers: 200ms all transitions
- Card hovers: 300ms shadow and transform
- Logo appearance: 500ms fade-in with scale from 0.95 to 1

**Loading States**:
- Spinner: Rotating gradient ring
- Text pulse during generation
- Smooth opacity transitions

## Responsive Behavior

**Mobile (< 768px)**:
- Single column layouts throughout
- Wizard card: full-width with m-4
- Color grid: 3 columns instead of 5
- Style grid: 1 column
- History grid: 1 column
- Reduced padding (p-4 instead of p-8)
- Sticky navigation buttons at bottom

**Tablet (768px - 1024px)**:
- Style grid: 2 columns
- History grid: 2 columns
- Maintained card approach

**Desktop (> 1024px)**:
- Full grid layouts (3 columns)
- Generous spacing
- Larger wizard card (max-w-2xl to max-w-3xl depending on step)

## Images

**Hero Section**: Not applicable for this application (wizard-based flow)

**Icon Usage**: 
- Use Lucide React icons for all interface icons
- Step indicators, buttons, and navigation
- Style preview icons in Step 4 (simple geometric shapes representing each style)

**Generated Logos**: Display actual AI-generated images from Cloudflare Workers AI (FLUX.1 [schnell])

## Special Considerations

- All interactive elements need clear hover, focus, and active states
- Gradient backgrounds should be subtle enough to not interfere with readability
- Form validation states (error borders in red-500, success in green-500)
- Smooth scrolling when navigating between steps
- LocalStorage management should be seamless and invisible to users
- Empty states for logo history when no logos generated yet (illustration + encouraging text)