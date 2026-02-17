
# GlobalBridge | Professional Multilingual Meeting Platform

## Project Alignment Summary

As the Senior Architect/CTO, the vision for GlobalBridge is to provide a **zero-friction cross-lingual communication** experience. We are moving beyond simple subtitles by implementing a high-performance **Speech-to-Speech (S2S)** pipeline.

### Architectural Decisions

1.  **Monorepo (Workspaces):** Mandatory for scaling. We share interfaces between the React frontend and Node.js backend to prevent "Signal Desync."
2.  **Streaming Pipeline:** Instead of waiting for a sentence to finish (High Latency), we utilize Google Cloud's streaming Recognition Config to translate in near real-time.
3.  **Clean Architecture (Backend):**
    *   `modules/`: Contains business logic isolated by feature.
    *   `infrastructure/`: Third-party wrappers (Google Cloud, Redis).
    *   `middleware/`: Cross-cutting concerns like Auth & Logging.
4.  **Screaming Architecture (Frontend):**
    *   `features/`: Meeting, Auth, UserSettings.
    *   `core/`: Singletons like Routing, Context Providers.
    *   `shared/`: UI Kit (Atomic design principles).

## Repository Structure

```text
multilingual-meeting-platform/
├── apps/
│   ├── frontend/ (React + TSX)
│   │   ├── src/
│   │   │   ├── core/ (Router, Providers)
│   │   │   ├── features/ (Meeting, Auth)
│   │   │   └── shared/ (UI, Utils)
│   └── backend/ (Node.js + TS)
│       ├── src/
│       │   ├── modules/ (Auth, Meeting, Translation)
│       │   ├── infrastructure/ (Google Cloud Adapters)
│       │   └── middleware/ (Security, Errors)
├── packages/
│   ├── shared-types/ (TS Enums & Interfaces)
│   ├── config/ (Env & Constants)
│   └── utils/ (Shared logic)
├── infrastructure/
│   ├── docker/
│   ├── terraform/ (IaC)
│   └── kubernetes/ (K8s Manifests)
├── package.json (Root workspace)
└── tsconfig.base.json
```

## Scalability
The backend is stateless, allowing for horizontal scaling behind a Load Balancer. Real-time signaling is synchronized via **Redis Pub/Sub** to support thousands of concurrent rooms across multiple nodes.
