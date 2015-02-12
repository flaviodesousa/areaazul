var Bookshelf = require('bookshelf').conexaoMain;

var Usuario_has_Veiculo = Bookshelf.Model.extend({
    tableName: 'usuario_has_veiculo',
    idAttribute: 'usuario_id',
    idAttribute: 'veiculo_id'
});

exports.Usuario_has_Veiculo = Usuario_has_Veiculo;