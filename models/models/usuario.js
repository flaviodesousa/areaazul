var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require('./pessoa');
var PessoaFisica = require('./pessoafisica');
var PessoaCollection = require('../collections/pessoa');
var UsuarioCollection = require('../collections/usuario');
var PessoaFisicaCollection = require('../collections/pessoafisica');

var Usuario = Bookshelf.Model.extend({
    tableName: 'usuario',
    idAttribute: 'idusuario'
});

exports.Usuario = Usuario;


var UsuarioCollection =  Bookshelf.Collection.extend({
    model: Usuario
});

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
        'primeiro_acesso': '1',
        'status': 'true'
    });


    var pessoa = new Pessoa.Pessoa({
        'nome': user.nome,
        'email': user.email,
        'telefone': user.telefone,
        'status': 'true'
    });


    var pessoaFisica = new PessoaFisica.PessoaFisica({

        'cpf': user.cpf,
        'data_nascimento': user.data_nascimento,
        'sexo': user.sexo,
        'status': 'true'
    });

   // if ((this.validate(usuario) == true) && (Pessoa.validate(pessoa) == true) && (PessoaFisica.validate(pessoaFisica) == true)) {

        Bookshelf.transaction(function(t) {
            pessoa.save(null, {
                transacting: t
            }).
            then(function(pessoa) {
                console.log(pessoa);
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
 /*   } else {
        return fail(false);
    }*/

}

exports.listar = function(func)
 {
    UsuarioCollection.forge().query(function(qb){
         qb.join('pessoa', 'pessoa.idpessoa','=','usuario.pessoa_id');
         qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.idpessoa');
         qb.select('usuario.*')
         qb.select('pessoa.*');
         qb.select('pessoa_fisica.*');
    }).fetch().then(function(collection) {
        console.log(collection.models);
        func(collection);
    }); 
}

exports.editar = function(user, then, fail) {
        console.log(user);
        var usuario = new this.Usuario({
            'idusuario': user.idusuario,
            'login': user.cpf,
            'autorizacao': '1',
            'primeiro_acesso': '1',
            'status': 'true'
        });
        var pessoa = new Pessoa.Pessoa({
            'idpessoa':user.pessoa_id,
            'nome': user.nome,
            'email': user.email,
            'telefone': user.telefone,
            'status': 'true'
        });
        var pessoaFisica = new PessoaFisica.PessoaFisica({
            'idpessoa_fisica': user.idpessoa_fisica,
            'cpf': user.cpf,
            'data_nascimento': user.data_nascimento,
            'sexo': user.sexo,
            'status': 'true'
        });
        Bookshelf.transaction(function(t) {
            pessoa.save(null, {
                transacting: t
            }, {patch: true}).
            then(function(pessoa) {
                usuario.save({
                    pessoa_id: pessoa.id,
                }, {
                    transacting: t
                }, {patch: true}).then(function(model, err) {
                  
              
                    pessoaFisica.save({
                        pessoa_id: pessoa.id,

                    }, {
                        transacting: t
                    }, {patch: true}).then(function(model, err) {
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
}




exports.procurar = function(user, func){
     Usuario.forge().query(function(qb){
        qb.join('pessoa', 'pessoa.idpessoa','=','usuario.pessoa_id');
        qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.idpessoa');
        qb.where('usuario.idusuario', user.idusuario);
        qb.select('usuario.*','pessoa.*','pessoa_fisica.*');

    }).fetch().then(function(model) {
        console.log(model);
        func(model);
    });
}



exports.desativar = function(user, then, fail) {
     this.procurar({idusuario: user.idusuario},
        function(result){
        var pessoa = new Pessoa.Pessoa({
            'idpessoa':result.attributes.pessoa_id,
            'status': 'false'
        });
        var pessoaFisica = new PessoaFisica.PessoaFisica({
            'idpessoa_fisica': result.attributes.idpessoa_fisica,
            'status': 'false'
        });

        var usuario = new Usuario({
             'idusuario': result.attributes.idusuario,
            'status': 'false'
        });
        Bookshelf.transaction(function(t) {
            pessoa.save(null, {
                transacting: t
            }, {patch: true}).
            then(function(pessoa) {
                usuario.save({
                    pessoa_id: pessoa.id,
                }, {
                    transacting: t
                }, {patch: true}).then(function(model, err) {
                  
              
                    pessoaFisica.save({
                        pessoa_id: pessoa.id,

                    }, {
                        transacting: t
                    }, {patch: true}).then(function(model, err) {
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
        })
        })
}