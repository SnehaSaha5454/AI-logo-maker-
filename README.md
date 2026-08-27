# LogoMind AI 🧠

> **AI-Powered Professional Logo Generator** — Craft modern, tailored, vector-style logos in minutes powered by Cloudflare Workers AI and FLUX.1 [schnell].

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)](https://expressjs.com/)
[![Cloudflare Workers AI](https://img.shields.io/badge/Cloudflare-FLUX.1%20[schnell]-F38020?logo=cloudflare)](https://developers.cloudflare.com/workers-ai/)
[![Neon PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20Serverless-00E599?logo=postgresql)](https://neon.tech/)

---

## 📖 Overview

**LogoMind AI** is a full-stack web application that allows entrepreneurs, designers, and creators to design high-quality, custom brand logos. Through an intuitive 6-step wizard, users can define their brand name, description, color harmonies, stylistic aesthetics, and design motifs.

The application intelligently constructs an optimized, multi-layered visual prompt and generates crisp, production-grade 2D vector logos using **Cloudflare Workers AI (FLUX.1 [schnell])**. Generated logos are saved into a persistent PostgreSQL gallery for easy management, regeneration, and high-resolution PNG downloads.

---

## ✨ Features

- 🧙‍♂️ **6-Step Guided Wizard**:
  1. **Brand Identity**: Logo title and business naming
  2. **Brand Vision**: Contextual vision, mission, and brand ideas
  3. **Color Palette**: 10+ curated color harmonies (Ocean Blue, Emerald, Royal Violet, Amber Gold, Sunset Saffron, Crimson, Obsidian, and more) plus bespoke custom color picker
  4. **Design Style**: 9 distinct vector branding archetypes (Minimalist, Modern Sharp, Luxury, Monoline, App Icon, Mascot, Cartoon, Vintage Badge, Typographic Crest)
  5. **Design Motif**: Abstract stars, cosmic spirals, modern globes, monograms, or AI-selected concepts
  6. **Neural Synthesis & Download**: Real-time rendering with instant PNG downloads
- 🎨 **Rich Indian-Inspired Aesthetic**: Vibrant saffron-to-pink gradient accents, glassmorphic cards, and sleek dark/light mode toggle.
- 💾 **Persistent Logo Gallery**: Automatically saves generated logos to a serverless PostgreSQL database with search and filtering capabilities.
- 🔄 **Variation Regeneration**: Regenerate any historical logo with random seed variations to explore fresh visual compositions.
- 🔒 **User Account System**: Built-in user authentication with secure password hashing (`scrypt`).
- 📱 **Fully Responsive**: Optimized for desktop, tablet, and mobile displays.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Wouter | Modern component architecture and lightweight routing |
| **Styling** | Tailwind CSS, Shadcn UI, CSS Variables | Responsive design system with seamless dark/light modes |
| **Icons** | Lucide React | Modern, consistent icon library |
| **Data Fetching** | TanStack React Query | Cache management and client-side data synchronization |
| **Backend** | Node.js, Express | Modular REST API server |
| **AI Engine** | Cloudflare Workers AI | `@cf/black-forest-labs/flux-1-schnell` neural image generation |
| **Database** | Neon PostgreSQL + Drizzle ORM | Serverless PostgreSQL with type-safe schema definitions |
| **Validation** | Zod & drizzle-zod | End-to-end schema validation |
| **Bundler** | Vite & esbuild | Rapid HMR in development and optimized production bundling |

---

## 🏗️ Architecture

```mermaid
graph TD
    User([User Browser])
    
    subgraph Frontend [Client - React + Vite]
        AuthPage[Auth / Registration]
        AppPage[Main App Page]
        Wizard[6-Step Logo Wizard]
        Gallery[Logo History Gallery]
        Theme[Theme Provider]
    end
    
    subgraph Backend [Server - Express REST API]
        AuthRouter["/api/register & /api/login"]
        LogoRouter["/api/generate-logo"]
        StorageRouter["/api/logos (GET, POST, DELETE)"]
    end
    
    subgraph External [External Services]
        Cloudflare["Cloudflare Workers AI<br/>(FLUX.1 [schnell])"]
        NeonDB["Neon Serverless PostgreSQL<br/>(Drizzle ORM)"]
    end

    User <--> Frontend
    Frontend <--> Backend
    LogoRouter -->|Prompt & Seed| Cloudflare
    Cloudflare -->|Base64 Image| LogoRouter
    Backend <-->|Drizzle Queries| NeonDB
```

---

## 📁 Project Structure

```
.
├── client/
│   ├── index.html            # Entry HTML with SEO meta tags
│   ├── public/               # Static assets (favicons, icons)
│   └── src/
│       ├── components/
│       │   ├── navbar.tsx        # Top navigation with theme toggle & user profile
│       │   ├── footer.tsx        # Application footer
│       │   ├── logo-wizard.tsx   # 6-step interactive logo creation wizard
│       │   ├── logo-history.tsx  # User logo history gallery & actions
│       │   └── ui/               # Core Shadcn UI primitives (button, card, dialog, etc.)
│       ├── hooks/                # Custom React hooks (use-theme, use-toast)
│       ├── lib/                  # Utilities (queryClient, tailwind helper cn)
│       ├── pages/                # Route pages (auth-page, app-page, not-found)
│       ├── App.tsx               # App routing and provider configuration
│       ├── index.css             # Tailwind base, components, and gradient utilities
│       └── main.tsx              # React DOM entry point
├── server/
│   ├── auth-utils.ts         # Scrypt password hashing & verification
│   ├── db.ts                 # Drizzle / Neon database connection initialization
│   ├── index.ts              # Express application setup & port listener
│   ├── routes.ts             # API routes (Auth, Cloudflare FLUX AI generation, Logo CRUD)
│   ├── storage.ts            # Database storage interface & implementations
│   └── vite.ts               # Vite development server middleware & static serving
├── shared/
│   └── schema.ts             # Shared Drizzle ORM schemas, Zod validators, & types
├── drizzle.config.ts         # Drizzle Kit migration configuration
├── package.json              # Project scripts & dependencies
├── tsconfig.json             # TypeScript compiler configuration
└── vite.config.ts            # Vite build configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Neon PostgreSQL Account**: Free serverless PostgreSQL database at [neon.tech](https://neon.tech/)
- **Cloudflare Account**: Cloudflare Workers AI credentials ([Cloudflare Dashboard](https://dash.cloudflare.com/))

---

### Local Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/logomind-ai.git
   cd logomind-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment configuration:
   ```bash
   cp .env.example .env
   ```

   Open `.env` and fill in your credentials:
   ```env
   # PostgreSQL Connection String
   DATABASE_URL=postgresql://neondb_owner:your_password@ep-your-host.neon.tech/neondb?sslmode=require

   # Cloudflare Workers AI Credentials
   CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
   CLOUDFLARE_API_TOKEN=your_cloudflare_api_token

   # Server Port
   PORT=5000
   ```

4. **Initialize Database Schema**:
   Push the schema to your Neon PostgreSQL instance:
   ```bash
   npm run db:push
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## 📦 Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts backend server and Vite development server with HMR |
| `npm run build` | Builds the client bundle (`dist/public`) and compiles server bundle (`dist/index.js`) |
| `npm run start` | Runs the production compiled application (`node dist/index.js`) |
| `npm run check` | Runs TypeScript compiler typechecking (`tsc --noEmit`) |
| `npm run db:push` | Pushes schema changes directly to PostgreSQL via Drizzle Kit |

---

## 🚢 Production Deployment

The application is container-ready and binds to `0.0.0.0` with configurable `PORT` support.

### Deploying to Render / Railway / Node.js VPS

1. **Build Command**:
   ```bash
   npm install && npm run build
   ```
2. **Start Command**:
   ```bash
   npm run start
   ```
3. **Environment Variables**:
   Set `DATABASE_URL`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, and `NODE_ENV=production` in your hosting provider's dashboard.

---

## 📸 Screenshots



| Wizard Creation Flow | Logo History Gallery |
| :---: | :---: |
| *(Screenshot: Step-by-step logo creation wizard)* | *(Screenshot: Saved logos in responsive grid)* |

---

## 🔮 Future Enhancements

- [ ] SVG vector export alongside high-res PNG downloads
- [ ] Direct logo canvas editor (text positioning, font resizing, manual icon adjustment)
- [ ] Exportable brand style kit (color swatches, typography recommendations, social media kit)
- [ ] Multiple logo variations generated in parallel per run

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
