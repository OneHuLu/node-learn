const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    errors: err,
    message: err.message,
    stack: err.stack
  });
};
const handleJwtError = () =>
  new AppError('Invalid token. Please login again!', 401);

const handleTokenExpiredError = () =>
  new AppError("You's token is expired! Please login again!", 401);

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.stack.startsWith('CastError')) error = handleCastErrorDB(error);

    if (err.code === 11000)
      error = handleDuplicateFieldsDB({ ...error, errmsg: err.errmsg });

    if (err.stack.startsWith('ValidationError'))
      error = handleValidationErrorDB(error);
    if (err.stack.startsWith('JsonWebTokenError'))
      error = handleJwtError(error);
    if (err.stack.startsWith('TokenExpiredError'))
      error = handleTokenExpiredError(error);
    sendErrorProd(error, res);
  }
};
