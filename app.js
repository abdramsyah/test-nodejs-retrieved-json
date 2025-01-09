// const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const route = require('./routes');
const cors = require('cors');
const moment = require('moment');

// const usersRouter = require('./routes/v1/users/users');
const { errorHandler } = require('./middleware/errorHandler');

// Cross origin setup
const corsOptions = {
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept'],
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const app = express();
app.use(cors(corsOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine');

// Menambahkan format waktu khusus untuk morgan
// logger.token('date', (req, res, tz) => moment().format('YYYY-MM-DD HH:mm:ss'));
logger.token('date', () => moment().format('YYYY-MM-DD HH:mm:ss'));

// Menggabungkan waktu ke dalam log morgan
app.use(
  logger(':date - :method :url :status :response-time ms', {
    stream: {
      write: function (message) {
        console.log(message.trim());
      },
    },
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(route);
app.use(errorHandler);

module.exports = app;
