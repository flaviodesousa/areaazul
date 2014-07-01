var Bookshelf = require('bookshelf').conexaoMain;

var Fiscal = Bookshelf.Model.extend({
    tableName: 'fiscal',
    idAttribute: 'id'
});

exports.Fiscal = Fiscal;