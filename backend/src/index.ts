import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { v2 as cloudinary } from 'cloudinary';

import router from './routes/router';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

app.use(cors({ origin: true, credentials: true }));

app.use('/api', router);

app.listen(process.env.SERVER_PORT, () => {
    console.log('Server Running');
});
