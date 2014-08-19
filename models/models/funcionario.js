var Bookshelf = require('bookshelf').conexaoMain;

var Funcionario = Bookshelf.Model.extend({
    tableName: 'funcionario',
    idAttribute: 'id_funcionario'
});

exports.Funcionario = Funcionario;