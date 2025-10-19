const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/user");

const register = async (req, res, next) => {
  try {
    const { nom, email, password, sexe, profession, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email déjà utilisé" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    // Création du nouvel utilisateur
    const user = new User({
      nom,
      email,
      passwordHash,
      role,
      sexe,
      profession,
      phone,
      image,
    });

    const savedUser = await user.save(); // <--- correction ici

    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res
      .status(201)
      .json({ message: "Inscription réussie", token, user: savedUser });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Utilisateur introuvable" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.status(401).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ message: "Connexion réussie", token, user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
