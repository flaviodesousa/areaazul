var Bookshelf = require('bookshelf').conexaoMain;

var Consumo = Bookshelf.Model.extend({
    tableName: 'consumo',
    idAttribute: 'id'
});

exports.Consumo = Consumo;