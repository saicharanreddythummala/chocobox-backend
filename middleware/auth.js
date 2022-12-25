import ErrorHandler from '../utils/errorHandler.js';
import asyncErr from './catchAsyncErr.js';
import jwt from 'jsonwebtoken';
import { userModel } from '../models/userModel.js';

const isAuthenticatedUser = asyncErr(async (req, res, next) => {

  const { token } = req.cookies;

  if (!token || token==='undefined') {
    return next(new ErrorHandler('Login to access this page', 401));
  }

  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  
  req.user = await userModel.findById(decoded.id);
  
  next();
});

const authRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`${req.user.role} is not allowed to this page`, 403)
      );
    }

    next();
  };
};

export { isAuthenticatedUser, authRole };
