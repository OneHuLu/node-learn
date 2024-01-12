const express = require('express');
const morgan = require('morgan');
const expressRateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');
const globalErrorHandle = require('./controller/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) 中间件 middleware
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ip access restrictions
const limiter = expressRateLimit({
  max: 100,
  window: 60 * 60 * 1000,
  message: 'Too many requests from this ip, please try again in one hour.'
});
app.use('/api', limiter);

app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  req.requestTime = new Date().toDateString();
  next();
});

// 2) 路由设置 router settings
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// 没有找到对应路由的错误捕获
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

// 全局错误捕获中间件
app.use(globalErrorHandle);

module.exports = app;
