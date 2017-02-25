#!/usr/bin/env node

'use strict';

const debug = require('debug')('areaazul');
const app = require('../app');

app.set('port', process.env.AREAAZUL_API_PORT || 18300);
app.set('host', process.env.AREAAZUL_API_HOST || 'localhost');

const server = app.listen(app.get('port'), app.get('host'), function() {
  debug('Express server listening on port ' + server.address().port);
});
