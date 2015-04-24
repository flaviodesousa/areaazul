var express = require('express');
var load = require('express-load');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var passport = require('passport');
var basicAuthentication = require('./basic-authentication');

passport.use(new basicAuthentication.FiscalBasicStrategy({}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use(passport.initialize());

// Controler - Rotas
load('controllers').then('routes').into(app, passport);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    console.log(err);
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500).end();
    });
}

// production error handler no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500).end();
});

module.exports = app;