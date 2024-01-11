const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Apperror = require('../utils/appError');

const User = require('../models/userModel');
const { CatchAsyncError } = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const singupToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = singupToken(user._id);
  res.status(statusCode).json({
    status: statusCode,
    token,
    data: user
  });
};

exports.singup = CatchAsyncError(async (req, res, next) => {
  const newUser = await User.create(req.body);
  createSendToken(newUser, 201, res);
});

exports.login = CatchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if emali and password exist
  if (!email || !password) {
    return next(new Apperror('Please provide your email and password', 400));
  }
  // 2) Check if user exist && password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new Apperror('Incorrect email and password,', 401));
  }
  // 3) If everything is ok, send token to clinet
  createSendToken(user, 200, res);
});

// Middleware by Check access token
exports.protect = CatchAsyncError(async (req, res, next) => {
  // 1) Getting token and check of it's there
  const getToken =
    req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!getToken) {
    return next(
      new Apperror('You are not login! Please login to get access', 401)
    );
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(getToken, process.env.JWT_SECRET);
  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new Apperror('The user beloging to this token does no longer exist', 401)
    );
  }
  // 4) Check if user chenage password after the token is issued
  if (await currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new Apperror('User recently changed password! Please login again.', 401)
    );
  }
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new Apperror('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
exports.forgetPassword = CatchAsyncError(async (req, res, next) => {
  // 1) Get user based on POST email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new Apperror('There is no user with that email', 404));
  }

  // 2)Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forget your password? Submit a PATCH requset with you new password and passwordConfirm to ${resetURL}. \nIf you dont's forget password , Please ingore this email`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message
    });
    res.status(200).send({
      status: 'success',
      message: 'Token is send your email'
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    console.log(error);
    await user.save({ validateBeforeSave: false });
    return next(
      new Apperror(
        'There was an error sending the email. Please try again later',
        500
      )
    );
  }
});

exports.resetPassword = CatchAsyncError(async (req, res, next) => {
  // 1) Get user base on the token
  const hasdedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hasdedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new Apperror('Token is invalid or has expires', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) Upadte changePasswordAt property for the user
  // 4) Log the user in , send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = CatchAsyncError(async (req, res, next) => {
  // 1) Get user for collection
  const user = await User.findById(req.user.id).select('+password');
  // 2）Check if current user's password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new Apperror('Your current password is wrong', 401));
  }
  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // 4) Log user in , send JWT
  createSendToken(user, 200, res);
});
