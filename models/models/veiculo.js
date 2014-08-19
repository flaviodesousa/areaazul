var Bookshelf = require('bookshelf').conexaoMain;

var Veiculo = Bookshelf.Model.extend({
    tableName: 'veiculo',
    idAttribute: 'id_veiculo'
});

exports.Veiculo = Veiculo;