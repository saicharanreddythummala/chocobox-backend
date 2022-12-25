import ErrorHandler from '../utils/errorHandler.js';
import asyncErr from '../middleware/catchAsyncErr.js';
import { orderModel } from '../models/orderModel.js';
import { productModel } from '../models/productModel.js';

//create new order
const payOrder = asyncErr(async (req, res) => {
  try {
    const {
      shippingInfo,
      orderItems,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = req.body;

    const order = await orderModel.create({
      shippingInfo,
      orderItems,
      paymentInfo: {
        id: razorpayOrderId,
        status: 'Paid',
      },
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      razorpay: {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
      },
      paidAt: Date.now(),
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

//get an order
const getAnOrder = asyncErr(async (req, res, next) => {
  const order = await orderModel
    .findById(req.params.id)
    .populate('user', 'name email');

  if (!order) {
    return next(new ErrorHandler('Order not found with this Id', 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

//get user orders
const myOrders = asyncErr(async (req, res, next) => {
  const orders = await orderModel.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

//get all orders --admin
const getAllOrders = asyncErr(async (req, res, next) => {
  const orders = await orderModel.find();

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

//update order status --admin
const updateOrder = asyncErr(async (req, res, next) => {
  const order = await orderModel.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler('Order not found with this Id', 404));
  }

  if (order.orderStatus === 'Delivered') {
    return next(new ErrorHandler('You have already delivered this order', 400));
  }

  if (req.body.status === 'Shipped') {
    order.orderItems.forEach(async (ord) => {
      await updateStock(ord.product, ord.quantity);
    });
  }
  order.orderStatus = req.body.status;

  if (req.body.status === 'Delivered') {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

const updateStock = async (id, quantity) => {
  const product = await productModel.findById(id);

  product.stock -= quantity;

  await product.save({ validateBeforeSave: false });
};

//delete order --admin
const deleteOrder = asyncErr(async (req, res, next) => {
  const order = await orderModel.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler('Order not found with this Id', 404));
  }

  await order.remove();

  res.status(200).json({
    success: true,
  });
});

export {
  // newOrder,
  getAnOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
  payOrder,
};
