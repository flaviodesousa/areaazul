'use strict';

const Promise = require('bluebird');

exports.up = function() {
  return Promise.resolve(null);
};

exports.down = function(knex) {
  return knex.schema.dropTable('consumo')
    .catch(function() {
    });
};
