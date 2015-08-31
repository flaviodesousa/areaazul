'use script'

var Bookshelf = require('bookshelf').conexaoMain;
var Estado = require("../models/estado");

var EstadoCollection = Bookshelf.Collection.extend({
    model: Estado,


}, {

    listar: function(func) {
        EstadoCollection.forge().query(function(qb) {
            qb.select('estado.*')
        }).fetch().then(function(collection) {
            console.log(collection.models);
            func(collection);
        });
    },


});
module.exports = EstadoCollection;