import express from 'express';
import {
  createProduct,
  createReview,
  deleteProduct,
  deleteReview,
  getAllProducts,
  getAllProductsAdmin,
  getAllReviews,
  getProduct,
  updateProduct,
} from '../controllers/productController.js';
import { authRole, isAuthenticatedUser } from '../middleware/auth.js';

const route = express.Router();

route.get('/products', getAllProducts);

route.post(
  '/admin/product/create',
  isAuthenticatedUser,
  authRole('admin'),
  createProduct
);

route.get('/product/:id', getProduct);
route.put(
  '/admin/product/:id',
  isAuthenticatedUser,
  authRole('admin'),
  updateProduct
);
route.delete(
  '/admin/product/:id',
  isAuthenticatedUser,
  authRole('admin'),
  deleteProduct
);

route.put('/review', isAuthenticatedUser, createReview);

route.get('/reviews', getAllReviews);

route.delete('/reviews', isAuthenticatedUser, deleteReview);

route.get(
  '/admin/products',
  isAuthenticatedUser,
  authRole('admin'),
  getAllProductsAdmin
);

export const productsRouter = route;
