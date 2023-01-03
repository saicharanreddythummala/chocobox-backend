import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { productsRouter } from './routes/productsRoute.js';
import { createConnection } from './config/database.js';
import { errorMiddleWare } from './middleware/error.js';
import { userRoutes } from './routes/userRoutes.js';
import { orderRoutes } from './routes/orderRoute.js';
import cloudinary from 'cloudinary';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import { paymentRoutes } from './routes/paymentRoute.js';
import { contactRoute } from './routes/contactRoute.js';

dotenv.config();

//handling uncaught exception
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Server shut down due to uncaught exception error`);

  process.exit(1);
});

//database connection
createConnection();

//cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

//cors options
const corsOptions = {
  origin: ['http://localhost:3000','https://choco-box.netlify.app'],
  credentials: true,
};

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

//Importing Routes
app.use('/api/v1', productsRouter);
app.use('/api/v1', userRoutes);
app.use('/api/v1/', orderRoutes);
app.use('/api/v1/', paymentRoutes);
app.use('/api/v1/', cors({ origin: '*', credentials: false }), contactRoute);

app.get('/', (req, res) => {
  res.send('App is working fine');
});

//error middleware
app.use(errorMiddleWare);

const server = app.listen(process.env.PORT, () =>
  console.log(`Server is up on http://localhost:${process.env.PORT}`)
);

//unhandled promise rejection
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Server shut down due to unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
