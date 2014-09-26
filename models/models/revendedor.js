var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require('./pessoa');
var PessoaFisica = require('./pessoafisica');
var Usuario = require('./usuario');
var UsuarioCollection = require('../collections/usuario');
var PessoaJuridica = require('./pessoajuridica');
var PessoaJuridicaCollection = require('../collections/pessoajuridica');
var PessoaCollection = require('../collections/pessoa');
var RevendedorCollection = require('../collections/revendedor');
var PessoaFisicaCollection = require('../collections/pessoafisica');
var Areaazul_mailer = require('areaazul-mailer');
var validation = require('./validation');
var util = require('./util');
var validator = require("validator");

var Revendedor = Bookshelf.Model.extend({
    tableName: 'revendedor',
    idAttribute: 'id_revendedor'
});

var RevendedorCollection =  Bookshelf.Collection.extend({
    model: Revendedor
});


exports.getById = function(id, func) {
    console.log('getById');
    new Revendedor({
        id_revendedor: id 
    }).fetch().then(function(model, err) {
        if (model != null)
            var retorno = model.attributes;
        if (err) {
            return func(null);
        }
        func(retorno);
    });
}

exports.cadastrar = function(dealer, then, fail) {
    var senhaGerada = util.generate();
    var senha = util.criptografa(senhaGerada);

    var login;
     if(dealer.cpf != null){
        login = dealer.cpf;
    }else{
        login = dealer.cnpj;
    }

   var usuario = new Usuario.Usuario({
            'login': login,
            'autorizacao': '1',
            'primeiro_acesso': 'true',
            'senha': senha,
            'ativo': 'true'
    });

    var revendedor = new this.Revendedor({
            'ativo': 'true'
    });

    var pessoa = new Pessoa.Pessoa({
        'nome': dealer.nome,
        'email': dealer.email,
        'telefone': dealer.telefone,
        'ativo': 'true'
    });

    var pessoaJuridica = new PessoaJuridica. PessoaJuridica({
           'cnpj': dealer.cnpj,
           'nome_fantasia': dealer.nome,
           'razao_social': dealer.razao_social,
           'contato': dealer.contato,
           'ativo': 'true'
    });

    var pessoaFisica = new PessoaFisica.PessoaFisica({
        'cpf': dealer.cpf,
        'ativo': 'true'
    });


    if(validator.isNull(pessoaFisica.attributes.cpf) == false){

            if((PessoaFisica.validate(pessoaFisica) == true) &&(Pessoa.validate(pessoa) == true) ){
                console.log("Pessoa Fisica");
             new PessoaFisica.PessoaFisica({
                'cpf': dealer.cpf,
            }).fetch().then(function(model) { 
              if(model == null){
                Pessoa.transaction(pessoa, revendedor, usuario, pessoaFisica, 
                    function(result, err){
                        if(result == true){
                            util.enviarEmail(dealer, login, senhaGerada);
                            then(result);
                        }else{
                            fail(result);
                        }
                        if(err){
                            fail(err);  
                        }
                    }
                )
                } else {
                    console.log("CPF já existe!");
                    fail(false);
                }
            });
        }else{
            console.log("Campos obrigatórios!");
            fail(false);
        }
    } else {

    if((Pessoa.validate(pessoa) == true) && (PessoaJuridica.validate(pessoaJuridica) == true)){
        new PessoaJuridica.PessoaJuridica({
            'cnpj': dealer.cnpj,
        }).fetch().then(function(model) { 
        if(model == null){
                Pessoa.transaction(pessoa, revendedor, usuario, pessoaJuridica, 
                    function(result, err){
                        if(result == true){
                            util.enviarEmail(dealer, login, senhaGerada);
                            then(result);
                        }else{
                            fail(result);
                        }
                        if(err){
                            fail(err);  
                        }
                    }
                )
            } else {
                console.log("CNPJ já existe!");
                fail(false);
            }
            });
            }else{
                console.log("Campos obrigatórios!");
                fail(false);
            }
    }
}

exports.listarpj = function(func)
 {
    RevendedorCollection.forge().query(function(qb){
         qb.join('pessoa', 'pessoa.id_pessoa','=','revendedor.pessoa_id');
         qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
         qb.join('pessoa_juridica','pessoa_juridica.pessoa_id','=','pessoa.id_pessoa');
         qb.where('revendedor.ativo','=','true');
         qb.select('usuario.*','pessoa.*','pessoa_juridica.*','revendedor.*');
    }).fetch().then(function(collection) {
        console.log(collection.models);
        func(collection);
    }); 
}

exports.listarpf = function(func)
 {
    RevendedorCollection.forge().query(function(qb){
         qb.join('pessoa', 'pessoa.id_pessoa','=','revendedor.pessoa_id');
         qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
         qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
         qb.where('revendedor.ativo','=','true');
         qb.select('usuario.*','pessoa.*','pessoa_fisica.*','revendedor.*');
    }).fetch().then(function(collection) {
        console.log(collection.models);
        func(collection);
    }); 
}

exports.procurarpf = function(dealer, func){
     Revendedor.forge().query(function(qb){
        qb.join('pessoa', 'pessoa.id_pessoa','=','revendedor.pessoa_id');
        qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
        qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
        qb.where('revendedor.id_revendedor', dealer.id_revendedor);
        qb.select('revendedor.*','usuario.*','pessoa.*','pessoa_fisica.*');
    }).fetch().then(function(model) {
        console.log(model);
        func(model);
    });
}

