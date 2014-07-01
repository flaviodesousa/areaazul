var Bookshelf = require('bookshelf').conexaoMain;

var Configuracao = Bookshelf.Model.extend({
    tableName: 'configuracao',
    idAttribute: 'id'
});

exports.Configuracao = Configuracao;