var Bookshelf = require('bookshelf').conexaoMain;

var Funcionario = Bookshelf.Model.extend({
    tableName: 'funcionario',
    idAttribute: 'id'
});

exports.Funcionario = Funcionario;