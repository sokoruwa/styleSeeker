# styleSeeker

An AI-powered personal fashion assistant that helps users discover their style aesthetic through conversation. Features a real-time AI stylist (StyleAI) powered by Claude, body type analysis, and a style profile system with a focus on African-inspired aesthetics.

**Features:**
- StyleAI — conversational AI stylist that learns your vibe and saves your style profile
- Fit calculator — body measurement input with body type analysis
- Style profile — saved measurements, body type, and aesthetic preferences
- Account system with login/signup

**Tech stack:** Node.js, Express, MongoDB, HTML/CSS, Bootstrap 5, Anthropic Claude API

---

## Prerequisites

Before you start, make sure you have the following installed:

- **Node.js v18+** (v16 will not work — the app requires native fetch)
  - Check your version: `node --version`
  - Install/upgrade via nvm: `nvm install 18 && nvm use 18`
  - Or via Homebrew: `brew install node@18`
- **MongoDB v7**
  - Check if installed: `mongod --version`
  - Install via Homebrew: `brew install mongodb-community`
- **npm** (comes with Node)
- **An Anthropic API key** — get one at [console.anthropic.com](https://console.anthropic.com)

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/sokoruwa/styleSeeker.git
cd styleSeeker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your `.env` file

Create a file called `.env` in the project root (never commit this file):

```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/styleSeeker
ANTHROPIC_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual Anthropic API key. See `.env.example` for reference.

---

## Running the App

You need two things running: MongoDB and the Node server. Use two separate terminal windows.

### Terminal 1 — Start MongoDB

```bash
mkdir -p ~/data/db
mongod --dbpath ~/data/db
```

Leave this running. You should see `Waiting for connections` in the output.

### Terminal 2 — Start the server

```bash
cd ~/Desktop/PERSONALPROJECTS/styleSeeker
node server.js
```

You should see:
```
[dotenv] injecting env from .env
Server running on port 4000
```

### Open the app

Go to **http://localhost:4000** in your browser.

> Note: Port 3000 may be used by another app on your machine. styleSeeker runs on port **4000**.

---

## Stopping the App

**Stop the server:** Press `Ctrl + C` in Terminal 2

**Stop MongoDB:** Press `Ctrl + C` in Terminal 1

**Kill by port (if needed):**
```bash
lsof -ti:4000 | xargs kill   # kill server
lsof -ti:27017 | xargs kill  # kill MongoDB
```

---

## Pages

| URL | Description |
|-----|-------------|
| `http://localhost:4000` | Home (retro TV landing page) |
| `http://localhost:4000/login.html` | Login |
| `http://localhost:4000/create_account.html` | Sign up |
| `http://localhost:4000/fit_calculator.html` | Body measurement + body type analysis |
| `http://localhost:4000/chat_bot.html` | StyleAI — AI stylist chat |
| `http://localhost:4000/profile_page.html` | Your style profile (requires login) |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Port to run the server on (default: 4000) |
| `MONGODB_URI` | MongoDB connection string |
| `ANTHROPIC_API_KEY` | Your Anthropic API key for StyleAI |

---

## Troubleshooting

**`fetch is not defined` error on startup**
Your Node.js version is too old. Upgrade to v18+:
```bash
nvm install 18 && nvm use 18
```

**`Permission denied` on MongoDB socket**
```bash
sudo rm /tmp/mongodb-27017.sock
mongod --dbpath ~/data/db
```

**`Permission denied` on MongoDB data directory**
```bash
sudo chown -R $(whoami) ~/data/db
mongod --dbpath ~/data/db
```

**Port already in use**
```bash
lsof -ti:4000 | xargs kill
```

**StyleAI not responding**
- Check your `ANTHROPIC_API_KEY` in `.env` is valid and not revoked
- Check the server terminal for error messages
- Make sure you have credits at [console.anthropic.com](https://console.anthropic.com)
