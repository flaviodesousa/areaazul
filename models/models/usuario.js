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
exports.cadastrar = function(user, then, fail) {

    var teste = true; //Usuario.validate(usuario)
    if (teste == true) { //} && Pessoa.validate(pessoa) == true && PessoaFisica.validate(pessoa_fisica) == true) {
        console.log(Bookshelf);
        Bookshelf.transaction(function(t) {
            console.log("Cheguei aqui!");
            pessoa({
                'nome': user.nome,
                'email': user.email,
                'telefone': user.telefone
            }).save(null, {

                transacting: t

            }).then(function(model, err) {
                usuario.attributes.pessoa_id = model.id;
                pessoa_fisica.attributes.pessoa_id = model.id;
                usuario({
                    'login': 'user.atr',
                    'senha': 'usuario_senha',
                    'autorizacao': '1'
                }).save(null, {
                    transacting: t
                }).then(function(model, err) {
                    pessoa_fisica({
                        'cpf': user.cpf,
                        'data_nascimento': user.data_nascimento,
                        'rg': user.rg,
                        'sexo': user.sexo,
                    }).save(null, {
                        transacting: t
                    }).then(function(model, err) {
                        res.statusCode = 201;
                        t.commit();
                    }).
                    catch(function(err) {
                        console.log(err);
                        res.statusCode = 500;
                        t.rollback();

                    }).
                    catch(function(err) {

                        console.log(err);
                        res.statusCode = 500;
                        t.rollback();
                    });
                }).
                catch(function(err) {
                    t.rollback();
                    console.log(err);
                    res.statusCode = 500;
                });
                return then(true);
            });

        });
        return then(true);
    } else {

        return fail(false);
    }

}