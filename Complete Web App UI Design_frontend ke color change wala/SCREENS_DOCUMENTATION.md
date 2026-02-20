# 🎨 UI Screens Overview

## Complete Application Screens

### 1. 🔐 Authentication Screens

#### Login Page (`/login`)
- Animated gradient background (Indigo → Purple → Cyan)
- Glass morphism card with backdrop blur
- Floating animated orbs
- Email and password inputs with icons
- "Remember me" checkbox
- Forgot password link
- Animated login button with loading state
- Link to registration

#### Register Page (`/register`)
- Similar design to login
- Additional fields: Full Name, Confirm Password
- Terms of Service checkbox
- Animated registration button
- Link to login

---

### 2. 📊 Dashboard (`/dashboard`)

#### Main Layout
- **Left Sidebar (260px)**
  - Logo and brand
  - Navigation menu (8 items)
  - Active state highlighting
  - Upgrade card at bottom
  
- **Top Navbar**
  - Search bar
  - Theme toggle (light/dark)
  - Notifications badge
  - Profile dropdown
  
#### Content Area
- **Header**
  - Page title and description
  
- **Stats Grid** (4 cards)
  - Total Projects
  - Active Projects
  - Completed Projects
  - Team Members
  
- **Filters & Search**
  - Search input with icon
  - All / Active / Completed tabs
  - "New Project" button
  
- **Projects Grid**
  - Responsive grid (1-3 columns)
  - Project cards with:
    - Gradient header
    - Status badge
    - Title and description
    - Progress bar (animated)
    - Member count
    - Last updated time

#### Create Project Modal
- Modal overlay with backdrop blur
- Project name input
- Description textarea
- Cancel / Create buttons

---

### 3. 🎯 Project Workspace (`/project/:id`)

#### Header Bar
- **Left Section**
  - Project icon
  - Project name and ID
  
- **Center Section**
  - Online user avatars (stacked)
  - Green glow for online status
  
- **Right Section**
  - Share button
  - Invite button
  - Status dropdown (Planning/Active/Completed)

#### Tab Navigation
- Goals
- Documents
- Decisions
- Activity
- Members
- Animated underline on active tab

---

### 4. ✅ Goals Tab

#### Stats Row (3 cards)
- Total Goals
- Completed count
- Overall Progress percentage

#### Goals List
Each goal card shows:
- Checkbox (circle/checkmark)
- Title and description
- Priority badge (Low/Medium/High with flag icon)
- Progress bar (0-100%)
- Due date with calendar icon
- Assignee avatar and name
- LIVE indicator badge

#### Features
- Click checkbox to toggle completion
- Animated progress bars
- Strikethrough for completed goals
- "Add Goal" button

---

### 5. 📄 Documents Tab

#### Layout (Split View)

**Left Sidebar**
- "New Document" button
- Document list:
  - File icon
  - Document title
  - Version badge
  - Last edited time
  - Active highlight

**Main Editor Panel**
- **Header Bar**
  - Document title
  - Version info
  - Last edited by
  - Save status indicator (Saving/Saved/Unsaved)
  - Version badge
  
- **Typing Indicator**
  - Animated dots
  - "User is typing..." message
  
- **Editor Area**
  - Large textarea
  - Monospace font
  - Markdown support
  
#### Conflict Detection Banner
- Slide-down animation
- Yellow background
- Alert icon
- "Document Updated Elsewhere" message
- "Refresh" button

---

### 6. 🔀 Decisions Tab

#### Stats Row (3 cards)
- Total Decisions
- High Impact count
- This Week count

#### Decision Cards
Each card shows:
- User avatar (gradient)
- Decision title
- Description
- Impact badge (Low/Medium/High)
- Made by user name
- Timestamp
- Category badge
- Comment button

#### Add Decision Modal
- Decision title input
- Description textarea
- Impact level dropdown
- Category dropdown
- Cancel / Add buttons

---

### 7. 📈 Activity Feed

#### Stats Row (4 cards)
- Today's activity count
- This week's count
- Documents count
- Goals count

#### Timeline View
Each activity item shows:
- User avatar (gradient)
- Action description
- Target (what was affected)
- Timestamp
- Activity type icon
- LIVE badge (for recent items)

#### Activity Types
- Goal created/completed
- Document created/edited
- Decision logged
- Member invited
- Various edit actions

#### Features
- Vertical timeline line
- "Load More Activity" button

---

### 8. 👥 Members Tab

#### Stats Row (4 cards)
- Total Members
- Online Now (with pulse)
- Admins count
- Members count

#### Members List
Each member row shows:
- **Avatar** (gradient with initials)
  - Online status dot (green/yellow/gray)
  
- **Info**
  - Name with crown icon (for Owner)
  - Email address
  - Joined date
  
- **Role Badge** (clickable for non-owners)
  - Owner (yellow) / Admin (purple) / Member (gray)
  - Role icon
  - Dropdown to change role
  
- **Remove Button** (X icon, not for Owner)

#### Special Features
- Owner row highlighted in yellow tint
- Role dropdown menu
- Cannot change Owner role
- Cannot remove Owner

