var Bookshelf = require('bookshelf').conexaoMain;

var Revendedor = Bookshelf.Model.extend({
    tableName: 'revendedor',
    idAttribute: 'id'
});

exports.Revendedor = Revendedor;