var Bookshelf = require('bookshelf').conexaoMain;

var PessoaJuridica = Bookshelf.Model.extend({
    tableName: 'pessoa_juridica',
    idAttribute: 'id_pessoa_juridica'
});

exports.PessoaJuridica = PessoaJuridica;