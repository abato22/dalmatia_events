const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // check if user exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // insert user
    const newUser = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1,$2,$3)
       RETURNING id, username, email`,
      [username, email, password_hash]
    );

    const user = newUser.rows[0];

    // ⭐ CREATE TOKEN (IMPORTANT)
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    // ⭐ RETURN TOKEN
    res.json({ token, user });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});


// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // create token
    const token = jwt.sign(
      { id: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
