const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const serverless = require("serverless-http");
const authRoutes = require("./routes/auth");
require("dotenv").config();

const app = express();

/*
=====================================================
CORS CONFIGURATION
=====================================================
Allow:
- Local development frontend
- Production frontend domain
=====================================================
*/

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://jlabs-web-six.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(express.json());

/*
=====================================================
MongoDB Connection Handling (Serverless Safe)
=====================================================
Prevents repeated connection attempts in Vercel
=====================================================
*/

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
  }
}

/*
Middleware ensures DB is connected before routes execute
*/
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

/*
=====================================================
Routes
=====================================================
*/

app.use("/api", authRoutes);

/*
=====================================================
Export Serverless App
=====================================================
*/

module.exports = serverless(app);