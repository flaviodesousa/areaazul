var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require('./pessoa');
var PessoaFisica = require('./pessoafisica');

var Usuario = Bookshelf.Model.extend({
    tableName: 'usuario',
    idAttribute: 'id'
});

exports.Usuario = Usuario;

exports.getById = function(id, func) {
    console.log('getById');
    new Usuario({
        id: id
    }).fetch().then(function(model, err) {
        if (model != null)
            var retorno = model.attributes;
        if (err) {
            return func(null);
        }
        func(retorno);
    });
}

exports.search = function(entidade, func) {
    entidade.fetch().then(function(model, err) {
        if (model != null)
            var retorno = model.attributes;
        if (err) {
            return func(null);
        }
        func(retorno);
    });
}


exports.validate = function(user) {

    if (user.attributes.login == null || user.attributes.login == '') {
        console.log("Nome obrigatório");
        return false;
    }
    /*
    if (user.attributes.senha == null || user.attributes.senha == '') {
        console.log("Senha obrigatório");
        return false;
    }
*/
    if (user.attributes.autorizacao == null || user.attributes.autorizacao == '') {
        console.log("Autorizacao obrigatório");
        return false;
    }
    return true;
}
exports.cadastrar = function(user, then, fail) {
    var usuario = new this.Usuario({

        'login': user.cpf,
        'autorizacao': '1',
        'primeiro_acesso': 'true'
    });


    var pessoa = new Pessoa.Pessoa({
        'nome': user.nome,
        'email': user.email,
        'telefone': user.telefone
    });


    var pessoaFisica = new PessoaFisica.PessoaFisica({

        'cpf': user.cpf,
        'data_nascimento': user.data_nascimento,
        'sexo': user.sexo
    });

    if ((this.validate(usuario) == true) && (Pessoa.validate(pessoa) == true) && (PessoaFisica.validate(pessoaFisica) == true)) {

        Bookshelf.transaction(function(t) {
            pessoa.save(null, {
                transacting: t
            }).
            then(function(pessoa) {
                usuario.save({
                    pessoa_id: pessoa.id,
                }, {
                    transacting: t
                }).then(function(model, err) {
                    pessoaFisica.save({
                        pessoa_id: pessoa.id,

                    }, {
                        transacting: t
                    }).then(function(model, err) {
                        t.commit();
                    }),
                    function() {

                        t.rollback();
                        return fail(false);
                    }
                });
            });
        }).then(function(result) {
            console.log(result);
            return then(true);
        }, function() {
            console.log("Ocorreu erro");
            return fail(false);
        });
    } else {
        return fail(false);
    }

}