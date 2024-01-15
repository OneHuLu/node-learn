const User = require('../models//userModel');
const AppError = require('../utils/appError');
const handleFactory = require('./handleFactory');
const { CatchAsyncError } = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).map(item => {
    if (allowedFields.includes(item)) newObj[item] = obj[item];
    return null;
  });
  return newObj;
};
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = CatchAsyncError(async (req, res, next) => {
  // 1) Create error if user post password data. TODO: I think only do a filter here
  if (req.body.passwordConfirm || req.body.password) {
    return next(
      new AppError(
        'This route is not for change password.Please use /updatePassword',
        400
      )
    );
  }
  // 2) Filtered out you unwanted  fields names that are not allowed be updated.
  const filterBody = filterObj(req.body, 'name', 'email');
  // 3) Update user document
  const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true
  });
  res.status(200).send({
    status: 'success',
    data: {
      user: updateUser
    }
  });
});

/**
 * user logout is soft deleted
 */
exports.deleteMe = CatchAsyncError(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).send({
    status: 'success',
    data: null
  });
});

/**
 *  Don't use this function update password
 */
exports.updateUser = handleFactory.updateOne(User);

exports.getUser = handleFactory.getOne(User);

exports.deleteUser = handleFactory.deleteOne(User);

exports.getAllUsers = handleFactory.getAll(User);
