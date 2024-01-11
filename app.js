const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandle = require('./controller/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) 中间件 middleware
app.use((req, res, next) => {
  console.log("🧰🧰🧰 use middleware: morgan('dev') and express.json() 🧰🧰🧰");
  next();
});
app.use(morgan('dev'));
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
