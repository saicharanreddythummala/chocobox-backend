import dotenv from 'dotenv';
dotenv.config();
import Razorpay from 'razorpay';
import ErrorHandler from '../utils/errorHandler.js';

export const razorpayKey = (req, res, next) => {
  res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
};

export const processPayment = async (req, res, next) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: req.body.amount,
      currency: 'INR',
    };

    const order = await instance.orders.create(options);
    if (!order) return next(new ErrorHandler('Some error occured', 500));
    res.send(order);
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
};
