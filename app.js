import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
//import userRouter from './router/user.router.js';
import morgan from 'morgan';
const app = express();
app.use(morgan('dev'));
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use("/user", userRouter);
app.use(cors(
    {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    }
));

export default app;