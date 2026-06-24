# thriftAssist

An AI-powered sustainable fashion assistant that helps users build personal style through thrift-first, lower-waste recommendations. It includes AI stylist chat powered by Anthropic Claude, body measurement analysis, saved style profiles, eBay-powered secondhand product recommendations, and account login/signup.

> thriftAssist is designed around sustainable fashion: secondhand finds, vintage pieces, wardrobe remixing, repair, rewearing, and buying fewer better items.

## Sustainable Fashion Focus

| Principle | How thriftAssist Applies It |
| --- | --- |
| Thrift first | Product searches are nudged toward secondhand, pre-owned, and vintage eBay listings. |
| Lower waste | The chat encourages rewearing, remixing, tailoring, and mending before buying new. |
| Personal fit | Recommendations still account for body type, aesthetics, colors, budget, and occasions. |
| Transparent matches | The backend ranks products and gives match reasons before the AI explains them. |

## Tech Stack

- Node.js 18+
- Express
- MongoDB
- HTML/CSS
- Bootstrap 5
- Anthropic Claude API
- eBay Browse API for thrift-first product search

## Prerequisites

- Node.js 18 or newer
  - Check with `node --version`
  - If you use nvm: `nvm install 18 && nvm use 18`
- npm
- MongoDB 7, either local or Docker
- Anthropic API key for sustainable AI stylist chat
  - The rest of the app can run without it, but chat calls need `ANTHROPIC_API_KEY`.
- eBay API credentials for product recommendations
  - The rest of the app can run without them, but eBay product search needs `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET`.

## Fresh Clone Setup

```bash
git clone https://github.com/sokoruwa/thriftAssist.git
cd thriftAssist
nvm use # optional, if you use nvm
npm install
```

Create your local `.env` file. This file stores settings for your machine and is not committed to Git.

```bash
cp -n .env.example .env
```

That command copies `.env.example` to `.env` only if `.env` does not already exist. If you already have a `.env` file, leave it alone.

Open `.env` and set at least:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/thriftAssist
SESSION_SECRET=replace-with-a-long-random-secret
ANTHROPIC_API_KEY=your_api_key_here
EBAY_CLIENT_ID=your_ebay_client_id
EBAY_CLIENT_SECRET=your_ebay_client_secret
```

`ANTHROPIC_API_KEY`, `EBAY_CLIENT_ID`, and `EBAY_CLIENT_SECRET` can be left blank while working on non-chat and non-product-search pages.

## Local Development

You need MongoDB and the Node server running.

### 1. Start MongoDB

Docker option:

```bash
docker run -d -p 27017:27017 --name thriftAssist-mongo mongo:7
```

After the first Docker run, start or stop the same container with:

```bash
docker start thriftAssist-mongo
docker stop thriftAssist-mongo
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
| `http://localhost:4000/chat_bot.html` | Sustainable AI stylist chat |
| `http://localhost:4000/profile_page.html` | Style profile, requires login |

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string used by Mongoose. |
| `SESSION_SECRET` | Yes | Secret used to sign session cookies. |
| `NODE_ENV` | No | Use `production` in production to enable secure cookies. |
| `PORT` | No | Server port, defaults to `4000`. |
| `CORS_ORIGIN` | No | Allowed browser origin, defaults to `http://localhost:4000`. |
| `SESSION_NAME` | No | Session cookie name, defaults to `thriftAssist.sid`. |
| `SESSION_MAX_AGE_MS` | No | Session cookie lifetime, defaults to one day. |
| `TRUST_PROXY` | No | Set to `true` when running behind a trusted HTTPS proxy. |
| `ANTHROPIC_API_KEY` | Required for chat | Anthropic API key for chat. |
| `EBAY_CLIENT_ID` | Required for product search | eBay client ID for thrift-first product recommendations. |
| `EBAY_CLIENT_SECRET` | Required for product search | eBay client secret for thrift-first product recommendations. |
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
docker stop thriftAssist-mongo
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
mongodb://127.0.0.1:27017/thriftAssist
```

`Failed to unlink socket file` with `/tmp/mongodb-27017.sock`

Remove the stale MongoDB socket file, then start MongoDB again:

```bash
sudo rm /tmp/mongodb-27017.sock
mongod --dbpath ~/mongodb-data
```

Port `4000` already in use

Either stop the process using that port or set a different `PORT` in `.env`.

Chat is not responding

Check that `ANTHROPIC_API_KEY` is set, valid, and has available credits.
