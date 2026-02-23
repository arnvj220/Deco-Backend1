import { supabase } from "../config/supabase.js";


export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log(token);
    const { data, error } = await supabase.auth.getUser(token);
    console.log(data);
    if (error || !data?.user) { 
      return res.status(401).json({
        status: false,
        message: "Invalid or expired token",
      });
    }

    // Attach user to request
    req.user = data.user;

    next();
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
};