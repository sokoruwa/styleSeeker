# styleseeker

An AI-powered personal fashion assistant that helps users discover their style aesthetic through conversation. It includes AI stylist chat powered by Anthropic Claude, body measurement analysis, saved style profiles, and account login/signup.

## Tech Stack

- Node.js 18+
- Express
- MongoDB
- HTML/CSS
- Bootstrap 5
- Anthropic Claude API

## Prerequisites

- Node.js 18 or newer
  - Check with `node --version`
  - If you use nvm: `nvm install 18 && nvm use 18`
- npm
- MongoDB 7, either local or Docker
- Anthropic API key for AI stylist chat
  - The rest of the app can run without it, but chat calls need `ANTHROPIC_API_KEY`.

## Fresh Clone Setup

```bash
git clone https://github.com/sokoruwa/styleSeeker.git
cd styleSeeker
nvm use # optional, if you use nvm
npm install
cp .env.example .env
```

Edit `.env` and set at least:

```bash
MONGODB_URI=mongodb://localhost:27017/styleSeeker
SESSION_SECRET=replace-with-a-long-random-secret
ANTHROPIC_API_KEY=your_api_key_here
```

`ANTHROPIC_API_KEY` can be left blank while working on non-chat pages.

## Local Development

You need MongoDB and the Node server running.

### 1. Start MongoDB

Docker option:

```bash
docker run -d -p 27017:27017 --name styleseeker-mongo mongo:7
```

After the first Docker run, start or stop the same container with:

```bash
docker start styleseeker-mongo
docker stop styleseeker-mongo
```

Local MongoDB option:

```bash
mkdir -p ~/mongodb-data
mongod --dbpath ~/mongodb-data
```

Leave the MongoDB terminal running if you use the local option.

### 2. Start the App

For normal startup:

```bash
npm start
```

For development with automatic restart on file changes:

```bash
npm run dev
```

Open `http://localhost:4000`.

## npm Scripts

| Command | Description |
| --- | --- |
| `npm start` | Starts the Express server with `node src/server.js`. |
| `npm run dev` | Starts the server with Node watch mode. |
| `npm test` | Runs the Jest API test suite. |
| `npm run lint` | Runs a dependency-free JavaScript syntax check. |

## Pages

| URL | Description |
| --- | --- |
| `http://localhost:4000` | Home |
| `http://localhost:4000/login.html` | Login |
| `http://localhost:4000/create_account.html` | Sign up |
| `http://localhost:4000/fit_calculator.html` | Body measurement and body type analysis |
| `http://localhost:4000/chat_bot.html` | AI stylist chat |
| `http://localhost:4000/profile_page.html` | Style profile, requires login |

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string used by Mongoose. |
| `SESSION_SECRET` | Yes | Secret used to sign session cookies. |
| `NODE_ENV` | No | Use `production` in production to enable secure cookies. |
| `PORT` | No | Server port, defaults to `4000`. |
| `CORS_ORIGIN` | No | Allowed browser origin, defaults to `http://localhost:4000`. |
| `SESSION_NAME` | No | Session cookie name, defaults to `styleseeker.sid`. |
| `SESSION_MAX_AGE_MS` | No | Session cookie lifetime, defaults to one day. |
| `TRUST_PROXY` | No | Set to `true` when running behind a trusted HTTPS proxy. |
| `ANTHROPIC_API_KEY` | Required for chat | Anthropic API key for chat. |
| `EBAY_CLIENT_ID` | No | eBay client ID for product search. |
| `EBAY_CLIENT_SECRET` | No | eBay client secret for product search. |
| `CHAT_MAX_MESSAGES` | No | Maximum messages in one `/api/chat` request, defaults to `20`. |
| `CHAT_MAX_MESSAGE_LENGTH` | No | Maximum characters per chat message, defaults to `2000`. |
| `CHAT_MAX_TOOL_LOOPS` | No | Maximum tool recursion loops in chat, defaults to `3`. |
| `ANTHROPIC_TIMEOUT_MS` | No | Timeout for Anthropic provider calls, defaults to `30000`. |

## Testing and Checks

```bash
npm run lint
npm test
```

The tests provide their own test environment variables in `test/setupEnv.js`.

## Stopping Local Services

Stop the Node server with `Ctrl+C`.

Stop Docker MongoDB:

```bash
docker stop styleseeker-mongo
```

Stop local MongoDB with `Ctrl+C` in its terminal. If needed, find processes by port:

```bash
lsof -i:4000
lsof -i:27017
```

## Troubleshooting

`fetch is not defined`

Use Node 18 or newer:

```bash
nvm install 18
nvm use 18
```

`MONGODB_URI is required` or `SESSION_SECRET is required`

Create `.env` from `.env.example` and fill in the required values:

```bash
cp .env.example .env
```

MongoDB connection errors

Make sure MongoDB is running and that `MONGODB_URI` points to the same host and port. The default local URI is:

```bash
mongodb://localhost:27017/styleSeeker
```

Port `4000` already in use

Either stop the process using that port or set a different `PORT` in `.env`.

Chat is not responding

Check that `ANTHROPIC_API_KEY` is set, valid, and has available credits.
