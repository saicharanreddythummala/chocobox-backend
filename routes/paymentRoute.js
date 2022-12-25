import express from 'express';
import { processPayment, razorpayKey } from '../controllers/paymentController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';

const route = express.Router();

route.post('/payment/process', isAuthenticatedUser,processPayment);

route.get('/razorpayKey', isAuthenticatedUser,razorpayKey )

export const paymentRoutes = route;
