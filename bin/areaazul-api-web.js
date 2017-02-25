#!/usr/bin/env node

'use strict';

const debug = require('debug')('areaazul');
const app = require('../app');

let server;
let port = process.env.AREAAZUL_API_PORT || 18300;
let host;
if (!process.env.AREAAZUL_API_NOHOST) {
  host = process.env.AREAAZUL_API_HOST || 'localhost';
}

function onListening() {
  debug('Express server listening on port ' + server.address().port);
}

if (host) {
  server = app.listen(port, host, onListening);
} else {
  server = app.listen(port, onListening);
}

