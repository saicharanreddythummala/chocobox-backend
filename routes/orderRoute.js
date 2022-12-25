import express from 'express';
import {
  deleteOrder,
  getAllOrders,
  getAnOrder,
  myOrders,
  payOrder,
  updateOrder,
} from '../controllers/orderController.js';
import { authRole, isAuthenticatedUser } from '../middleware/auth.js';

const route = express.Router();

route.post('/order/new',isAuthenticatedUser, payOrder);

route.get('/order/:id', isAuthenticatedUser, getAnOrder);

route.get('/orders/me', isAuthenticatedUser, myOrders);

route.get(
  '/admin/orders',
  isAuthenticatedUser,
  authRole('admin'),
  getAllOrders
);

route.put(
  '/admin/order/:id',
  isAuthenticatedUser,
  authRole('admin'),
  updateOrder
);

route.delete(
  '/admin/order/:id',
  isAuthenticatedUser,
  authRole('admin'),
  deleteOrder
);

export const orderRoutes = route;
