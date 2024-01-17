const Tour = require('../models/toursModel');
const AppError = require('../utils/appError');
const { CatchAsyncError } = require('../utils/catchAsync');
const handleFactory = require('./handleFactory');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = req.query.limit || '5';
  req.query.sort = req.query.sort || '-ratingsAverage,price';
  req.query.fields =
    req.query.fields || 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = handleFactory.getAll(Tour);

exports.getTour = handleFactory.getOne(Tour, { path: 'reviews' });

exports.createTour = handleFactory.createOne(Tour);

exports.updateTour = handleFactory.updateOne(Tour);

exports.deleteTour = handleFactory.deleteOne(Tour);

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

exports.getToursWithin = CatchAsyncError(async (req, res, next) => {
  const { distance, lating, unit } = req.params;
  const [lat, lng] = lating.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide your latitude and longitude in the format lat,lng',
        400
      )
    );
  }
  const tour = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius]
      }
    }
  });
  res.status(200).json({
    status: 'success',
    length: tour.length,
    data: tour
  });
});

exports.getDistance = CatchAsyncError(async (req, res, next) => {
  const { lating, unit } = req.params;
  const multiplier = unit === 'mi' ? 0.00062137 : 0.001;
  const [lat, lng] = lating.split(',');
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide your latitude and longitude in the format lat,lng',
        400
      )
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        name: 1,
        distance: 1
      }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: distances
  });
});
