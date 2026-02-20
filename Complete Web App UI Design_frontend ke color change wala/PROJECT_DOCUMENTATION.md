# Project Collaboration & Execution Platform

A modern, production-ready real-time collaboration platform built with React, TypeScript, and Tailwind CSS.

## ✨ Features

### Authentication
- **JWT Authentication** - Secure login and registration
- **Animated glass morphism cards** with gradient backgrounds
- **Form validation** and loading states

### Dashboard
- **Project Overview** - Grid view of all projects with stats
- **Real-time Stats** - Total, active, completed projects and team members
- **Search & Filters** - Search projects and filter by status
- **Project Creation** - Modal to create new projects
- **Animated Cards** - Hover effects and progress bars

### Project Workspace
- **Tab Navigation** - Goals, Documents, Decisions, Activity, Members
- **Real-time Presence** - See who's online with glowing indicators
- **Status Management** - Change project status (Planning/Active/Completed)
- **Share & Invite** - Buttons to collaborate with team

### Goals Tab
- **Progress Tracking** - Visual progress bars for each goal
- **Priority Badges** - Low/Medium/High priority indicators
- **Completion Toggle** - Mark goals as complete
- **Stats Overview** - Total, completed, and overall progress
- **Real-time Updates** - Live indicator for active goals

### Documents Tab
- **Document List** - Sidebar with all project documents
- **Live Editor** - Real-time text editor with auto-save
- **Save Status** - Visual indicator (Saving/Saved/Unsaved)
- **Typing Indicators** - See when others are typing
- **Conflict Detection** - Banner when document updated elsewhere
- **Version Control** - Version badges and history

### Decisions Tab
- **Decision Log** - Track important project decisions
- **Impact Levels** - Low/Medium/High impact badges
- **Categories** - Technical, Process, Design, Business
- **Timestamps** - When decisions were made
- **User Attribution** - Who made each decision

### Activity Feed
- **Timeline View** - Chronological activity stream
- **Live Updates** - Real-time activity with LIVE badges
- **Activity Stats** - Today, this week, documents, goals counts
- **Activity Types** - Goals, documents, decisions, members, edits
- **User Avatars** - Color-coded team member indicators

### Members Tab
- **Team Overview** - All team members with stats
- **Role Management** - Owner/Admin/Member badges
- **Role Changes** - Dropdown to update member roles
- **Online Status** - Green (online), yellow (away), gray (offline)
- **Owner Highlight** - Special styling for project owner
- **Invite Members** - Modal to add new team members

### AI Assistant
- **Floating Button** - Always accessible AI helper
- **Slide-in Panel** - Smooth animation from right
- **Smart Responses** - Context-aware project insights
- **Suggested Questions** - Quick actions
- **Chat Interface** - User and AI messages
- **Typing Animation** - AI thinking indicator

### Design System
- **Light & Dark Mode** - Toggle between themes
- **Custom Colors** - Indigo/Purple gradient (light), Purple/Cyan (dark)
- **Glassmorphism** - Frosted glass effects on cards
- **Rounded Corners** - 16-24px border radius
- **Smooth Animations** - Motion library for micro-interactions
- **Gradient Accents** - Vibrant color combinations
- **Hover Effects** - Scale and shadow transitions

## 🎨 Color Palette

### Light Mode
- Background: `#F6F7FB`
- Surface: `#FFFFFF`
- Primary: `#6366F1` → `#8B5CF6` (Indigo to Violet)
- Accent: `#22D3EE` (Cyan)
- Success: `#10B981`
- Warning: `#F59E0B`
- Error: `#EF4444`
- Border: `#E5E7EB`

### Dark Mode
- Background: `#0F172A`
- Surface: `#1E293B`
- Primary: `#8B5CF6` → `#22D3EE` (Purple to Cyan)
- Text: `#E2E8F0`
- Border: `#334155`
- Subtle glows on interactive elements

## 🏗️ Architecture

### Pages
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Main dashboard with projects
- `/project/:id` - Project workspace with tabs

### Components Structure
```
/src/app/
├── App.tsx (Main router)
├── components/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── dashboard/
│   │   ├── Dashboard.tsx
│   │   └── ProjectCard.tsx
│   ├── project/
│   │   ├── ProjectWorkspace.tsx
│   │   ├── OnlinePresence.tsx
│   │   ├── GoalsTab.tsx
│   │   ├── DocumentsTab.tsx
│   │   ├── DecisionsTab.tsx
│   │   ├── ActivityTab.tsx
│   │   └── MembersTab.tsx
│   ├── shared/
│   │   ├── Sidebar.tsx
│   │   └── Navbar.tsx
│   └── ai/
│       └── AIAssistant.tsx
```

## 🚀 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Motion (Framer Motion)** - Animations
- **Lucide React** - Icons
- **React Router** - Navigation

## 🎯 Key Features

### Real-time Indicators
- ✅ Online presence (green glowing dots)
- ✅ Typing indicators (animated dots)
- ✅ Conflict detection banners
- ✅ Live activity badges
- ✅ Auto-save status

### Role-Based Access
- 👑 **Owner** - Full control, highlighted in yellow
- 🛡️ **Admin** - Manage members and settings
- 👤 **Member** - View and contribute

### Responsive Design
- Desktop-first with 260px sidebar
- Tablet adaptation
- Mobile-friendly workspace
- Collapsible navigation

### Accessibility
- Keyboard navigation
- ARIA labels
- Focus states
- Color contrast compliance

## 🎬 Animations

- **Page Transitions** - Fade + slide
- **Card Hover** - Scale 1.02 + shadow
- **Button States** - Gradient shift on hover
- **Status Pulse** - Live indicators
- **Modal Animations** - Fade + scale
- **Tab Switching** - Underline slide
- **Typing Dots** - Bounce animation

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔒 Security Features (UI)

- JWT token placeholder
- Secure form validation
- Protected routes
- Role-based UI rendering

## 🎨 Design Principles

1. **Modern & Premium** - Not generic SaaS
2. **Soft Gradients** - Smooth color transitions
3. **Glassmorphism** - Frosted glass effects
4. **Rounded Surfaces** - 16-24px radius
5. **Micro-animations** - Subtle and smooth
6. **Clean Spacing** - Consistent padding/margin
7. **Elegant Hovers** - Scale and glow effects
8. **Dark Mode Glow** - Subtle lighting

## 📊 Mock Data

All tabs use realistic mock data:
- 6 projects with various statuses
- 4 goals with progress tracking
- 4 documents with versions
- 4 decisions with impact levels
- 8 activity items with timestamps
- 6 team members with roles

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 Notes

- Backend integration ready (JWT auth endpoints)
- All API calls stubbed with setTimeout
- Real-time features use mock WebSocket simulation
- AI responses are template-based
- Conflict detection triggered randomly for demo
