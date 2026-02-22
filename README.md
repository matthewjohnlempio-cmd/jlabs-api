# JLabs Backend API

This is the Node.js/Express backend for the JLabs Developer Assessment challenge.  
It provides a simple authentication endpoint (`POST /login`) connected to MongoDB Atlas.

**Live deployment**: https://jlabs-api.vercel.app/

## Features
- User login authentication with email/password
- Passwords hashed using bcryptjs
- MongoDB Atlas integration with Mongoose
- CORS enabled for the frontend
- Health check endpoint (`GET /`)
- Deployed serverlessly on Vercel

## Tech Stack
- Node.js + Express
- MongoDB (Atlas) + Mongoose
- bcryptjs (password hashing)
- dotenv (environment variables)
- cors (cross-origin requests)
- Vercel (serverless deployment)

## Prerequisites
- Node.js v18+ and npm
- MongoDB Atlas free-tier account (or local MongoDB instance)

## Local Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/jlabs-api.git
   cd jlabs-api

Install dependenciesBashnpm install
Set up environment variablesThe project uses a .env file for secrets (MongoDB connection, etc.).
This file is not included in the repository for security reasons.
Create a new file called .env in the project root (use any text editor)
Or copy the example as a starting point:Bash# Windows (PowerShell / CMD)
copy .env.example .env

# macOS / Linux
cp .env.example .env
Open .env and add your values:text# MongoDB Atlas connection string
# Get this from Atlas → Cluster → Connect → Drivers
MONGO_URI=mongodb+srv://<your-username>:<your-password>@cluster1.ndbx1yn.mongodb.net/jlabs_db?retryWrites=true&w=majority

# Optional: server port (defaults to 8000)
PORT=8000Tips:
Replace <your-username> and <your-password> with your own Atlas credentials
If password contains special characters (@ / : ? # % &), URL-encode them (e.g. @ → %40)
In Atlas Network Access → add 0.0.0.0/0 (allow all IPs for testing)


Seed the test user
Creates devuser@jlabs.test / TestPass123!Bashnode seed/userSeeder.jsExpected output: "User seeded!"
Start the serverBashnpm start
# or
node api/index.js→ Server runs on http://localhost:8000
Verify it's working
Open browser: http://localhost:8000/
→ Should return JSON:JSON{
  "message": "JLABS API is running",
  "environment": "development",
  "mongoStatus": "connected",
  ...
}
Test login (using curl or Postman):Bashcurl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"devuser@jlabs.test","password":"TestPass123!"}'Expected success:JSON{"message":"Login successful","token":"dummy-token-for-now"}


API Endpoints


























MethodPathDescriptionRequest Body (JSON)Response (success)POST/loginAuthenticate user{ "email", "password" }{ "message": "Login successful", "token": "..." }GET/Health check & DB status—{ "message": "...", "mongoStatus": "connected" }
Deployment (Vercel)
Already deployed at: https://jlabs-api.vercel.app/
Environment variables configured in Vercel dashboard:

MONGO_URI = production Atlas connection string

Vercel runs the exported Express app directly (no app.listen() needed).
Security & Notes

.env is not committed (protected by .gitignore)
Passwords are hashed with bcryptjs
CORS restricted to frontend origins
Uses MongoDB Atlas free tier (no local DB required)

License
ISC

Submitted for JLabs Developer Assessment – February 2026
Matthew John Lempio
text### How to use this

1. Open your `jlabs-api` repo on GitHub (or locally)
2. Click **Add file → Create new file** (or edit existing README.md)
3. Paste the entire content above
4. Replace `YOUR-USERNAME` with your actual GitHub username
5. Commit with message: "Add complete README with setup instructions"
6. Done!

This version pastes cleanly into GitHub's editor without breaking indentation or tables.  
Let me know if you want the frontend README next or any small changes (e.g. add screenshots,
