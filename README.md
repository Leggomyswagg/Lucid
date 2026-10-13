# Lucid

### Know What's Real.

Lucid is a real-time AI media detection platform that spots deepfakes, AI-generated images, synthetic voices, and manipulated videos the moment you encounter them — across the web, your social feeds, and any site you visit.

---

## ✨ Features

- **Real-Time Detection** — Analyze images, video, and audio for AI-generation signatures instantly.
- **Background Protection** — A browser extension silently monitors media as you browse, with one-click install (Chrome, Firefox, Edge, Safari) and a no-install bookmarklet fallback.
- **AI Model Identification** — Pinpoints the likely generator: Midjourney, DALL·E, Sora, and 20+ others.
- **Floating Shield Widget** — A persistent on-screen widget showing live scan status and recent detections.
- **Dashboard & History** — Browse, search, filter, bookmark, and export your full detection history (CSV).
- **Analytics** — Track detection trends, media-type distribution, and model prevalence over time.
- **Embeddable Website Widget** — Publishers can drop Lucid into any site with a single snippet *(Enterprise plan)*.

## 💳 Plans

| Plan | Price | Highlights |
| --- | --- | --- |
| **Free** | $0 | 50 scans/day, image & video detection, browser extension |
| **Pro** | $29/mo | Unlimited scans, audio detection, analytics, API access |
| **Enterprise** | $99/mo | Everything in Pro **+ embeddable website widget** & unlimited API |

## 🛠 Tech Stack

- **React 18** + **TypeScript** + **Vite** (SWC)
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **Supabase** — auth, database, and edge functions (`analyze-media`)
- **TanStack Query**, **React Router**, **Recharts**, **lucide-react**

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:8080)
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

## 🔑 Environment

Supabase credentials are configured in `src/lib/supabase.ts`. To move them to environment variables, create a `.env` file:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

History bookmarks persist in this browser and are kept separately for each signed-in
user (and anonymous browsing). They do not sync across devices. CSV export includes
the currently filtered history, escapes quoted/multiline fields, and neutralizes
spreadsheet formulas in text values.

## 📦 Deployment

Lucid deploys automatically to **Vercel** on every push to `main`. The framework preset is **Vite** with build command `npm run build` and output directory `dist`.

---

<p align="center"><sub>Lucid — Know What's Real.</sub></p>