exports.procurarpj = function(dealer, func){
    console.log(dealer.id_revendedor);
    console.log(dealer);
     Revendedor.forge().query(function(qb){
        qb.join('pessoa', 'pessoa.id_pessoa','=','revendedor.pessoa_id');
        qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
        qb.join('pessoa_juridica','pessoa_juridica.pessoa_id','=','pessoa.id_pessoa');
        qb.where('revendedor.id_revendedor', dealer.id_revendedor);
        qb.select('revendedor.*','usuario.*','pessoa.*','pessoa_juridica.*');
    }).fetch().then(function(model) {
        console.log(model);
        func(model);
    });
}

exports.procurar = function(dealer, func){
    console.log(dealer.id_revendedor);
    console.log(dealer);
     Revendedor.forge().query(function(qb){
        qb.join('pessoa', 'pessoa.id_pessoa','=','revendedor.pessoa_id');
        qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
     qb.join('pessoa_juridica','pessoa_juridica.pessoa_id','=','pessoa.id_pessoa');
        qb.join('pessoa_juridica','pessoa_juridica.pessoa_id','=','pessoa.id_pessoa');
        qb.where('revendedor.id_revendedor', dealer.id_revendedor);
        qb.select('revendedor.*','usuario.*','pessoa.*','pessoa_juridica.*');
    }).fetch().then(function(model) {
        console.log(model);
        func(model);
    });
}


exports.editar = function(dealer, then, fail) {

    console.log(dealer);
    var login;
     if(dealer.cpf != null){
        login = dealer.cpf;
    }else{
        login = dealer.cnpj;
    }

   var usuario = new Usuario.Usuario({
            'id_usuario': dealer.id_usuario,
            'login': login,
            'autorizacao': '1',
            'primeiro_acesso': 'true',
           // 'senha': senha,
            'ativo': 'true'
    });

    var revendedor = new this.Revendedor({
            'id_revendedor': dealer.id_revendedor,
            'ativo': 'true'
    });

    var pessoa = new Pessoa.Pessoa({
        'id_pessoa': dealer.pessoa_id,
        'nome': dealer.nome,
        'email': dealer.email,
        'telefone': dealer.telefone,
        'ativo': 'true'
    });

    var pessoaJuridica = new PessoaJuridica. PessoaJuridica({
            'id_pessoa_juridica': dealer.id_pessoa_juridica,
           'cnpj': dealer.cnpj,
           'nome_fantasia': dealer.nome,
           'razao_social': dealer.razao_social,
           'contato': dealer.contato,
           'ativo': 'true'
    });

    var pessoaFisica = new PessoaFisica.PessoaFisica({
        'id_pessoa_fisica': dealer.id_pessoa_fisica,
        'cpf': dealer.cpf,
        'ativo': 'true'
    });
    console.log(validator.isNull(pessoaFisica.attributes.cpf));

    if(validator.isNull(pessoaFisica.attributes.cpf) == false){

            if((PessoaFisica.validate(pessoaFisica) == true) &&(Pessoa.validate(pessoa) == true) ){
                console.log("Pessoa Fisica");
                Pessoa.transactionUpdate(pessoa, revendedor, usuario, pessoaFisica, 
                    function(result, err){
                        if(result == true){
        
                            then(result);
                        }else{
                            fail(result);
                        }
                        if(err){
                            fail(err);  
                        }
                    }
                )
        }else{
            console.log("Campos obrigatórios!");
            fail(false);
        }
    } else {

    if((Pessoa.validate(pessoa) == true) && (PessoaJuridica.validate(pessoaJuridica) == true)){
        console.log("Pessoa Juridica");
           console.log(pessoa, revendedor, usuario, pessoaJuridica);
                Pessoa.transactionUpdate(pessoa, revendedor, usuario, pessoaJuridica, 
                    function(result, err){
                        if(result == true){
                            then(result);
                        }else{
                            fail(result);
                        }
                        if(err){
                            fail(err);  
                        }
                    }
                )
            }else{
                console.log("Campos obrigatórios!");
                fail(false);
            }
    }
}

exports.desativarpf = function(dealer, then, fail) {
    console.log(dealer);
    this.procurarpf({id_revendedor: dealer.id_revendedor},
        function(result){
        var pessoa = new Pessoa.Pessoa({
            'id_pessoa':result.attributes.pessoa_id,
            'ativo': 'false'
        });

        var pessoaFisica = new PessoaFisica.PessoaFisica({
            'id_pessoa_fisica': result.attributes.id_pessoa_fisica,
            'ativo': 'false'
        });
        var revendedor = new Revendedor({
             'id_revendedor': result.attributes.id_revendedor,
            'ativo': 'false'
        });

        var usuario = new Usuario.Usuario({
             'id_usuario': result.attributes.id_usuario,
            'ativo': 'false'
        });
        Pessoa.transactionUpdate(pessoa, revendedor, usuario, pessoaFisica, function(result, err){
            if(result == true){
                    then(result);
            }else{
                    fail(result);
            }
            if(err) fail(err);})
        })
}

exports.desativarpj = function(dealer, then, fail) {
    console.log(dealer);
    this.procurarpj({id_revendedor: dealer.id_revendedor},
        function(result){
        var pessoa = new Pessoa.Pessoa({
            'id_pessoa':result.attributes.pessoa_id,
            'ativo': 'false'
        });
        var pessoaJuridica = new PessoaJuridica.PessoaJuridica({
            'id_pessoa_juridica': result.attributes.id_pessoa_juridica,
            'ativo': 'false'
        });
        var usuario = new Usuario.Usuario({
             'id_usuario': result.attributes.id_usuario,
            'ativo': 'false'
        });

        var revendedor = new Revendedor({
            'id_revendedor': dealer.id_revendedor,
            'ativo': 'false'
        });

        Pessoa.transactionUpdate(pessoa, revendedor, usuario, pessoaJuridica, function(result, err){
            if(result == true){
                    then(result);
            }else{
                    fail(result);
            }
            if(err) fail(err);})
        })
}

exports.Revendedor = Revendedor;