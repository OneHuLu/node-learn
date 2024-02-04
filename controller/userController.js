const User = require('../models//userModel');
const handleFactory = require('./handleFactory');
const { CatchAsyncError } = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).map(item => {
    if (!allowedFields.includes(item)) newObj[item] = obj[item];
    return null;
  });
  return newObj;
};
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = CatchAsyncError(async (req, res, next) => {
  // 1) Filtered out you unwanted  fields names that are not allowed be updated.
  const filterBody = filterObj(req.body, 'passwordConfirm', 'password', 'role');
  // 2) Update user document
  const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true
  });
  res.status(200).send({
    status: 'success',
    data: updateUser
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

exports.updateUserPhoto = CatchAsyncError(async (req, res, next) => {
  const { photo } = req.body;
  await User.findByIdAndUpdate(req.user.id, { photo });
  res.status(200).send({
    status: 200
  });
});

/**
 *  Don't use this function update password
 */
exports.updateUser = handleFactory.updateOne(User);

exports.getUser = handleFactory.getOne(User);

exports.deleteUser = handleFactory.deleteOne(User);

exports.getAllUsers = handleFactory.getAll(User);
