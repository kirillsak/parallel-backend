const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());

app.use(bodyParser.json());

mongoose.connect(
  "mongodb+srv://kirillsakharov:Blockchain123@cluster1.rxxvrjb.mongodb.net/",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  address: String,
  mnemonic: String,
});

const User = mongoose.model("User", UserSchema);

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).send({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).send({ message: "Invalid password" });
  }

  res.send({ message: "Logged in successfully" });
});

app.post("/register", async (req, res) => {
  const { username, email, password, address, mnemonic } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    address,
    mnemonic,
  });

  try {
    await newUser.save();
    res.send({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).send({ message: "Error registering user" });
  }
});

app.get("/getAddress/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username: username });
    const testUser = await User.findOne({ username: "account" });
    console.log("finding");
    console.log(testUser);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ address: user.address });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
