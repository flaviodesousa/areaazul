var Bookshelf = require('bookshelf').conexaoMain;

var Ativacao = Bookshelf.Model.extend({
    tableName: 'ativacao',
    idAttribute: 'id_ativacao'
});

exports.Ativacao = Ativacao;