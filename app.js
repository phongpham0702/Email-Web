const dotenv = require("dotenv").config()
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require("express-handlebars")
const session = require("express-session")
const flash = require("express-flash")
const {spawn} = require("child_process")
const cron = require("node-cron")
const helmet = require('helmet')
//const rateLimit = require("express-rate-limit")
const database = require("./connectDB")

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const mailRouter = require("./routes/mail")

const app = express();
database.connect();
cron.schedule(process.env.BackUpTime, () => backupMongoDB());
//0 */24 * * *
//*/5 * * * * *
//mongodump --db=EmailSystem --archive=./backup/ES.gzip --gzip
//mongorestore --db=EmailSystem --archive=./backup/ES.gzip --gzip
// view engine setup
//app.engine("hbs", hbs({defaultLayout: "main"});

// const requestLimit = rateLimit({
//   windowMs: 60*1000,
//   max: 3,
//   message: `<div style="width:100%; 
//   text-align:center; 
//   background-color:red; 
//   color:white;
//   padding:8px;
//   font-size:32px;font-weight:700">Too many request from this IP !</div>`
// })
//app.use(requestLimit)
app.engine("hbs", hbs.engine({ extname: ".hbs", defaultLayout: "main" }));
app.set("view engine", "hbs");
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.SECRET_KEY));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
//app.use(helmet())
app.use( session({
      secret: process.env.SECRET_KEY,
      resave: true,
      saveUninitialized: true,
      cookie:{maxAge:60000}
}));
app.use(flash())

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/auth', authRouter);
app.use("/mail", mailRouter)
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
  res.render('error',{layout:null});
});

function backupMongoDB() {
  const child = spawn('mongodump', [
    `--db=${process.env.DBName}`,
    `--archive=${process.env.BackUpPath}`,
    '--gzip',
  ]);

  child.stdout.on('data', (data) => {
    console.log('stdout:\n', data);
  });
  child.stderr.on('data', (data) => {
    console.log('stderr:\n', Buffer.from(data).toString());
  });
  child.on('error', (error) => {
    console.log('error:\n', error);
  });
  child.on('exit', (code, signal) => {
    if (code) console.log('Process exit with code:', code);
    else if (signal) console.log('Process killed with signal:', signal);
    else console.log('Backup is successfull ✅');
  });
}

module.exports = app;
