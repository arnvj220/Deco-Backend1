import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
//import userRouter from './router/user.router.js';
import roundRoutes from "./routes/round.routes"
import responseRoutes from "./routes/response.routes"
import leaderboardRoutes from "./routes/leaderboard.routes"
import morgan from 'morgan';
const app = express();
app.use(morgan('dev'));
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use("/user", userRouter);
app.use("/api/round", roundRoutes)
app.use("/api/response", responseRoutes)
app.use("/api/leaderboard", leaderboardRoutes)
app.use(cors(
    {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    }
));

export default app;