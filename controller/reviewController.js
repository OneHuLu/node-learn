const Review = require('../models/reviewModel');

const { CatchAsyncError } = require('../utils/catchAsync');

exports.getAllReview = CatchAsyncError(async (req, res, next) => {
  const filter = {};
  if (req.params.tourId) filter.tour = req.params.tourId;

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    length: reviews.length,
    data: reviews
  });
});

exports.createReview = CatchAsyncError(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  const newTReview = await Review.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      reviews: newTReview
    }
  });
});
