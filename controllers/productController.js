import { productModel } from '../models/productModel.js';
import ErrorHandler from '../utils/errorHandler.js';
import asyncErr from '../middleware/catchAsyncErr.js';
import ApiFeatures from '../utils/apiFeatures.js';
import cloudinary from 'cloudinary';

//create a product --admin
const createProduct = asyncErr(async (req, res, next) => {
  let images = [];

  if (typeof req.body.images === 'string') {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: 'products',
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
  req.body.user = req.user.id;

  const product = await productModel.create(req.body);
  res.status(201).send({
    success: true,
    product,
  });
});

//get all products
const getAllProducts = asyncErr(async (req, res, next) => {
  const productsPerPage = 8;
  const productCount = await productModel.countDocuments();

  const apiFeatures = new ApiFeatures(productModel.find(), req.query)
    .search()
    .filter();

  let products = await apiFeatures.query;
  let filteredProductsCount = products.length;

  apiFeatures.pagination(productsPerPage);

  products = await apiFeatures.query.clone();

  res.status(200).json({
    success: true,
    products,
    productCount,
    productsPerPage,
    filteredProductsCount,
  });
});

//update product --admin
const updateProduct = asyncErr(async (req, res) => {
  let product = await productModel.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  // Images Start Here
  let images = [];

  if (typeof req.body.images === 'string') {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: 'products',
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
  }

  product = await productModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).send({
    success: true,
    product,
  });
});

//delete product --admin
const deleteProduct = asyncErr(async (req, res, next) => {
  const product = await productModel.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  // Deleting Images From Cloudinary
  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  }
  await product.remove();

  res.status(200).send({
    success: true,
    message: 'Product deleted',
  });
});

//get product by id
const getProduct = asyncErr(async (req, res, next) => {
  const product = await productModel.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }else
  res.status(200).send({
    success: true,
    product,
  });
});

//create review
const createReview = asyncErr(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user.id,
    name: req.user.name,
    rating: +rating,
    comment,
  };
  const product = await productModel.findById(productId);

  const isReviewed = product.reviews.find(
    (re) => re.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.map((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        (rev.rating = rating), (rev.comment = comment);
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }

  let ratingAvg = 0;

  product.reviews.forEach((rev) => {
    ratingAvg += rev.rating;
  });

  product.ratings = ratingAvg / product.reviews.length;

  await product.save();

  res.status(200).json({
    success: true,
  });
});

//get all reviews
const getAllReviews = asyncErr(async (req, res, next) => {
  const product = await productModel.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

//delete review
const deleteReview = asyncErr(async (req, res, next) => {
  const product = await productModel.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let ratingAvg = 0;

  reviews.forEach((rev) => {
    ratingAvg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = ratingAvg / reviews.length;
  }

  const numberOfReviews = reviews.length;

  await productModel.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numberOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

// Get All Product --admin
const getAllProductsAdmin = asyncErr(async (req, res, next) => {
  const products = await productModel.find();

  res.status(200).json({
    success: true,
    products,
  });
});

export {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  createReview,
  getAllReviews,
  deleteReview,
  getAllProductsAdmin,
};
