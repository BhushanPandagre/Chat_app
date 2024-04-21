import { errorHandler } from "./errorMiddleware.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
  // use this code if you want to get token from headers instead of cookies:
  //   let token;
  //   if (
  //     req.headers.authorization &&
  //     req.headers.authorization.startsWith("Bearer")
  //   ) {
  try {
    //   token = req.headers.authorization.split(" ")[1];

    //   Or use this code if you want to get token from cookies after installing cookie-parser:
    const token = req.cookies.access_token;

    if (!token) return next(errorHandler(401, "Not authorized, no token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (error) {
    next(errorHandler(401, "Not authorized, token failed"));
  }
  //   }
};
