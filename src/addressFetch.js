const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user"); // Assume you have a user model

const app = express();
const PORT = 3002;

mongoose.connect(
  "mongodb+srv://kirillsakharov:Blockchain123@cluster1.rxxvrjb.mongodb.net/",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

app.get("/getAddress/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username: username });

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
