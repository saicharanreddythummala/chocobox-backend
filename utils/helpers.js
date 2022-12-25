import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

//hashing the password
async function hashPassword(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

//generating token for user
function generateToken(id) {
  return jwt.sign({ id: id }, process.env.SECRET_KEY, {
    expiresIn: `${process.env.TOKEN_EXPIRE}`,
  });
}

//compare password
async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

//sending a token
function sendToken(user, statusCode, res) {
  const token = generateToken(user._id);

  //cookie options
  const options = {
    expires: new Date(
      Date.now() + +process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    SameSite: 'None',
    // secure: true
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
}

//reset password token
const resetPasswordToken = () => {
  const resetToken = crypto.randomBytes(20).toString('hex');

  return resetToken;
};



export {
  hashPassword,
  generateToken,
  comparePassword,
  sendToken,
  resetPasswordToken,
};
