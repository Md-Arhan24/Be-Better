const userModel = require("../model/userModel");
const { createSecretToken } = require("../utils/SecretToken");
const bcrypt = require("bcrypt");
const {calculateStreak} = require("../utils/streakHealper");

module.exports.signUp = async (req, res, next) => {
  try {
    //take out the details
    const { username, email, password, createdAt } = req.body;

    //find the user
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({ mesage: "user already exists" });
    }

    const userCreat = await userModel.create({
      username,
      email,
      password,
      createdAt,
    });

    const token = createSecretToken(userCreat._id, userCreat.username);

    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
      sameSite: "lax", //balanced between secutiry and usableity
      secure: false,
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ message: "user successfully signup", success: true, userCreat });
  } catch (e) {
    console.log(e);
  }
};

module.exports.Login = async (req, res, next) => {
  try {
    //take the data from the req.body
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ message: "All field is required" });
    }

    //check for email in data base
    const userFind = await userModel.findOne({ email });

    if (!userFind) {
      return res.json({ message: "incorrect password or email" });
    }

    const passFound = await bcrypt.compare(password, userFind.password);

    if (!passFound) {
      return res.json({ message: "incorrect password or email" });
    }

    const token = createSecretToken(userFind._id,userFind.username);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    res
      .status(201)
      .json({
        message: "user login successfully",
        success: true,
        userId: userFind._id,
        username: userFind.username,
      });
  } catch (e) {
    console.log(e);
  }
};

module.exports.Logout = async (req, res) => {
  try {
    const cookie = req.cookies.token;
    if (!cookie) {
      return res.json({ message: "no active session found", status: false });
    }
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.json({ message: "user logout successfully", status: true });
  } catch (e) {
    console.log(e);
    return res.json({ message: "error in logout", status: false });
  }
};

module.exports.updateStreak = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { current, lastActivityDate } = calculateStreak(
      user.streak.lastActivityDate,
      user.streak.current
    );

    user.streak.current = current;
    user.streak.lastActivityDate = lastActivityDate;
    user.streak.longest = Math.max(user.streak.longest, current);

    await user.save();
    return res.json({ streak: user.streak });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update streak" });
  }
};

module.exports.getStreak = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("streak");
    if (!user) return res.status(404).json({ error: "User not found" });

    // If old user has no streak field, return defaults
    const streak = user.streak ?? { current: 0, longest: 0, lastActivityDate: null };

    return res.json({ streak });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch streak" });
  }
};
