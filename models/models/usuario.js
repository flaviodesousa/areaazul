var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require('./pessoa');
var PessoaFisica = require('./pessoafisica');
var PessoaCollection = require('../collections/pessoa');
var UsuarioCollection = require('../collections/usuario');
var PessoaFisicaCollection = require('../collections/pessoafisica');
var bcrypt = require('bcrypt');
var Areaazul_mailer = require('areaazul-mailer');


var Usuario = Bookshelf.Model.extend({
    tableName: 'usuario',
    idAttribute: 'id_usuario'
});

exports.Usuario = Usuario;


var UsuarioCollection =  Bookshelf.Collection.extend({
    model: Usuario
});

exports.getById = function(id, func) {
    console.log('getById');
    new Usuario({
        id_usuario: id
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

/*
exports.newPassword = function(user, func){

    var pass = 
    Usuario.forge().query(function(qb){
        qb.where('usuario.senha', password);
        qb.select('usuario.*');
    }).fecth().then(function(model){
        console.log(model);
        func(model);
    });
}*/

/*
function decriptografa(password){
     var pwd = model.get('password');
        var teste = bcrypt.compareSync(cpw, pwd);
}
*/
function criptografa(password){
    var salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);

}

exports.cadastrar = function(user, then, fail) {

    var senhaGerada = generate();
    var senha = criptografa(senhaGerada);
            
    var usuario = new this.Usuario({
            'login': user.cpf,
            'autorizacao': '1',
            'primeiro_acesso': '1',
            'senha': senha,
            'ativo': 'true'
    });
    
    var pessoa = new Pessoa.Pessoa({
        'nome': user.nome,
        'email': user.email,
        'telefone': user.telefone,
        'ativo': 'true'
    });


    var pessoaFisica = new PessoaFisica.PessoaFisica({

        'cpf': user.cpf,
        'data_nascimento': user.data_nascimento,
        'sexo': user.sexo,
        'ativo': 'true'
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
        }).then(function(result, model) {
            console.log(result);
            var message = {
                from: 'AreaAzul <jeffersonarar@hotmail.com>', 
                to:  user.email,
                cc: 'jeffersonarar@hotmail.com',
                subject: 'AreaAzul confirmação de cadastro', 
               html: '<p><b></b>  Por favor '+ user.nome +',' +' clique no link abaixo para confirmação do cadastro. </br> </br>  Sua senha é '+ '<h4>'+ senhaGerada +'</h4>',
            }
            console.log(Areaazul_mailer);
            Areaazul_mailer.enviar.emailer(message);
            then(true);
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
         qb.join('pessoa', 'pessoa.id_pessoa','=','usuario.pessoa_id');
         qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
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
            'id_usuario': user.id_usuario,
            'login': user.cpf,
            'autorizacao': '1',
            'primeiro_acesso': '1',
            'ativo': 'true'
        });
        var pessoa = new Pessoa.Pessoa({
            'id_pessoa':user.pessoa_id,
            'nome': user.nome,
            'email': user.email,
            'telefone': user.telefone,
            'ativo': 'true'
        });
        var pessoaFisica = new PessoaFisica.PessoaFisica({
            'id_pessoa_fisica': user.id_pessoa_fisica,
            'cpf': user.cpf,
            'data_nascimento': user.data_nascimento,
            'sexo': user.sexo,
            'ativo': 'true'
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
        qb.join('pessoa', 'pessoa.id_pessoa','=','usuario.pessoa_id');
        qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
        qb.where('usuario.id_usuario', user.id_usuario);
        qb.select('usuario.*','pessoa.*','pessoa_fisica.*');

    }).fetch().then(function(model) {
        console.log(model);
        func(model);
    });
}

exports.desativar = function(user, then, fail) {
     this.procurar({id_usuario: user.id_usuario},
        function(result){
        var pessoa = new Pessoa.Pessoa({
            'id_pessoa':result.attributes.pessoa_id,
            'ativo': 'false'
        });
        var pessoaFisica = new PessoaFisica.PessoaFisica({
            'id_pessoa_fisica': result.attributes.id_pessoa_fisica,
            'ativo': 'false'
        });

        var usuario = new Usuario({
             'id_usuario': result.attributes.id_usuario,
            'ativo': 'false'
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

function generate(){
        this.pass = "";
        var chars = 6;

        for (var i= 0; i<chars; i++) {
            this.pass += getRandomChar();
        }
        return this.pass;
}

function getRandomChar() {
        var ascii = [[48, 57],[64,90],[97,122]];
        var i = Math.floor(Math.random()*ascii.length);
        return String.fromCharCode(Math.floor(Math.random()*(ascii[i][1]-ascii[i][0]))+ascii[i][0]);
}