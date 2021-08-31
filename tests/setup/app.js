const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });
require('../../auth/passport');

const indexRouter = require('../../routes/index');
const usersRouter = require('../../routes/users');
const postsRouter = require('../../routes/posts');
const authRouter = require('../../routes/auth');
const categoryRouter = require('../../routes/categories');
const ingredientRouter = require('../../routes/ingredients');
const messageRouter = require('../../routes/messages');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/auth', authRouter);
app.use('/categories', categoryRouter);
app.use('/ingredients', ingredientRouter);
app.use('/message', messageRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  console.log(err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // send the error
  res.status(err.status || 500);
  res.json(err);
});

module.exports = app;
