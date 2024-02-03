const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

const { CatchAsyncError } = require('../utils/catchAsync');

exports.deleteOne = Model =>
  CatchAsyncError(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError('No document found with that ID', 404));
    res.status(204).json({
      status: 'success',
      message: `ok to delete ${req.params.id}`
    });
  });

exports.updateOne = Model =>
  CatchAsyncError(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) return next(new AppError('No document found with that ID', 404));

    res.status(200).json({
      status: 200,
      data: {
        data: doc
      }
    });
  });

exports.createOne = Model =>
  CatchAsyncError(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getOne = (Model, populateOpation) =>
  CatchAsyncError(async (req, res, next) => {
    let query = await Model.findById(req.params.id);
    if (populateOpation) query = query.populate(populateOpation);

    const doc = await query;
    if (!doc) return next(new AppError('No document found with that ID', 404));

    res.status(200).json({
      status: 200,
      data: {
        data: doc
      }
    });
  });

exports.getAll = Model =>
  CatchAsyncError(async (req, res, next) => {
    const filter = {};
    if (req.params.tourId) filter.tour = req.params.tourId;

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;
    res.status(200).json({
      status: 200,
      length: doc.length,
      data: doc
    });
  });

/**
 * 查询名称等公用方法，不适用与区间匹配
 * @param {*} Model
 * @returns
 */
exports.seachRegExp = Model =>
  CatchAsyncError(async (req, res, next) => {
    // 将名称字符串转换为正则表达式对象
    const regExpList = Object.keys(req.body).map(key => {
      return {
        [key]: {
          $regex: new RegExp(req.body[key], 'i')
        }
      };
    });

    const features = new APIFeatures(
      Model.find({
        $or: regExpList
      }),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;
    res.status(200).json({
      status: 200,
      length: doc.length,
      data: doc
    });
  });
