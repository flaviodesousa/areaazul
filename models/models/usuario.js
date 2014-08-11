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
        'primeiro_acesso': '1'
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



exports.listartodos= function(req, res)
 {
    var pessoafisicas = new PessoaFisicaCollection.PessoaFisica().fetch().then(function(collection, err) {
        if (err) {
            res.statusCode = 500;
        } else {
            res.statusCode = 200;
            res.send(collection.models);
        }
    });
}
exports.procurar = function(req, res) {
    new PessoaFisica.PessoaFisica({
        id: req.params.id
    }).fetch().then(function(model, err) {
        if (err) {
            res.statusCode = 500;
        }
        if (model != null) {
            res.statusCode = 200;
            res.send(model.attributes);
        } else {
            res.statusCode = 404;
            res.json();
        }
    });
}
exports.editar = function(req, res) {
            new PessoaFisica.PessoaFisica({
                id: req.params.id
            }).fetch().then(function(model) {
                model.save(req.body).then(function(model, err) {
                    if (err) {
                        res.statusCode = 500;
                        res.json();
                    }
                    res.statusCode = 200;
                    res.json();
                });

            });
}
exports.desativar = function(req, res) {
            new PessoaFisica.PessoaFisica({
                id: req.params.id
            }).fetch().then(function(model, err) {
                if (err) {
                    res.statusCode = 500;
                } else {
                    if (model == null) {
                        res.statusCode = 404;
                    } else {
                        model.destroy({
                            id: req.params.id
                        }).then(function(model, err) {
                            if (err) {
                                res.statusCode = 500;
                                ///retornar mensagem de erro json
                            } else {
                                res.statusCode = 200;
                            }

                        });
                    }
                }
                res.json();
            });

        }
    