#### Invite Member Modal
- Email input with icon
- Role dropdown (Admin/Member)
- Helper text for each role
- Cancel / Send Invite buttons

---

### 9. 🤖 AI Assistant

#### Floating Button
- Bottom-right corner
- Gradient background (Indigo → Purple)
- Sparkles icon
- Lightning bolt badge
- Glow effect on hover

#### AI Panel (Slide-in)
- **Header**
  - Gradient background
  - AI icon
  - "AI Assistant" title
  - Online status indicator
  - Close button (X)
  - Description text
  
- **Messages Area**
  - User messages (right, gradient background)
  - AI messages (left, gray background)
  - Sparkles icon for AI
  - Timestamps
  - Typing indicator (animated dots)
  
- **Suggested Questions** (initial state)
  - 4 quick action buttons
  
- **Input Area**
  - Text input
  - Send button

#### AI Responses
- Project summaries
- Progress insights
- Recent activity
- Team overview
- Contextual help

---

## 🎨 Design Consistency

### Typography
- Headings: Medium weight (500)
- Body: Normal weight (400)
- Monospace for code/documents

### Spacing
- 4px base unit
- Consistent padding: 6, 8, 12, 16, 24px
- Card padding: 24px (p-6)

### Borders
- Radius: 12px (rounded-xl), 16px (rounded-2xl)
- Border width: 1px
- Border color: Subtle gray

### Shadows
- Card hover: Large shadow
- Modals: 2XL shadow
- Buttons: LG shadow

### Colors
Every element uses the defined color system:
- Primary gradient (Indigo→Violet or Purple→Cyan)
- Status colors (Yellow, Blue, Green)
- Role colors (Yellow, Purple, Gray)
- Priority colors (Red, Yellow, Gray)

### Animations
- Duration: 200-300ms
- Easing: ease-in-out
- Hover scale: 1.02
- Modal scale: 0.9 → 1.0
- Fade: 0 → 1 opacity

---

## 📱 Responsive Behavior

### Desktop (> 1024px)
- Full sidebar visible (260px)
- Multi-column grids
- Horizontal layouts

### Tablet (640-1024px)
- Sidebar may collapse
- 2-column grids
- Adjusted spacing

### Mobile (< 640px)
- Hidden sidebar (hamburger menu)
- Single column
- Stacked layouts
- Full-width cards

---

## 🌓 Dark Mode

All screens support dark mode with:
- Dark backgrounds (#0F172A, #1E293B)
- Light text (#E2E8F0)
- Purple/Cyan gradients
- Subtle border colors
- Glow effects on interactive elements
- Maintained contrast ratios

---

## ✨ Special Effects

1. **Glassmorphism** - Auth pages, modals
2. **Gradient Shifts** - Button hover states
3. **Pulse Animation** - Online indicators, live badges
4. **Typing Dots** - Document editor, AI chat
5. **Progress Bars** - Animated width transitions
6. **Card Hover** - Scale up + shadow increase
7. **Modal Enter** - Fade + scale animation
8. **Tab Switch** - Underline slide effect
9. **Slide-in Panel** - AI assistant entrance
10. **Floating Orbs** - Auth background animations

---

## 🎯 Interactive Elements

### Buttons
- Primary: Gradient background
- Secondary: Outlined
- Hover: Scale 1.02
- Active: Scale 0.98
- Disabled: 50% opacity

### Inputs
- Focus: Ring effect
- Icons: Left-aligned
- Placeholder: Gray 400
- Validation: Red border

### Cards
- Hover: Shadow + lift
- Click: Navigate
- Border: Subtle gray
- Rounded: 16-24px

### Badges
- Rounded: Full
- Padding: Small
- Font: Medium weight
- Colors: Status-based

---

## 🔄 State Management

### Loading States
- Spinner animations
- Skeleton screens ready
- Button loading indicators

### Empty States
- Icon + message
- Call-to-action button
- Helpful description

### Error States
- Error messages
- Retry buttons
- Validation feedback

### Success States
- Success messages
- Confirmation modals
- Toast notifications ready

---

## 📊 Data Visualization

### Progress Bars
- Animated width
- Gradient fill
- Percentage label
- Smooth transitions

### Stats Cards
- Large number display
- Icon indicator
- Label text
- Trend indicators ready

### Timeline
- Vertical line
- Avatars
- Timestamps
- Activity icons

---

## 🎨 Color Usage Guide

### Backgrounds
- Page: F6F7FB (light) / 0F172A (dark)
- Card: FFFFFF (light) / 1E293B (dark)
- Input: Gray 50 (light) / Gray 800 (dark)

### Text
- Primary: Gray 900 (light) / White (dark)
- Secondary: Gray 600 (light) / Gray 400 (dark)
- Muted: Gray 500 (light) / Gray 500 (dark)

### Accents
- Primary: Indigo 600 → Purple 600
- Success: Green 500
- Warning: Yellow 500
- Error: Red 500
- Info: Cyan 500

### Borders
- Light: Gray 200
- Dark: Gray 700
- Focus: Primary color

---

This documentation covers all screens, states, and design elements in the complete application!
