// middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import { User, AllowedUsers } from "../models/index.js";
import { configDotenv } from "dotenv";
configDotenv();

const JWT_SECRET = process.env.JWT_SECRET;


/**
 * requireAuth — verifies the JWT cookie and attaches req.user.
 * Handles both authorized users (with userId) and unauthorized users (with email)
 */
export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      
      return res.status(401).json({ message: "Authorization error: not logged in" });
    }

    
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
      
    } catch (err) {
      
      return res.status(401).json({ message: "Authorization error: invalid or expired session" });
    }

    // Handle two types of tokens:
    // 1. Authorized user: { userId, ... }
    // 2. Unauthorized user: { email, name, picture, ... }

    if (payload.userId) {
      // Authorized user - fetch from database
      const user = await User.findById(payload.userId).lean();
      if (!user) {
        
        return res.status(401).json({ message: "Authorization error: user not found" });
      }
      
      req.user = user;
    } else {
      // Unauthorized user - use temp payload data
      
      req.user = {
        email: payload.email,
        name: payload.name,
        avatar_url: payload.picture || null,
        role: "PARTICIPANT",
        _id: null, // No database ID for unauthorized users
      };
    }

    next();
  } catch (err) {
    
    res.status(500).json({ message: "Authorization error" });
  }
};

/**
 * requireOrganizer — must be used after requireAuth.
 */
export const requireOrganizer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "User missing" });
  }
  if (req.user.role !== "ORGANIZER") {
    return res.status(403).json({ message: "Only organizers allowed" });
  }
  next();
};

/**
 * isUserAllowed — checks the AllowedUsers whitelist by email.
 */
export const isUserAllowed = async (email) => {
  const allowedUser = await AllowedUsers.findOne({ email: email.toLowerCase() }).lean();
  return !!allowedUser;
};