const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());

app.use(bodyParser.json());

app.use("/uploads", express.static("./uploads"));

mongoose.connect(
  "mongodb+srv://kirillsakharov:Blockchain123@cluster1.rxxvrjb.mongodb.net/",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const UserSchema = new mongoose.Schema({
  username: String,
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  address: String,
  mnemonic: String,
  profilePic: String,
});

const User = mongoose.model("User", UserSchema);

const multer = require("multer");

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
});

// Endpoint for uploading the profile picture
app.post("/uploadProfilePic", upload.single("profilePic"), async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }

    user.profilePic = req.file.path;
    await user.save();

    res.status(200).json({
      message: "Profile picture uploaded successfully!",
      imageUrl: `/uploads/${req.file.filename}`, // Provide a public URL
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.get("/getUserProfilePic/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ profilePic: user.profilePic });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

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
  const { username, firstName, lastName, email, password, address, mnemonic } =
    req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    firstName,
    lastName,
    email,
    password: hashedPassword,
    address,
    mnemonic,
    profilePic: null,
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
