#!/usr/bin/env node

'use strict';

var debug = require('debug')('areaazul');
var app = require('../app');

app.set('port', process.env.AREAAZUL_API_PORT || 18300);

var server = app.listen(app.get('port'), 'localhost', function() {
  debug('Express server listening on port ' + server.address().port);
});
