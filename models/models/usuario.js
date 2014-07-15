var Bookshelf = require('bookshelf').conexaoMain;

var Usuario = Bookshelf.Model.extend({
    tableName: 'usuario',
    idAttribute: 'id'
});

exports.Usuario = Usuario;

exports.getById = function(id) {
    console.log('getById');
    new Usuario({
        id: id
    }).fetch().then(function(model) {
        var retorno = model.attributes;
        return retorno;
    }, function(error) {
        return null;
    });
}

exports.search = function(entidade) {
    entidade.fetch().then(function(model) {
        var retorno = model.attributes;
        console.log(retorno);
        return retorno;
    }, function(error) {
        return null;
    });
}


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