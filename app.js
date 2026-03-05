import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
//import userRouter from './router/user.router.js';
import roundRoutes from "./routes/round.routes.js"
import responseRoutes from "./routes/response.routes.js"
import questionRoutes from "./routes/question.routes.js"
import leaderboardRoutes from "./routes/leaderboard.routes.js"
import authRoutes from "./routes/auth.routes.js"
import limiter from "./middleware/ratelimiter.js"
import morgan from 'morgan';
import { requireAllowedEmail } from './middleware/auth.middleware.js';
import { requireAuth } from '@clerk/express';
const app = express();
app.use(limiter)
app.use(morgan('dev'));
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use("/api/round", requireAuth(), requireAllowedEmail, roundRoutes);
app.use("/api/response", requireAuth(), requireAllowedEmail, responseRoutes);
app.use("/api/question", requireAuth(), requireAllowedEmail, questionRoutes);
app.use("/api/leaderboard", requireAuth(), requireAllowedEmail, leaderboardRoutes);
app.use("/api/auth", requireAuth(), requireAllowedEmail, authRoutes);


export default app;