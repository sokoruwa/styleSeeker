# styleSeeker

An AI-powered personal fashion assistant that helps users discover their style aesthetic through conversation. Features a real-time AI stylist (StyleAI) powered by Claude, body type analysis, and a style profile system with a focus on African-inspired aesthetics.

**Features:**
- StyleAI — conversational AI stylist that learns your vibe and saves your style profile
- Fit calculator — body measurement input with body type analysis
- Style profile — saved measurements, body type, and aesthetic preferences
- Account system with login/signup

**Tech stack:** Node.js, Express, MongoDB, HTML/CSS, Bootstrap 5, Anthropic Claude API

---

## My Quick Start (Sophia's setup)

Every time you restart your machine, run these before `node src/server.js`:

```bash
# 1. Start MongoDB (uses ~/mongodb-data as the data directory)
mongod --dbpath ~/mongodb-data --fork --logpath ~/mongodb-data/mongod.log

# 2. Switch to Node 18
nvm use 18

# 3. Start the app
cd ~/Desktop/PERSONALPROJECTS/styleSeeker
node src/server.js
```

Then open **http://localhost:4000**.

To stop MongoDB when you're done:
```bash
lsof -ti:27017 | xargs kill
```

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
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/styleSeeker
SESSION_SECRET=replace-with-a-long-random-secret
ANTHROPIC_API_KEY=your_api_key_here
```

Replace `SESSION_SECRET` with a long random value and `your_api_key_here` with your actual Anthropic API key. See `.env.example` for reference.

---

## Running the App

You need two things running: MongoDB and the Node server.

### Option A — MongoDB via Docker (recommended)

If you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed, this is the easiest way — no permission errors, no data directory to manage.

**First time only:**
```bash
docker run -d -p 27017:27017 --name styleseeker-mongo mongo:7
```

**Every time after:**
```bash
docker start styleseeker-mongo   # start
docker stop styleseeker-mongo    # stop
```

**Check if it's running:**
```bash
docker ps
```

---

### Option B — MongoDB manually

```bash
mkdir -p ~/data/db
sudo chown -R $(whoami) ~/data/db
mongod --dbpath ~/data/db
```

Leave this terminal running. You should see `Waiting for connections` in the output.

---

### Terminal — Start the server

```bash
cd ~/Desktop/PERSONALPROJECTS/styleSeeker
node src/server.js
```

You should see the server start and log `Server running on port 4000`.

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

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string used by Mongoose |
| `SESSION_SECRET` | Yes | Long random secret used to sign session cookies |
| `NODE_ENV` | No | Set to `production` in production to enable secure cookies |
| `PORT` | No | Port to run the server on (default: 4000) |
| `CORS_ORIGIN` | No | Allowed browser origin (default: `http://localhost:4000`) |
| `SESSION_NAME` | No | Session cookie name (default: `styleseeker.sid`) |
| `SESSION_MAX_AGE_MS` | No | Session cookie lifetime in milliseconds (default: one day) |
| `TRUST_PROXY` | No | Set to `true` when running behind a trusted HTTPS proxy |
| `ANTHROPIC_API_KEY` | Yes for StyleAI | Anthropic API key for StyleAI chat |
| `EBAY_CLIENT_ID` | No | eBay client ID for product search |
| `EBAY_CLIENT_SECRET` | No | eBay client secret for product search |
| `CHAT_MAX_MESSAGES` | No | Maximum messages allowed in one `/api/chat` request (default: 20) |
| `CHAT_MAX_MESSAGE_LENGTH` | No | Maximum characters allowed per chat message (default: 2000) |
| `CHAT_MAX_TOOL_LOOPS` | No | Maximum tool recursion loops allowed in chat (default: 3) |
| `ANTHROPIC_TIMEOUT_MS` | No | Timeout for Anthropic provider calls in chat (default: 30000) |

## Testing

Run the API test suite with:

```bash
npm test
```

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

**Check what's running**
```bash
lsof -i:4000    # is the server running?
lsof -i:27017   # is MongoDB running?
docker ps       # is MongoDB Docker container running?
```

**StyleAI not responding**
- Check your `ANTHROPIC_API_KEY` in `.env` is valid and not revoked
- Check the server terminal for error messages
- Make sure you have credits at [console.anthropic.com](https://console.anthropic.com)
