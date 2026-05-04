# QuickTube

AI-Powered YouTube Video Analysis & Summarization

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4)](https://tailwindcss.com)
[![Trigger.dev](https://img.shields.io/badge/Trigger.dev-v4-7C3AED)](https://trigger.dev)

---

## Overview

QuickTube transforms any YouTube video into structured insights using AI. It extracts transcripts, generates comprehensive summaries, enables conversational Q&A with video content, and creates quizzes for learning reinforcement.

Built with a retro-futuristic "Synthwave Sunset" aesthetic, QuickTube delivers a distinctive, engaging user experience while handling complex video processing workflows asynchronously.

---

## Features

- **Auto Transcripts** — Extract YouTube video captions using Supadata API
- **AI Summaries** — Generate structured summaries with key points, timestamps, and important quotes
- **Chat with Video** — RAG-style conversational Q&A using the full transcript context
- **Quiz Generation** — Auto-create multiple choice and true/false quizzes from video content
- **Export Options** — Download summaries as PDF or plain text
- **Video History** — Track and revisit previously processed videos with persistent storage

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, Framer Motion |
| **Backend** | Next.js API Routes, Trigger.dev (async task queue) |
| **Database** | PostgreSQL + Prisma ORM |
| **AI** | NVIDIA NIM API (Llama 3.1 405B / 70B) |
| **Integrations** | Supadata API (YouTube transcripts), Deepgram (speech recognition) |
| **Deployment** | Vercel, Trigger.dev Cloud |

---

## Architecture

```mermaid
graph TB
    subgraph Client
        UI["Next.js App"]
        Input["Video Input"]
        Chat["Chat Panel"]
        Quiz["Quiz Panel"]
    end
    
    subgraph API_Layer
        Process["POST /api/process"]
        Status["GET /api/status/[id]"]
        ChatAPI["POST /api/chat"]
        QuizAPI["POST /api/quiz"]
        HistoryAPI["GET /api/history"]
    end
    
    subgraph Task_Queue
        Trigger["Trigger.dev"]
        ProcessTask["process-video Task"]
    end
    
    subgraph External_Services
        Supadata["Supadata API"]
        NVIDIA["NVIDIA NIM API"]
        YouTube["YouTube"]
    end
    
    subgraph Database
        DB[("PostgreSQL")]
        Video["Video Table"]
    end
    
    UI --> Input
    Input --> Process
    Process --> Trigger
    Trigger --> ProcessTask
    ProcessTask --> Supadata
    Supadata --> YouTube
    ProcessTask --> NVIDIA
    ProcessTask --> DB
    
    UI --> Status
    Status --> DB
    
    UI --> Chat
    Chat --> ChatAPI
    ChatAPI --> NVIDIA
    ChatAPI --> DB
    
    UI --> Quiz
    Quiz --> QuizAPI
    QuizAPI --> NVIDIA
    QuizAPI --> DB
    
    DB --> Video
    UI --> HistoryAPI
    HistoryAPI --> DB
```

**Flow:**
1. User pastes a YouTube URL in the UI
2. API creates a video record in PostgreSQL and triggers an async task via Trigger.dev
3. The task fetches the transcript via Supadata API
4. The transcript is sent to NVIDIA NIM (Llama 3.1) for AI summarization
5. Results are stored in the database and the UI polls for completion
6. Users can then chat with the video, generate quizzes, or export the summary

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted like Supabase, Neon, Railway)
- NVIDIA NIM API key (https://build.nvidia.com/)
- Supadata API key (https://supadata.ai/)
- Trigger.dev account (https://trigger.dev/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AC%83/quicktube.git
cd quicktube

# 2. Install dependencies
npm install

# 3. Initialize Prisma
npx prisma generate
npx prisma db push

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Setting Up Trigger.dev

```bash
# 1. Initialize Trigger.dev in your project
npx trigger-dev@latest init

# 2. Start the Trigger.dev dev server (separate terminal)
npx trigger-dev@latest dev
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/quicktube"
DIRECT_URL="postgresql://user:password@localhost:5432/quicktube"

# AI - NVIDIA NIM (use NVIDIA_API_KEYS for multiple keys with comma separation)
NVIDIA_API_KEY="your-nvidia-api-key"
# NVIDIA_API_KEYS="key1,key2,key3"  # Key rotation for higher limits

# YouTube Transcript API
SUPADATA_API_KEY="your-supadata-api-key"

# Trigger.dev
TRIGGER_API_KEY="your-trigger-api-key"
```

---

## API Rate Limits & Technical Constraints

### Service Rate Limits

| Service | Free Tier | Paid Tier | Notes |
|---------|-----------|-----------|-------|
| **NVIDIA NIM** | 100 requests/min | Varies by model | Llama 3.1 405B & 70B; uses key pooling for distribution |
| **Supadata** | 100 requests/day | Custom plans | YouTube transcript fetching |
| **Trigger.dev** | 1,200 runs/day | 5,000+ runs/day | Async task queue; 5 min max duration per task |
| **Vercel** | 100 hours/month | Pay-as-you-go | Serverless function execution |

### Processing Constraints

| Operation | Limit | Timeout |
|-----------|-------|---------|
| Transcript fetch | No hard limit | 120 seconds |
| AI summarization | No hard limit | 300 seconds (via Trigger.dev) |
| Sync API endpoints | — | 30 seconds |
| Video history | 100 most recent | — |

### Database

- **Provider:** PostgreSQL (required for Prisma)
- **Storage:** Transcripts average ~10KB per minute of video
- **Schema:** Single `Video` table with transcript, summary, and status fields

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## License

MIT License — feel free to use this project for learning or as a portfolio piece.

---

## Acknowledgments

- [NVIDIA NIM](https://build.nvidia.com/) for LLM inference
- [Supadata](https://supadata.ai/) for YouTube transcript access
- [Trigger.dev](https://trigger.dev/) for robust async task handling
- [Next.js](https://nextjs.org/) & [Vercel](https://vercel.com/) for the platform