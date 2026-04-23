import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
dotenv.config();
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    cors(corsOptions)(req, res, next);
    return;
  }

  next();
});
app.use(limiter)
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/round", requireAuth(), requireAllowedEmail, roundRoutes);
app.use("/api/response", requireAuth(), requireAllowedEmail, responseRoutes);
app.use("/api/question", requireAuth(), requireAllowedEmail, questionRoutes);
app.use("/api/leaderboard", requireAuth(), requireAllowedEmail, leaderboardRoutes);
app.use("/api/auth", requireAuth(), requireAllowedEmail, authRoutes);


export default app;
