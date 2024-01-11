const User = require('../models//userModel');
const AppError = require('../utils/appError');

// const APIFeatures = require('../utils/apiFeatures');

const { CatchAsyncError } = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).map(item => {
    if (allowedFields.includes(item)) newObj[item] = obj[item];
  });
  return newObj;
};

exports.getAllUsers = CatchAsyncError(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 200,
    data: {
      users
    }
  });
});

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

exports.deleteMe = CatchAsyncError(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).send({
    status: 'success',
    data: null
  });
});
exports.createUser = (req, res) => {
  res.status(200).json({
    message: 'createUser',
    status: 200
  });
};

exports.getUser = (req, res) => {
  res.status(200).json({
    message: 'getUser',
    status: 200
  });
};

exports.updateUser = (req, res) => {
  res.status(200).json({
    message: 'updateUser',
    status: 200
  });
};

exports.deleteUser = (req, res) => {
  res.status(200).json({
    message: 'deleteUser',
    status: 200
  });
};

exports.checkName = (req, res, next) => {
  if (!req.body.name) {
    return res.status(403).json({
      context: 'nameis required'
    });
  }
  next();
};

exports.checkId = (req, res, next) => {
  if (!req.body.id) {
    return res.status(403).json({
      context: 'id is required'
    });
  }
  next();
};
