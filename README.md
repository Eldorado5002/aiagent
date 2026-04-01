# 🤖 AgentX — Your AI Conversation Buddy

> **AgentX** is an intelligent, memory-powered AI chatbot that remembers everything about you and evolves the deeper you talk. Built with **Next.js 15**, powered by **Google Gemini 2.5 Flash Lite**, and deployable on **Vercel** with a secure backend.

---

## ✨ Key Features

### 🧠 Persistent Memory
AgentX remembers your **name, interests, goals, location, background**, and more — across sessions. Every conversation teaches it something new about you, and that memory is carried forward into every future chat.

### 📈 Depth-Aware Intelligence
The AI doesn't just answer questions — it **evolves** through 3 conversation stages:

| Stage | Messages | Behavior |
|-------|----------|----------|
| **Intro** | 0–3 | Warm, welcoming. Asks gentle questions to learn about you. |
| **Getting to Know** | 4–9 | Connects the current topic to your known interests and goals. |
| **Deep Dive** | 10+ | Acts like a brilliant friend. Debates, challenges, and offers profound insights. |

### ⌘ Command Palette (Spotlight Search)
A premium, keyboard-navigable modal for switching topics — inspired by **Raycast**, **Linear**, and **VS Code's Cmd+K**:
- 🔍 **Instant search** — filters your interests, recent topics, and trends as you type
- ✨ **Personalized Picks** — suggests topics based on your stored memory
- 🕐 **Recent Topics** — jump back to previous conversations with one click
- 🔥 **Live Trending** — real-time topics from Google Gemini (cached 1 hour)
- ⌨️ **Full keyboard support** — `↑↓` to navigate, `Enter` to select, `Esc` to close

### 🔗 Share Your Agent
Generate a unique shareable link that encodes your memory. When a friend opens it, they can ask your AI buddy questions about **you** — powered entirely by the memory AgentX has built.

### 🔒 Secure Architecture
Your Gemini API key is **never** exposed to the browser. All API calls are routed through a server-side Next.js API Route (`/api/chat`), keeping your key safe even on public deployments.

---

## 🏗️ Architecture

```
┌─────────────────┐      POST /api/chat      ┌──────────────────┐
│   User Browser  │ ──────────────────────▶  │  Vercel API Route │
│   (React App)   │ ◀──────────────────────  │  (route.js)       │
└─────────────────┘      JSON response       └────────┬─────────┘
                                                       │
                                                       │ Gemini API
                                                       │ (with secret key)
                                                       ▼
                                              ┌──────────────────┐
                                              │  Google Gemini    │
                                              │  2.5 Flash Lite   │
                                              └──────────────────┘
```

---

## 📁 Project Structure

```
agentx/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.js       # Secure Gemini proxy (server-side)
│   ├── globals.css            # Complete design system
│   ├── layout.js              # Root layout with fonts & SEO
│   └── page.js                # Full AgentX React component
├── .env.local                 # API key (gitignored, never deployed)
├── .gitignore                 # Ignores .env.local, node_modules, .next
├── index.html                 # Legacy standalone version (deprecated)
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies & scripts
└── README.md                  # This file
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ installed
- A **Google Gemini API key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/agentx.git
cd agentx
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ **Never commit this file.** It is already included in `.gitignore`.

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

---

## ☁️ Deploy to Vercel

### Option A: One-Click Deploy

1. Push your code to a **GitHub repository**.
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo.
3. Vercel auto-detects Next.js.
4. Add your environment variable:
   - Key: `GEMINI_API_KEY`
   - Value: `your_api_key_here`
5. Click **Deploy**.

### Option B: CLI Deploy

```bash
npx vercel
```

Then set the environment variable in your Vercel dashboard:
**Settings → Environment Variables → Add `GEMINI_API_KEY`**

---

## 🔧 Configuration

### API Model
The app uses `gemini-2.5-flash-lite` by default. To change the model, edit `app/api/chat/route.js`:

```javascript
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`;
//                                                                  ^^^^^^^^^^^^^^^^^^^^^^^^
//                                                                  Change model name here
```

### Rate Limits (Free Tier)
| Limit | Value |
|-------|-------|
| Requests per minute | 15 RPM |
| Requests per day | 1,500 RPD |
| Tokens per minute | 1,000,000 TPM |

### How AgentX Optimizes for 15 RPM

