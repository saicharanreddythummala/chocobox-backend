import express from 'express';
import {
    deleteUser,
  forgotPassword,
  getAllUsers,
  getSingleUser,
  getUser,
  registerUser,
  resetPassword,
  updatePassword,
  updateProfile,
  updateUserRole,
  userLogin,
  userLogOut,
} from '../controllers/userController.js';
import { authRole, isAuthenticatedUser } from '../middleware/auth.js';

const route = express.Router();

route.post('/register', registerUser);

route.post('/login', userLogin);

route.get('/logout', userLogOut);

route.post('/password/forgot', forgotPassword);

route.put('/password/reset/:token', resetPassword);

route.get('/me', isAuthenticatedUser, getUser);

route.put('/password/update', isAuthenticatedUser, updatePassword);

route.put('/me/update', isAuthenticatedUser, updateProfile);

route.get('/admin/users', isAuthenticatedUser, authRole('admin'), getAllUsers);

route.get(
  '/admin/user/:id',
  isAuthenticatedUser,
  authRole('admin'),
  getSingleUser
);

route.put('/admin/user/:id', isAuthenticatedUser, authRole('admin'), updateUserRole);

route.delete('/admin/user/:id',isAuthenticatedUser,authRole('admin'), deleteUser);

export const userRoutes = route;
