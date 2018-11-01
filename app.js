var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var mapRouter = require('./routes/handleMap');

var app = express();
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var mongoURL = "mongodb://localhost:27017/map_ven";
mongoose.connect(process.env.MONGO_URL || mongoURL,{useNewUrlParser: true})
  .then(() =>  console.log('db connection succesful'))
  .catch((err) => console.error(err));


 

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.use('/map', mapRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('error');
});

module.exports = app;
port = process.env.PORT || 3000;
app.listen(port, (err)=>{
	console.log('listening on port '+port);
});