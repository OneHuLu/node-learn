// config settings
const dontENV = require('dotenv');

// MongoDB
const mongoose = require('mongoose');

// app
const app = require('./app');

// 配置文件变量合并
dontENV.config({
  path: './config.env'
});

// mongoDB连接
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(
    // con = {
    () => {
      console.log('DB connection successfully');
    }
  );

// settings PORT
const port = process.env.PORT || 8000;

// 3) app 监听 app listening on port
const server = app.listen(port, () => {
  console.log(`node server listening ......`);
  console.log(`server PORT: ${port}---ENV: ${process.env.Node_ENV}`);
});

// 未处理的拒绝
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('💥 UNHANDLED REJECTED 💥 Shutting down');
  server.close(() => {
    process.exit(1);
  });
});

// 未处理的异常
process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('💥 UNHANDLED Exception 💥 Shutting down');
  server.close(() => {
    process.exit(1);
  });
});
