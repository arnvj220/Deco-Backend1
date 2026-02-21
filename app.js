import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
//import userRouter from './router/user.router.js';
import roundRoutes from "./routes/round.routes.js"
import responseRoutes from "./routes/response.routes.js"
import leaderboardRoutes from "./routes/leaderboard.routes.js"
import authRoutes from "./routes/auth.routes.js"
import morgan from 'morgan';
const app = express();
app.use(morgan('dev'));
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

//app.use("/user", userRouter);
app.use("/api/round", roundRoutes)
app.use("/api/response", responseRoutes)
app.use("/api/leaderboard", leaderboardRoutes)
app.use("/api/auth", authRoutes);


export default app;