# GlobalBridge | Professional Multilingual Meeting Platform

## Project Overview

GlobalBridge is a high-performance Speech-to-Speech (S2S) translation platform that enables seamless communication across languages in real-time.

### Refactored Architecture

The project has been migrated from a monorepo to a unified platform architecture for simplicity and lower deployment overhead.

- **Unified Server**: `server.ts` handles both signaling for WebRTC and any necessary API logic.
- **Frontend Core**: React components in `features/` and `hooks/` manage the meeting experience and AI interactions.
- **Native AI**: Utilizes Gemini 2.5 Flash Native Audio for ultra-low latency translation.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Production Build**:
   ```bash
   npm run build
   ```

## Folder Structure
/
├── core/           # Context and Global Envs
├── features/       # UI Features (Meeting, Voice Lab, Settings)
├── hooks/          # React Hooks (Signaling, WebRTC, AI)
├── server.ts       # Backend Signaling Server
├── types.ts        # Shared Type Definitions
├── App.tsx         # Root Component
├── index.tsx       # Entry Point
└── package.json    # Platform Configuration