# 🛡️ CyberGuard Academy

A gamified cybersecurity training platform — like Duolingo for cybersecurity. Learn through real-world simulations, earn XP and badges, and climb the global leaderboard.

---

## 🚀 Features

- **40+ Interactive Simulations** across 4 difficulty levels (Beginner → Intermediate → Advanced → Pro)
- **Gamification**: XP points, badges, level progression, daily streaks
- **Real Scenarios**: Phishing emails, network intrusion logs, social engineering chats, malware analysis
- **Threat Intel Feed**: Live cybersecurity news from The Hacker News, Krebs on Security, BleepingComputer
- **Analytics Dashboard**: Track weak areas, accuracy by category, recent activity
- **Global Leaderboard**: Compete with other learners worldwide
- **JWT Authentication**: Secure login/signup with bcrypt password hashing
- **Dark Mode**: Full dark-themed UI (light mode toggle available)

---

## 🏗️ Architecture

```
/
├── backend/           # Node.js + Express + MongoDB API
│   ├── config/        # Database connection
│   ├── controllers/   # Business logic
│   ├── data/          # Simulation seed data (40+ simulations)
│   ├── middleware/    # Auth + Rate limiting
│   ├── models/        # Mongoose schemas
│   └── routes/        # Express routes
│
└── cybersafe-frontend/  # React + Vite + TailwindCSS v4
    └── src/
        ├── components/  # Reusable UI components
        ├── hooks/       # Custom React hooks
        ├── pages/       # Route pages
        ├── services/    # API service layer (Axios)
        └── store/       # Zustand global state
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your values:
#   MONGODB_URI=mongodb://localhost:27017/cyberguard
#   JWT_SECRET=your_very_secret_key_here
#   NEWS_API_KEY=optional_for_news_api

# Seed the database with 40 simulations
npm run seed

# Start the development server
npm run dev
```

Backend runs on: `http://localhost:5000`

### 2. Frontend Setup

```bash
cd cybersafe-frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update username |

### Simulations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/simulations` | List simulations (filter by level, category) |
| GET | `/api/simulations/:id` | Get single simulation with steps |
| POST | `/api/simulations/:id/submit` | Submit answers, get score |
| GET | `/api/simulations/level-progress` | Level completion counts |

### Progress & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress` | Full user progress analytics |
| GET | `/api/progress/:simId` | Progress for specific simulation |

### Content & Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/news` | Cybersecurity news articles |
| GET | `/api/leaderboard` | Global XP leaderboard |

---

## 🎮 Simulation Levels

| Level | XP Required | Simulations | Topics |
|-------|------------|-------------|--------|
| Beginner | 0 XP | 10 | Phishing basics, password security, safe browsing, social media privacy |
| Intermediate | 500 XP | 10 | Spear phishing, SQL injection, MITM, ransomware response, network intrusion |
| Advanced | 2000 XP | 10 | APT kill chain, zero-days, cloud misconfiguration, malware analysis |
| Pro | 5000 XP | 10 | Red team/blue team, nation-state actors, CISO crisis, quantum cryptography |

---

## 🏆 Scoring System

| Score | Grade | XP Multiplier |
|-------|-------|---------------|
| 85-100% | Excellent 🏆 | 1.5x |
| 60-84% | Good 🥈 | 1.0x |
| 0-59% | Poor 📚 | 0.5x |

Speed bonus: +20 XP for completing in under 2 minutes.

---

## 🏅 Badges

| Badge | Condition |
|-------|-----------|
| 🎣 Phishing Expert | Complete all phishing simulations |
| 🦠 Malware Hunter | Complete all malware simulations |
| 🔐 Secure Password Master | Complete all password simulations |
| 🎭 Social Defender | Complete all social engineering simulations |
| 🌐 Network Guardian | Complete all network simulations |
| 👁️ Privacy Champion | Complete all privacy simulations |
| 🎓 Beginner Graduate | Complete all 10 beginner simulations |
| 🏅 Intermediate Graduate | Complete all 10 intermediate simulations |
| 🥇 Advanced Graduate | Complete all 10 advanced simulations |
| ⚔️ Cyber Guardian | Complete all 40 simulations |
| 💯 Perfect Score | Achieve 100% on any simulation |
| ⚡ Speed Demon | Complete a simulation in under 60 seconds |

---

## 🔐 Security Features

- **bcrypt** password hashing (12 rounds)
- **JWT** authentication with 7-day expiry
- **Rate limiting**: 10 auth attempts / 15 min, 200 global requests / 15 min
- **Input validation** with express-validator
- **CORS** configured for frontend origin only

---

## 🛠️ Tech Stack

**Frontend:**
- React 19 + Vite 8
- TailwindCSS v4
- Zustand (state management)
- Axios (HTTP client)
- React Router v7
- Lucide React (icons)

**Backend:**
- Node.js + Express 4
- MongoDB + Mongoose 8
- bcryptjs, jsonwebtoken
- rss-parser (news feeds)
- express-rate-limit, express-validator

---

## 🌐 Live RSS Feeds

The platform fetches cybersecurity news from:
- The Hacker News (`feedburner`)
- Krebs on Security
- Dark Reading
- BleepingComputer
- Threatpost

Falls back to curated CISA/NIST content when feeds are unavailable.

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `backend/data/simulations.js` | All 40 simulation scenarios with questions, answers, and explanations |
| `backend/server.js` | Express app entry point |
| `cybersafe-frontend/src/pages/SimulationPlayer.jsx` | Interactive simulation engine |
| `cybersafe-frontend/src/store/useStore.js` | Zustand global state |
| `cybersafe-frontend/src/services/api.js` | All API calls |
