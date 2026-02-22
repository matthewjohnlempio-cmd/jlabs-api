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

2. **Install dependencies**
   ```bash
   npm install

3. **Set up environment variables**
   The project uses a .env file for secrets (MongoDB connection, etc.).
   This file is not included in the repository for security reasons.
    - Create a new file called .env in the project root (use any text editor)
    - Or copy the example as a starting point:
      
   ```bash
   # Windows (PowerShell / CMD)
   copy .env.example .env

   # macOS / Linux
   cp .env.example .env
 
- Open .env and add your values:
  
   ```text
   # MongoDB Atlas connection string
   # Get this from Atlas → Cluster → Connect → Drivers
   MONGO_URI=mongodb+srv://<your-username>:<your-password>@cluster1.ndbx1yn.mongodb.net/jlabs_db?retryWrites=true&w=majority

   # Optional: server port (defaults to 8000)
   PORT=8000Tips:
   ```
   
   **Tips:**
      - Replace `<your-username>` and `<your-password>` with your own Atlas credentials
      - If password contains special characters (@ / : ? # % &), URL-encode them (e.g. @ → %40)
      - In Atlas Network Access → add `0.0.0.0/0` (allow all IPs for testing)
        
4. **Seed the test user**
   Creates `devuser@jlabs.test` / `TestPass123!`
   ```bash
   node seed/userSeeder.js
   ```
   Expected output: "User seeded!"

5. **Start the server**
   ```bash
   npm start
   # or
   node api/index.js
   ```
   → Server runs on http://localhost:8000


