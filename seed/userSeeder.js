const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    const hashedPassword = await bcrypt.hash("5211535", 10); // HASH THE PASSWORD

    const user = new User({
      email: "admin@gmail.com",
      password: hashedPassword, // USE THE HASHED PASSWORD
    });

    await user.save();
    console.log("User seeded!");
    process.exit();
  })
  .catch(err => console.error(err));