| Optimization | Details |
|---|---|
| **Server-side retry** | Auto-retries 429 errors (5s → 10s backoff, 3 attempts) |
| **Batched memory extraction** | Extracts memory every 5th message (not every message) |
| **Cached trending topics** | Fetches live trends once per hour, caches in `localStorage` |
| **Secure key** | Prevents bots from stealing and draining your API quota |

---

## 🧩 How It Works

### Memory System
1. User sends messages → queued in `memQueue`
2. Every **5th message**, the queue is batched and sent to Gemini with a structured prompt
3. Gemini returns extracted facts as JSON: `{ "interests": ["AI"], "location": "India" }`
4. Facts are **merged** into the existing `memory` object (arrays are deduplicated)
5. Memory is persisted in `localStorage` under the key `ax_mem`

### Memory Keys
| Key | Icon | Description |
|-----|------|-------------|
| `name` | 👤 | User's name |
| `age` | 🎂 | User's age |
| `location` | 📍 | Where they live |
| `background` | 🎓 | Education or professional background |
| `interests` | ❤️ | Array of hobbies and interests |
| `goals` | 🎯 | Array of goals and aspirations |
| `current_situation` | 📌 | What they're currently doing |
| `personality` | ✨ | Personality traits observed |
| `topics_discussed` | 💬 | Array of all topics chatted about |

### Depth-Aware System Prompt
The system prompt dynamically changes based on the number of user messages sent:

```
0-3 messages  → INTRO mode (warm, welcoming, profile-building)
4-9 messages  → GETTING TO KNOW mode (connecting dots, referencing memory)
10+ messages  → DEEP DIVE mode (insightful, challenging, intellectual)
```

### Conversation Flow
```
Name Screen → Topic Selection → Chat (with evolving depth)
                  ↑                        │
                  └── Command Palette ◀────┘
                       (Switch Topic)
```

---

## 🎨 Design System

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#0c0c11` | Page background |
| `--surface` | `#13131a` | Header, sidebar |
| `--card` | `#17171f` | Cards, inputs |
| `--accent` | `#7c6fff` | Primary purple accent |
| `--accent-alt` | `#a78bfa` | Gradient companion |
| `--green` | `#34d399` | Live indicator |
| `--text` | `#e2e2ea` | Primary text |
| `--text-dim` | `#a8a8bc` | Secondary text |

### Typography
- **Body:** Inter (Google Fonts)
- **Headings:** Space Grotesk (Google Fonts)

### Key UI Components
- **Glassmorphic Command Palette** — `backdrop-filter: blur(20px)` with translucent backgrounds
- **Animated typing indicator** — Bouncing dots with staggered delays
- **Depth progress bar** — Gradient fill with 3-stage tracking
- **Memory cards** — Auto-populated sidebar with emoji-labeled facts

---

## 🛡️ Security Considerations

| Risk | Mitigation |
|------|-----------|
| API key exposure | Key stored in `.env.local` (server-side only) |
| Key in Git history | `.gitignore` prevents committing `.env.local` |
| Unauthorized API usage | Key is never sent to the browser |
| Rate limit abuse | Server-side retry logic with exponential backoff |
| XSS via chat messages | React's built-in escaping (limited `dangerouslySetInnerHTML` for line breaks only) |

> ⚠️ **Important:** The legacy `index.html` file contains a hardcoded API key. Do **not** deploy that file. It exists only for local testing reference.

---

## 🗺️ Roadmap

- [ ] **Firebase/Supabase backend** — Move memory from `localStorage` to a real database for cross-device sync
- [ ] **User authentication** — Login system so memory persists across browsers
- [ ] **Voice input** — Speech-to-text for hands-free conversations
- [ ] **Multi-model support** — Switch between Gemini, GPT, Claude on the fly
- [ ] **Conversation export** — Download chat history as PDF/Markdown
- [ ] **Theme customization** — Light mode, custom accent colors
- [ ] **Mobile PWA** — Installable progressive web app with offline support

---

## 📊 API Budget Breakdown

For a typical 10-message session on the **free tier (15 RPM)**:

| Action | API Calls |
|--------|-----------|
| Trending topics (cached) | 0–1 |
| Welcome back greeting | 1 |
| 10 chat messages | 10 |
| Memory extraction (batched) | 2 |
| **Total** | **13–14** ✅ |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- **Google Gemini** — Powering the AI intelligence
- **Next.js** — React framework with built-in API routes
- **Vercel** — Seamless deployment platform
- **Inter & Space Grotesk** — Beautiful typography from Google Fonts

---

<p align="center">
  Built with 💜 by the AgentX team
</p>
