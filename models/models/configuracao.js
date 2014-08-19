var Bookshelf = require('bookshelf').conexaoMain;

var Configuracao = Bookshelf.Model.extend({
    tableName: 'configuracao',
    idAttribute: 'id_configuracao'
});

exports.Configuracao = Configuracao;