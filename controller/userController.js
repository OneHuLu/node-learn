const User = require('../models//userModel');

// const APIFeatures = require('../utils/apiFeatures');

const { CatchAsyncError } = require('../utils/catchAsync');

exports.getAllUsers = CatchAsyncError(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 200,
    data: {
      users
    }
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
