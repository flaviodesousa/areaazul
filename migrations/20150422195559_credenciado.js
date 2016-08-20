'use strict';

var Promise = require('bluebird');

exports.up = function() {
  return Promise.resolve(null);
};

exports.down = function(knex) {
  return knex.schema.dropTable('credenciado')
    .catch(function() {
    });
};
