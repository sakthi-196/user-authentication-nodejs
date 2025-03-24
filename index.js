import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRouter from './routers/authRouter.js';
import postsRouter from './routers/postsRouter.js';
dotenv.config();
const app=express()
app.use(cors())
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
//app.use(express.urlencoded({extended:true}));
app.use(bodyParser.urlencoded({extended:true}));
//db connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(()=>{
        console.log('Database connected');
    })
    .catch((err)=>{
        console.error(err.message);
    });
//routes
app.use('/api/auth',authRouter);
app.use('/api/posts',postsRouter);
app.get('/',(req,res)=>{
    res.json({message:'Hello from server'})
})
const PORT=process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`server running on the port:${PORT}`)
})