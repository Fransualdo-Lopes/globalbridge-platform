# GlobalBridge | Professional Multilingual Meeting Platform

## Project Overview

GlobalBridge is a high-performance Speech-to-Speech (S2S) translation platform that enables seamless communication across languages in real-time.

### Unified Architecture

The project uses a flat architecture for maximum simplicity and lower deployment overhead.

- **Backend**: `src/server.ts` handles signaling for WebRTC.
- **Frontend**: React components in `features/` and `hooks/` manage the meeting experience and AI interactions.
- **AI**: Utilizes Gemini 2.5 Flash Native Audio for low-latency translation.

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
├── src/            # Backend Server
├── core/           # Context and Global Envs
├── features/       # UI Features
├── hooks/          # React Hooks
├── App.tsx         # Root Component
├── index.tsx       # Entry Point
├── package.json    # platform Configuration
└── types.ts        # Global Definitions