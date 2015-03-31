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
var Conta = require('./conta');


var Revendedor = Bookshelf.Model.extend({
    tableName: 'revendedor',
    idAttribute: 'id_revendedor'
});

var RevendedorCollection =  Bookshelf.Collection.extend({
    model: Revendedor
});


exports.getById = function(id, func) {
    util.log('getById');
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
            'autorizacao': '5',
            'primeiro_acesso': 'true',
            'senha': senha,
            'ativo': 'true'
    });

    var revendedor = new this.Revendedor({
            'ativo': 'true'
    });

    var conta = new Conta.Conta({
        'data_abertura': new Date(),
        'saldo': '10.0',
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
        Pessoa.fiveSaveTransaction(pessoa, revendedor, usuario, conta, pessoaFisica, 
            function(model){
                util.enviarEmailConfirmacao(dealer, login, senhaGerada);
                then(model);
            }, function(err){
                fail(err);
        });
    } else {
        Pessoa.fiveSaveTransaction(pessoa, revendedor, usuario, conta, pessoaJuridica, 
            function(model){
                util.enviarEmailConfirmacao(dealer, login, senhaGerada);
                then(model);
            }, function(err){
                fail(err);
        });
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
        util.log(collection.models);
        then(collection);
    }).catch(function(err){
        fail(err);
    }); 
}

exports.listarpf = function(then, fail)
 {
    RevendedorCollection.forge().query(function(qb){
         qb.join('pessoa', 'pessoa.id_pessoa','=','revendedor.pessoa_id');
         qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
         qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
         qb.where('revendedor.ativo','=','true');
         qb.select('usuario.*','pessoa.*','pessoa_fisica.*','revendedor.*');
    }).fetch().then(function(collection) {
        then(collection);
    }).catch(function(err){
        fail(err);
    }); 
}

exports.procurarpf = function(dealer, then, fail){
     Revendedor.forge().query(function(qb){
        qb.join('pessoa', 'pessoa.id_pessoa','=','revendedor.pessoa_id');
        qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
        qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
        qb.join('conta','pessoa.id_pessoa','=','conta.pessoa_id');
        qb.where('revendedor.id_revendedor', dealer.id_revendedor);
        qb.select('revendedor.*','usuario.*','pessoa.*','pessoa_fisica.*','conta.*');
    }).fetch().then(function(model) {
        then(model);
    }).catch(function(err){
        fail(err);
    });
}

exports.procurarpj = function(dealer, then, fail){
     Revendedor.forge().query(function(qb){
        qb.join('pessoa', 'pessoa.id_pessoa','=','revendedor.pessoa_id');
        qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
        qb.join('pessoa_juridica','pessoa_juridica.pessoa_id','=','pessoa.id_pessoa');
        qb.join('conta','pessoa.id_pessoa','=','conta.pessoa_id');
        qb.where('revendedor.id_revendedor', dealer.id_revendedor);
        qb.select('revendedor.*','usuario.*','pessoa.*','pessoa_juridica.*','conta.*');
    }).fetch().then(function(model) {
        then(model);
    }).catch(function(err){
        fail(err);
    });
}

exports.procurar = function(dealer, then, fail){
    Revendedor.forge().query(function(qb){
        qb.join('pessoa', 'pessoa.id_pessoa','=','revendedor.pessoa_id');
        qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
        qb.join('pessoa_juridica','pessoa_juridica.pessoa_id','=','pessoa.id_pessoa');
        qb.join('pessoa_juridica','pessoa_juridica.pessoa_id','=','pessoa.id_pessoa');
        qb.where('revendedor.id_revendedor', dealer.id_revendedor);
        qb.select('revendedor.*','usuario.*','pessoa.*','pessoa_juridica.*');
    }).fetch().then(function(model) {
        then(model);
    }).catch(function(err){
        fail(err);
    });
}


exports.editar = function(dealer, then, fail) {

    util.log(dealer);
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

    if(validator.isNull(pessoaFisica.attributes.cpf) == false){
        Pessoa.transactionUpdate(pessoa, revendedor, usuario, pessoaFisica, 
            function(model){
                then(model);
            }, function(err){
                fail(err);
        });
    } else {
        Pessoa.transactionUpdate(pessoa, revendedor, usuario, pessoaJuridica, 
            function(model){
               then(model);
            }, function(err){
                fail(err);
        });
    }
}

exports.desativarpf = function(dealer, then, fail) {
    util.log(dealer);
    this.procurarpf({id_revendedor: dealer.id_revendedor},
        function(result){
            console.log(result);
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

            
        var conta = new Conta.Conta({
            'id_conta' : result.attributes.id_conta,
            'data_fechamento': new Date(),
            'ativo': 'false'
        });

        Pessoa.fiveUpdateTransaction(pessoa, revendedor, usuario, conta, pessoaFisica, 
            function(model){
                then(model);
            }, function(err){
                fail(err);
        });
    });
}

exports.desativarpj = function(dealer, then, fail) {
    util.log(dealer);
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

        var conta = new Conta.Conta({
            'id_conta' : result.attributes.id_conta,
            'data_fechamento': new Date(),
            'ativo': 'false'
        });

        Pessoa.fiveUpdateTransaction(pessoa, revendedor, usuario, conta, pessoaJuridica, 
            function(model){
                then(model);
            }, function(err){
                fail(err);
        });
    });
}


exports.validateRevendedor = function(dealer){
    var message = [];


    return message;
}

exports.buscarRevendedor = function(user, then, fail){
   
    Revendedor.forge().query(function(qb){
        qb.join('pessoa', 'pessoa.id_pessoa','=','revendedor.pessoa_id');
        qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
        qb.join('conta','conta.pessoa_id','=','pessoa.id_pessoa');
        qb.where('usuario.id_usuario', user.attributes.id_usuario);
        qb.select('revendedor.*','usuario.*','pessoa.*','conta.*');
        console.log("sql: "+qb);
    }).fetch().then(function(model) {
        console.log("model"+model);
        then(model);
    }).catch(function(err){
        console.log("err"+err);
        fail(err);
    });
}


exports.Revendedor = Revendedor;