'use script'

var Bookshelf = require('bookshelf').conexaoMain;
var Estado = require("../models/estado");

module.exports = Bookshelf.Collection.extend({
    model: Estado
}, {

    listar: function(func) {
        EstadoCollection.forge().query(function(qb) {
            qb.select('estado.*')
        }).fetch().then(function(collection) {
            util.log(collection.models);
            func(collection);
        });
    }

});

