/* Inicio Dependencias */
var express = require('express');
var load = require('express-load'); // Controla meu sistema no padrão MVC.
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var database = require('./configuration/database');
var app = express(); // intanciando o express

// view engine setup
//app.set('views', path.join(__dirname, 'views')); // Onde ficará minhas view
app.set('view engine', 'jade'); // Define que meu template utilizado é o jade

app.use(favicon()); //Icone da minha aplicação
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // Junção dos meus arquivos estaticos que é a public

// Modulos - Modelo - Controler - Rotas
load('models').then('controllers').then('routes').into(app);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


module.exports = app;