# 💡 Engineering Judgment

> **Real-world bottlenecks, failure modes, and architecture trade-offs — explained in an engineering notebook style without the usual system-design fluff.**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

---

## 📖 About The Project

Most system-design resources teach you definitions: *"What is a database?"*, *"What is CAP theorem?"*, or *"Design Twitter in 45 minutes."*

**Engineering Judgment** is designed around what senior and staff engineers actually face when production is under pressure:
- How do you migrate a **100M-read / 10M-write database** without downtime while live writes never stop?
- How do you survive a **10M-user flash sale for 10,000 items** when 2 million requests hit the exact same inventory row in the first 3 seconds?
- Why do naive solutions fail in milliseconds?
- What are you actually giving up with each decision?
- And most importantly: **What breaks next?**

### The Core Reasoning Chain

```
Problem ➔ Constraint ➔ Bottleneck ➔ Decision ➔ Trade-off ➔ Failure ➔ What breaks next?
```

---

## 🎨 Visual Identity: Whiteboard & Engineering Notebook

The site is styled like an experienced distributed systems engineer opened their personal notebook to sketch architectures:

- **Physical Paper & Ink**: Warm `#FAF9F5` paper with subtle graph dots, deep `#171717` ink typography, and pencil accents.
- **Pastel Highlighters**: Blue (`#DCEBFF`), Green (`#DFF3DF`), Yellow (`#FFF0B8`), Pink (`#F9DDE5`), Lavender (`#E7E1F8`).
- **Typography Pairing**: Hand-drawn headings and annotations via Google Font **`Caveat`** paired with clean, readable **`Plus Jakarta Sans`** for technical prose and **`JetBrains Mono`** for code.
- **Hand-Drawn Vector SVG Diagrams**: Hand-drawn database cylinders, queues, CDC pipelines, and progressive funnels.
- **Editorial Navigation**: Lightweight floating notebook header and natural notebook endings (*"Better systems start with better questions."*).

---

## 🚀 Live Topics Included

### 1. [How to Safely Migrate a 100M-Read / 10M-Write-per-Day Database](/topics/database/safely-migrate-production-database)
- **The Naive Mistake**: Why taking a dump/snapshot while writes are flowing causes immediate divergence.
- **The Mental Model**: A migration is a *synchronization problem* followed by a *traffic-switching problem*.
- **The Architecture**: Snapshot seeding + CDC replication stream + continuous checksum validation + canary cutover + reverse replication rollback.
- **What Breaks Next**: CDC stream consumer lag and target IOPS saturation.

### 2. [How to Survive a 10M-User Flash Sale for 10,000 iPhones](/topics/traffic/survive-flash-sale)
- **The Naive Mistake**: `SELECT FOR UPDATE` serializing 2M RPS onto a single row, exhausting database connection pools in 5ms.
- **The Mental Model**: A flash sale is an *admission control problem* followed by a *reservation reconciliation problem*.
- **The Architecture**: Cloudflare JA3 WAF ➔ Virtual Waiting Room ➔ Single-threaded atomic Redis Lua stock gate ➔ Kafka decoupled order queue ➔ Asynchronous Postgres settlement.
- **What Breaks Next**: Redis cluster NIC saturation & multi-region inventory split-brain.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/) (CSS-first design tokens)
- **Typography**: [Next Font](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) (`Caveat`, `Plus Jakarta Sans`, `JetBrains Mono`)
- **Illustrations**: Handcrafted responsive SVG doodle components

---

## 💻 Getting Started

### Prerequisites

- Node.js 18.17+ or later
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Aashish-Anand/engineering-judgment.git

# Navigate to the project directory
cd engineering-judgment

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

---

## 📂 Project Structure

```
├── app/
│   ├── globals.css          # Design tokens, pastel markers, doodle borders
│   ├── layout.tsx           # Root layout with Caveat & Plus Jakarta Sans fonts
│   ├── page.tsx             # Redesigned notebook landing page
│   └── topics/              # Dynamic topic routing
├── components/
│   ├── Hero.tsx             # Sketched hero, typewriter search, engineer doodle
│   ├── SiteHeader.tsx       # Floating editorial handwritten navigation
│   ├── SiteFooter.tsx       # Natural notebook ending with mountain sketch
│   ├── CategoryProblemCard.tsx # 8 pastel problem type cards
│   ├── TableOfContents.tsx  # Notebook index with circled numbers
│   ├── LevelExpectation.tsx # MID / SENIOR / STAFF evaluation tier cards
│   ├── articles/            # Rich technical problem walkthroughs
│   ├── diagrams/            # 10 hand-drawn SVG architecture diagrams
│   └── doodle/              # Reusable hand-drawn primitives
│       ├── DoodleBox.tsx
│       ├── DoodleArrow.tsx
│       ├── HighlightStroke.tsx
│       ├── ThoughtBubble.tsx
│       ├── FailureCallout.tsx
│       ├── WhatBreaksNext.tsx
│       └── EngineerDoodle.tsx
└── data/                    # Topic technical content, metrics, tradeoffs
```

---

## 📝 License

MIT © [Aashish Anand](https://github.com/Aashish-Anand)
