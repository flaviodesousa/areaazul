var Bookshelf = require('bookshelf').conexaoMain;

var Usuario = Bookshelf.Model.extend({
    tableName: 'usuario',
    idAttribute: 'id'
});

exports.Usuario = Usuario;

exports.validate = function(user) {

    if (user.attributes.nome == null || user.attributes.nome == '') {
        console.log("Nome obrigatório");
        return false;
    }

    if (user.attributes.senha == null || user.attributes.senha == '') {
        console.log("Senha obrigatório");
        return false;
    }

    if (user.attributes.autorizacao == null || user.attributes.autorizacao == '') {
        console.log("Autorizacao obrigatório");
        return false;
    }
    return true;
}