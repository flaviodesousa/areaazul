var Bookshelf = require('bookshelf').conexaoMain;

var Revendedor = Bookshelf.Model.extend({
    tableName: 'revendedor',
    idAttribute: 'id_revendedor'
});

exports.Revendedor = Revendedor;