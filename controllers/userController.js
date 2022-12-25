import { userModel } from '../models/userModel.js';
import asyncErr from '../middleware/catchAsyncErr.js';
import {
  comparePassword,
  generateToken,
  hashPassword,
  resetPasswordToken,
  sendToken,
} from '../utils/helpers.js';
import ErrorHandler from '../utils/errorHandler.js';
import crypto from 'crypto';
import { sendEmail } from '../utils/mailer.js';
import cloudinary from 'cloudinary';

//register a user
const registerUser = asyncErr(async (req, res, next) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: 'avatars',
    width: 150,
    crop: 'scale',
  });
  const { name, email, password } = req.body;

  const hashedPassword = await hashPassword(password);

  const user = await userModel.create({
    name,
    email,
    password: hashedPassword,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  sendToken(user, 201, res);
});

//login user
const userLogin = asyncErr(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler('Please enter email & password', 400));
  }

  const user = await userModel.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorHandler('Invalid email or password', 401));
  }

  const isPwdMatched = await comparePassword(password, user.password);

  if (!isPwdMatched) {
    return next(new ErrorHandler('Invalid email or password', 401));
  }

  sendToken(user, 200, res);
});

//logout user
const userLogOut = asyncErr(async (req, res, next) => {
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'User logged out',
  });
});

//forgot password
const forgotPassword = asyncErr(async (req, res, next) => {
  let user = await userModel.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  const resetToken = resetPasswordToken();

  const resetPwdToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  user.resetPasswordToken = resetPwdToken;
  user.resetPasswordExpire = resetPasswordExpire;

  await user.save({ validateBeforeSave: false });

  // user = await userModel.findByIdAndUpdate(
  //   user.id,
  //   { resetPasswordToken: resetPwdToken, resetPasswordExpire },
  //   {
  //     new: true,
  //     runValidators: true,
  //     useFindAndModify: false,
  //   }
  // );

  const resetPasswordUrl = `${req.protocol}://${req.get(
    'host'
  )}/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

//update  user profile
const updateProfile = asyncErr(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.body.avatar !== '') {
    const user = await userModel.findById(req.user.id);

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: 'avatars',
      width: 150,
      crop: 'scale',
    });

    newUserData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  await userModel.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

//reset password
const resetPassword = asyncErr(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  let user = await userModel.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler('Reset password token is invalid or expired', 404)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler('Passwords does not match', 404));
  }

  const hashedPassword = await hashPassword(req.body.password);

  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

//get user details
const getUser = asyncErr(async (req, res, err) => {
  try {
    const user = await userModel.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch {
    (err) => {
      res.status(401).json({
        success: false,
      });
    };
  }
});

//update user password
const updatePassword = asyncErr(async (req, res, err) => {
  const user = await userModel.findById(req.user.id).select('+password');

  const isPwdMatched = await comparePassword(
    req.body.oldPassword,
    user.password
  );

  if (!isPwdMatched) {
    return next(new ErrorHandler('Old password is incorrect', 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler('passwords does not match', 400));
  }

  const hashedPassword = await hashPassword(req.body.newPassword);

  user.password = hashedPassword;

  await user.save();

  sendToken(user, 200, res);
});

//get all users --  admin
const getAllUsers = asyncErr(async (req, res) => {
  const users = await userModel.find();

  res.status(200).json({
    success: true,
    users,
  });
});

//get single user -- admin
const getSingleUser = asyncErr(async (req, res, err) => {
  const user = await userModel.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//update user role --admin
const updateUserRole = asyncErr(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  await userModel.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

//delete user --admin
const deleteUser = asyncErr(async (req, res, next) => {
  const user = await userModel.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with id: ${req.params.id}`)
    );
  }
  const imageId = user.avatar.public_id;

  await cloudinary.v2.uploader.destroy(imageId);

  await user.remove();

  res.status(200).json({
    success: true,
  });
});

export {
  registerUser,
  userLogin,
  userLogOut,
  forgotPassword,
  resetPassword,
  getUser,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSingleUser,
  updateUserRole,
  deleteUser,
};
