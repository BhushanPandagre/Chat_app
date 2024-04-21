import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../middleware/errorMiddleware.js";

const registerUser = async (req, res, next) => {
  const { username, email, password, pic } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) return next(errorHandler(400, "User already exists"));

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      pic: "https://avatar.iran.liara.run/public",
      isOnline: true,
    });

    // Delete the password from the response
    user.password = undefined;

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res
      .cookie("access_token", token, { httpOnly: true })
      .status(201)
      .json(user);
  } catch (error) {
    next(error);
  }
};

const authUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) return next(errorHandler(404, "User not found"));

    const isMatch = bcryptjs.compareSync(password, user.password);

    if (!isMatch) return next(errorHandler(401, "Wrong credentials!"));

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { isOnline: true },
      { new: true }
    );

    res
      .cookie("access_token", token, { httpOnly: true })
      .status(201)
      .json(updatedUser);
  } catch (error) {
    next(error);
  }
};

const allUsers = async (req, res, next) => {
  try {
    const keyword = req.query.search && {
      $or: [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ],
    };

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { isOnline: false },
      { new: true }
    );
    res.clearCookie("access_token").status(200).send("Logged out successfully");
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const updatedUserPic = await User.findByIdAndUpdate(
      req.user._id,
      {
        pic: req.body.img,
      },
      {
        new: true,
      }
    );
    res.status(200).json(updatedUserPic);
  } catch (error) {
    next(error);
  }
};

export { registerUser, authUser, allUsers, logout, updateUser };
