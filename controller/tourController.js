const Tour = require('../models/toursModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const { CatchAsyncError } = require('../utils/catchAsync');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = req.query.limit || '5';
  req.query.sort = req.query.sort || '-ratingsAverage,price';
  req.query.fields =
    req.query.fields || 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = CatchAsyncError(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;
  res.status(200).json({
    status: 200,
    data: {
      tours
    }
  });
});

exports.createTour = CatchAsyncError(async (req, res, next) => {
  const newToue = await Tour.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      tour: newToue
    }
  });
});

exports.getTour = CatchAsyncError(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) return next(new AppError('No tour found with that ID', 404));

  res.status(200).json({
    status: 200,
    data: {
      tour
    }
  });
});

exports.updateTour = CatchAsyncError(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!tour) return next(new AppError('No tour found with that ID', 404));

  res.status(200).json({
    status: 200,
    data: {
      tour
    }
  });
});

exports.deleteTour = CatchAsyncError(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) return next(new AppError('No tour found with that ID', 404));
  res.status(200).json({
    status: 200,
    message: `ok to delete ${req.params.id}`
  });
});

// 管道数据聚合
exports.getTourStats = CatchAsyncError(async (req, res, next) => {
  const state = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: {
          $gte: 4.5
        }
      }
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    }
  ]);

  res.status(200).json({
    status: 200,
    data: {
      state
    }
  });
});

exports.getMonthlyPlan = CatchAsyncError(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    // $unwind 相当于数据解构 startDates
    {
      $unwind: '$startDates'
    },
    // $match 相当于 SQL中的 where 条件, startDates查询字段
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    //  $group 展示的是返回的数据
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: {
        numTourStarts: -1
      }
    },
    {
      $limit: 6
    }
  ]);

  res.status(200).json({
    status: 200,
    data: {
      plan
    }
  });
});
