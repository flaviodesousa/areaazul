var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require('./pessoa');
var PessoaFisica = require('./pessoafisica');
var Usuario = require('./usuario');
var UsuarioCollection = require('../collections/usuario');
var PessoaJuridica = require('./pessoajuridica');
var PessoaJuridicaCollection = require('../collections/pessoajuridica');
var PessoaCollection = require('../collections/pessoa');
var CredenciadoCollection = require('../collections/credenciado');
var PessoaFisicaCollection = require('../collections/pessoafisica');
var Areaazul_mailer = require('areaazul-mailer');
var validation = require('./validation');
var util = require('./util');
var validator = require("validator");
var Conta = require('./conta');

var Credenciado = Bookshelf.Model.extend({
    tableName: 'credenciado',
    idAttribute: 'id_credenciado'
});

var CredenciadoCollection =  Bookshelf.Collection.extend({
    model: Credenciado
});

exports.cadastrar = function(accredited, then, fail) {
    var senhaGerada = util.generate();
    var senha = util.criptografa(senhaGerada);

    var login;
     if(accredited.cpf != null){
        login = accredited.cpf;
    }else{
        login = accredited.cnpj;
    }

   var usuario = new Usuario.Usuario({
            'login': login,
            'autorizacao': '4',
            'primeiro_acesso': 'true',
            'senha': senha,
            'ativo': 'true'
    });

    var credenciado = new this.Credenciado({
            'ativo': 'true'
    });

    var pessoa = new Pessoa.Pessoa({
        'nome': accredited.nome,
        'email': accredited.email,
        'telefone': accredited.telefone,
        'ativo': 'true'
    });

    var pessoaJuridica = new PessoaJuridica. PessoaJuridica({
           'cnpj': accredited.cnpj,
           'nome_fantasia': accredited.nome,
           'razao_social': accredited.razao_social,
           'contato': accredited.contato,
           'ativo': 'true'
    });

    var pessoaFisica = new PessoaFisica.PessoaFisica({
        'cpf': accredited.cpf,
        'ativo': 'true'
    });

    var conta = new Conta.Conta({
        'data_abertura': new Date(),
        'saldo': '10.0',
        'ativo': 'true'
    });


    if(validator.isNull(pessoaFisica.attributes.cpf) == false){
        Pessoa.fiveSaveTransaction(pessoa, credenciado, usuario, conta, pessoaFisica, 
            function(model){
                util.enviarEmailConfirmacao(accredited, login, senhaGerada);
                then(result);
            },
            function(err){
                 fail(err);
            });
    } else {
        Pessoa.fiveSaveTransaction(pessoa, credenciado, usuario, conta, pessoaJuridica, 
            function(model){
                util.enviarEmailConfirmacao(accredited, login, senhaGerada);
                then(result);
            },
            function(err){
                 fail(err);
            });
    }
}

exports.listarpj = function(then, fail)
 {
    CredenciadoCollection.forge().query(function(qb){
         qb.join('pessoa', 'pessoa.id_pessoa','=','credenciado.pessoa_id');
         qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
         qb.join('pessoa_juridica','pessoa_juridica.pessoa_id','=','pessoa.id_pessoa');
         qb.where('credenciado.ativo','=','true');
         qb.select('usuario.*','pessoa.*','pessoa_juridica.*','credenciado.*');
    }).fetch().then(function(collection) {
        then(collection);
    }).catch(function(err){
        fail(err);
    }); 
}

exports.listarpf = function(then, fail)
 {
    CredenciadoCollection.forge().query(function(qb){
         qb.join('pessoa', 'pessoa.id_pessoa','=','credenciado.pessoa_id');
         qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
         qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
         qb.where('credenciado.ativo','=','true');
         qb.select('usuario.*','pessoa.*','pessoa_fisica.*','credenciado.*');
    }).fetch().then(function(collection) {
        then(collection);
    }).catch(function(err){
        fail(err);
    }); 
}

exports.procurarpf = function(accredited, then, fail){
     Credenciado.forge().query(function(qb){
        qb.join('pessoa', 'pessoa.id_pessoa','=','credenciado.pessoa_id');
        qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
        qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
        qb.join('conta','pessoa.id_pessoa','=','conta.pessoa_id');
        qb.where('credenciado.id_credenciado', accredited.id_credenciado);
        qb.select('credenciado.*','usuario.*','pessoa.*','pessoa_fisica.*','conta.*');
    }).fetch().then(function(model) {
        then(model);
    }).catch(function(err){
        fail(err);
    });
}

