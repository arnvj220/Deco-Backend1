import rateLimit from "express-rate-limit"

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 3 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => req.method === "OPTIONS",
  message: "Too many requests from this IP, please try again later."
})

export default limiter
