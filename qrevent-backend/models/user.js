const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["Participant", "visiteur", "Organisateur", "Administrateur"],
    default: "Participant",
  },
  sexe: {
    type: String,
    enum: ["Homme", "Femme", "Autre"],
  },
  profession: {
    type: String,
  },
  phone: { type: String },
  image: {
    type: String,
    default: "",
  },
  participatedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
