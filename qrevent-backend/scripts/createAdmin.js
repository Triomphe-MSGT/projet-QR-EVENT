require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const config = require("../utils/config");

const createAdmin = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(config.MONGODB_URI);
    console.log("Connected.");

    const email = "triomphe1980@gmail.com";
    const password = "password123";
    const nom = "triomphe";

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("User found. Updating to Administrator...");
      const passwordHash = await bcrypt.hash(password, 10);
      existingUser.passwordHash = passwordHash;
      existingUser.role = "Administrateur";
      existingUser.nom = nom;
      await existingUser.save();
      console.log("User updated successfully.");
    } else {
      console.log("User not found. Creating new Administrator...");
      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = new User({
        nom,
        email,
        passwordHash,
        role: "Administrateur",
      });
      await newUser.save();
      console.log("Admin user created successfully.");
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    mongoose.connection.close();
  }
};

createAdmin();