exports.procurarpj = function(accredited, then, fail){
     Credenciado.forge().query(function(qb){
        qb.join('pessoa', 'pessoa.id_pessoa','=','credenciado.pessoa_id');
        qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
        qb.join('pessoa_juridica','pessoa_juridica.pessoa_id','=','pessoa.id_pessoa');
        qb.join('conta','pessoa.id_pessoa','=','conta.pessoa_id');
        qb.where('credenciado.id_credenciado', accredited.id_credenciado);
        qb.select('credenciado.*','usuario.*','pessoa.*','pessoa_juridica.*','conta.*');
    }).fetch().then(function(model) {
        util.log(model);
        func(model);
    }).catch(function(err){
        fail(err);
    });
}

exports.procurar = function(accredited, then, fail){
     Credenciado.forge().query(function(qb){
        qb.join('pessoa', 'pessoa.id_pessoa','=','credenciado.pessoa_id');
        qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
        qb.join('pessoa_juridica','pessoa_juridica.pessoa_id','=','pessoa.id_pessoa');
        qb.join('pessoa_juridica','pessoa_juridica.pessoa_id','=','pessoa.id_pessoa');
        qb.where('credenciado.id_credenciado', accredited.id_credenciado);
        qb.select('credenciado.*','usuario.*','pessoa.*','pessoa_juridica.*');
    }).fetch().then(function(model) {
        then(model);
    }).catch(function(err){
        fail(err);
    });
}


exports.editar = function(accredited, then, fail) {

    util.log(accredited);
    var login;
     if(accredited.cpf != null){
        login = accredited.cpf;
    }else{
        login = accredited.cnpj;
    }

   var usuario = new Usuario.Usuario({
            'id_usuario': accredited.id_usuario,
            'login': login,
            'autorizacao': '1',
            'primeiro_acesso': 'true',
           // 'senha': senha,
            'ativo': 'true'
    });

    var credenciado = new this.Credenciado({
            'id_credenciado': accredited.id_credenciado,
            'ativo': 'true'
    });

    var pessoa = new Pessoa.Pessoa({
        'id_pessoa': accredited.pessoa_id,
        'nome': accredited.nome,
        'email': accredited.email,
        'telefone': accredited.telefone,
        'ativo': 'true'
    });

    var pessoaJuridica = new PessoaJuridica. PessoaJuridica({
            'id_pessoa_juridica': accredited.id_pessoa_juridica,
           'cnpj': accredited.cnpj,
           'nome_fantasia': accredited.nome,
           'razao_social': accredited.razao_social,
           'contato': accredited.contato,
           'ativo': 'true'
    });

    var pessoaFisica = new PessoaFisica.PessoaFisica({
        'id_pessoa_fisica': accredited.id_pessoa_fisica,
        'cpf': accredited.cpf,
        'ativo': 'true'
    });


    if(validator.isNull(pessoaFisica.attributes.cpf) == false){
        Pessoa.transactionUpdate(pessoa, credenciado, usuario, pessoaFisica, 
            function(model){
                then(result);
            }, 
            function(err){
                fail(err);
        });
    } else {
        Pessoa.transactionUpdate(pessoa, credenciado, usuario, pessoaJuridica, 
            function(model){
                then(result);
            }, 
            function(err){
                fail(err);
        });
    }
}

exports.desativarpf = function(accredited, then, fail) {

    this.procurarpf({id_credenciado: accredited.id_credenciado},
        function(result){
        var pessoa = new Pessoa.Pessoa({
            'id_pessoa':result.attributes.pessoa_id,
            'ativo': 'false'
        });

        var pessoaFisica = new PessoaFisica.PessoaFisica({
            'id_pessoa_fisica': result.attributes.id_pessoa_fisica,
            'ativo': 'false'
        });
        var credenciado = new Credenciado({
             'id_credenciado': result.attributes.id_credenciado,
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

        Pessoa.fiveUpdateTransaction(pessoa, credenciado, usuario, conta, pessoaFisica, 
            function(model){
                then(result);
            }, 
            function(err){
                fail(err);
        });
     });
}

exports.desativarpj = function(accredited, then, fail) {
    util.log(accredited);
    this.procurarpj({id_credenciado: accredited.id_credenciado},
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

        var credenciado = new Credenciado({
            'id_credenciado': accredited.id_credenciado,
            'ativo': 'false'
        });

        var conta = new Conta.Conta({
            'id_conta' : result.attributes.id_conta,
            'data_fechamento': new Date(),
            'ativo': 'false'
        });

        Pessoa.fiveUpdateTransaction(pessoa, credenciado, usuario, conta, pessoaJuridica, 
            function(model){
                then(model);
            },
            function(err){
                fail(err);
        });
     });
}

exports.Credenciado = Credenciado;