var Bookshelf = require('bookshelf').conexaoMain;

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

exports.cadastrar = function(user) {
    var usuario = new Usuario.Usuario({
        'nome': 'usuario_nome',
        'senha': 'usuario_senha',
        'autorizacao': '1'
    });
    var pessoa = new Pessoa.Pessoa({
        nome: req.param('nome'),
        email: req.param('email'),
        telefone: req.param('telefone')
    });
    var pessoa_fisica = new PessoaFisica.PessoaFisica({
        cpf: req.param('cpf'),
        data_nascimento: req.param('data_nascimento')
    });

    var erro = false;

    if (Usuario.validate(usuario) == true && Pessoa.validate(pessoa) == true && PessoaFisica.validate(pessoa_fisica) == true) {
        Bookshelf.transaction(function(t) {
            pessoa.save(null, {
                transacting: t
            }).then(function(model, err) {
                usuario.attributes.pessoa_id = model.id;
                pessoa_fisica.attributes.pessoa_id = model.id;
                usuario.save(null, {
                    transacting: t
                }).then(function(model, err) {
                    pessoa_fisica.save(null, {
                        transacting: t
                    }).then(function(model, err) {
                        res.statusCode = 201;
                        t.commit();
                    }).
                    catch(function(err) {
                        console.log(err);
                        res.statusCode = 500;
                        t.rollback();
                    });
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
        });
        res.json();
        console.log("Ocorreu tudo certo");
    } else {
        console.log("Erros");
    }
}