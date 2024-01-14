const Review = require('../models/reviewModel');

const { CatchAsyncError } = require('../utils/catchAsync');

exports.getAllReview = CatchAsyncError(async (req, res, next) => {
  const reviews = await Review.find();

  res.status(200).json({
    status: 'success',
    data: reviews
  });
});

exports.createReview = CatchAsyncError(async (req, res, next) => {
  const newTReview = await Review.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      reviews: newTReview
    }
  });
});
