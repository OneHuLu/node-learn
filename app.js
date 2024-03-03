const express = require('express');
const morgan = require('morgan');
const expressRateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandle = require('./controller/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const gptsRouter = require('./routes/gptsRoutes.js');

const app = express();

// 线上代理设置
if (process.env.NODE_EN === 'production') {
  app.set('trust proxy', true);
}

// Set security Http Header
app.use(helmet());

// 1) 中间件 middleware
app.use(morgan('dev'));

// ip access restrictions
const limiter = expressRateLimit({
  max: 100,
  window: 60 * 60 * 1000,
  message: 'Too many requests from this ip, please try again in one hour.'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against xss
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Server static files
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toDateString();
  next();
});

// 使用 CORS 中间件
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://127.0.0.1:3000'],
    credentials: true
  })
);

// 2) 路由设置 router settings
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/chatgpt', gptsRouter);

// 没有找到对应路由的错误捕获
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

// 全局错误捕获中间件
app.use(globalErrorHandle);

module.exports = app;
