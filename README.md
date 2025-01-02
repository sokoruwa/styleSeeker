# styleSeeker
styleSeeker: An AI-powered fashion recommendation system. 

Features: 
• Personalized style suggestions 
• Virtual wardrobe 
• Outfit generation
• E-commerce integration
• Trend analysis 

Tech: 
• Javascript,
• Node.js
• MongoDB
• HTML
• CSS   


Revolutionizing personal style with AI. Contribute or try it out!

## Getting Started

Follow these instructions to set up and run the styleSeeker project on your local machine.

### Prerequisites

- Node.js (version 14.x or higher)
- npm (version 6.x or higher)
- MongoDB (version 4.4 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/styleSeeker.git
   cd styleSeeker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up MongoDB:
   - Ensure MongoDB is installed and running on your system.
   - Create a new database for the project:
     ```
     mongo
     use styleSeeker
     exit
     ```

4. Configure environment variables:
   - Create a `.env` file in the root directory of the project.
   - Add the following variables (adjust as needed):
     ```
     PORT=3000
     MONGODB_URI=mongodb://localhost:27017/styleSeeker
     ```

### Running the Project

1. Start the MongoDB service (if not already running):
   ```
   sudo service mongod start  # On Linux
   brew services start mongodb-community  # On macOS with Homebrew
   ```

2. Start the Node.js server:
   ```
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000` to view the application.

### Additional Scripts

- Build the project:
  ```
  npm run build
  ```

- Run tests:
  ```
  npm test
  ```

- Start in production mode:
  ```
  npm start
  ```

## Development

For development, you might want to use nodemon to automatically restart the server when files change:

```
npm install nodemon --save-dev
```

Then add a script to your `package.json`:

```json
"scripts": {
  "dev": "nodemon server.js"
}
```

Replace `server.js` with your main server file.

## Database Management

To manage your MongoDB database, you can use MongoDB Compass, a GUI tool for MongoDB:

1. Download and install [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Connect to your database using the connection string: `mongodb://localhost:27017/styleSeeker`
