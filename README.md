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
   git clone https://github.com/matthewjohnlempio-cmd/jlabs-api.git
   cd jlabs-api

2. **Install dependencies**
   
   This command reads the `package.json` file and automatically installs all required packages (express, mongoose, bcryptjs, etc.).
   
   ```bash
   npm install

4. **Set up environment variables**
   
   The project uses a .env file for secrets (MongoDB connection, etc.).
   This file is not included in the repository for security reasons.
   
    - Create a new file called .env in the project root
   ```bash
   jlabs-api/                  ← root folder
   ├── api/
   │   ├── index.js
   │   └── ...
   ├── models/
   ├── routes/
   ├── seed/
   │   └── userSeeder.js
   ├── .env                    ← CREATE THIS FILE HERE
   ├── package.json
   └── ...
   ```
   
   Open .env and add your values:
  
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
        
5. **Seed the Test User**
   
   The test user is created by the file:
   
   ```bash
   seed/userSeeder.js
   ```

   Inside that file, locate this section:
   ```bash
   const hashedPassword = await bcrypt.hash("Test1234", 10);

   const user = new User({
     email: "user@example.test",
     password: hashedPassword,
   });
   ```
   This is where:
    - The plain-text password is defined
    - The email address is defined
    - The password is hashed before saving

   **Run the Seeder**
   ```bash
   node seed/userSeeder.js
   ```
   If successful, you should see:
   ```bash
   Connected to MongoDB
   User seeded!
   ```
      

6. **Start the server**
   ```bash
   npm start
   # or
   node api/index.js
   ```
   → Server runs on http://localhost:8000
   
7. **Verify it's working**
    - Open browser: http://localhost:8000/
      → Should return JSON like:
      ```JSON
      {
        "message": "JLABS API is running",
        "environment": "development",
        "mongoStatus": "connected",
        ...
      }
      ```
Troubleshooting
   - MongoDB connection fails: Check MONGO_URI format, password encoding, and Atlas Network Access (0.0.0.0/0)
   - Port 8000 in use: Change PORT=8001 in .env or kill the process using the port
   - No response on localhost:8000: Make sure the server is running and terminal is not closed

##License

ISC

Submitted for JLabs Developer Assessment – February 2026

Matthew John Lempio

