var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require('./pessoa');
var Usuario = require('./usuario');
var PessoaFisica = require('./pessoafisica');
var PessoaCollection = require('../collections/pessoa');
var UsuarioCollection = require('../collections/usuario');
var PessoaFisicaCollection = require('../collections/pessoafisica');
var bcrypt = require('bcrypt');
var Areaazul_mailer = require('areaazul-mailer');
var moment = require('moment');
var validator = require("validator");
var validation = require('./validation');
var util = require('./util');
var Conta = require('./conta');

var Fiscal = Bookshelf.Model.extend({
    tableName: 'fiscal',
    idAttribute: 'id_fiscal'
});

exports.Fiscal = Fiscal;

var FiscalCollection =  Bookshelf.Collection.extend({
    model: Fiscal
});

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

exports.cadastrar = function(tax, then, fail) {
    var senhaGerada = util.generate();
    var senha = util.criptografa(senhaGerada);
    var dat_nascimento = moment(Date.parse(tax.data_nascimento)).format("YYYY-MM-DD");       

    var login;
     if(tax.cpf != null){
        login = tax.cpf;
    }else{
        login = tax.cnpj;
    }

    var usuario = new Usuario.Usuario({
            'login': tax.cpf,
            'autorizacao': '6',
            'primeiro_acesso': 'true',
            'senha': senha,
            'ativo': 'true'
    });

    var usuario1 = new Usuario.Usuario({
            'login': tax.login,
            'autorizacao': '5',
            'primeiro_acesso': 'true',
            'senha': senha,
            'ativo': 'true'
    });

    var fiscal = new this.Fiscal({
        'ativo': 'true'
    });

    var pessoa = new Pessoa.Pessoa({
        'nome': tax.nome,
        'email': tax.email,
        'telefone': tax.telefone,
        'ativo': 'true'
    });
    var pessoaFisica = new PessoaFisica.PessoaFisica({
        'cpf': tax.cpf,
        'data_nascimento': dat_nascimento,
        'sexo': tax.sexo,
        'ativo': 'true'
    });

    var conta = new Conta.Conta({
        'data_abertura': new Date(),
        'saldo': '10.0',
        'ativo': 'true'
    });

 
            new Usuario.Usuario({
                'login': tax.cpf,
            }).fetch().then(function(model) { 
            if(model == null){

                new Usuario.Usuario({
                'login': tax.nome_usuario, 
                }).fetch().then(function(model) { 
                    if(model == null){
                    Pessoa.sixSaveTransaction(pessoa, fiscal, usuario, usuario1, conta, pessoaFisica, function(result, err){
                    if(result == true){
                        util.enviarEmailConfirmacao(tax,login + " Nome de usuario: "+tax.nome_usuario ,senhaGerada);
                        then(result);
                    }else{
                        fail(result);
                    }
                    if(err) fail(err);})

                    } else {
                            console.log("Nome usuario já existe!");
                            fail(false);
                    }
             });
             } else {
                    console.log("CPF já existe!");
                    fail(false);
            }
            });
}

exports.validateFiscal = function(tax){

    var pessoa = new Pessoa.Pessoa({
        'nome': tax.nome,
        'email': tax.email,
        'telefone': tax.telefone,
        'ativo': 'true'
    });
    var pessoaFisica = new PessoaFisica.PessoaFisica({
        'cpf': tax.cpf,
        'data_nascimento': tax.data_nascimento,
        'sexo': tax.sexo,
        'ativo': 'true'
    });

    if(Usuario.validateNomeUsuario(tax) != true){
        return false;
    }

    if(PessoaFisica.validate(pessoaFisica) != true){
        return false;
    }

    if(Pessoa.validate(pessoa) != true){
        return false;
    }

    return true;

}

exports.listar = function(func)
 {
    FiscalCollection.forge().query(function(qb){
         qb.join('pessoa', 'pessoa.id_pessoa','=','fiscal.pessoa_id');
         qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
         qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
         qb.where('fiscal.ativo','=','true');
         qb.where('usuario.autorizacao','=','5');
         qb.select('usuario.*','pessoa.*','pessoa_fisica.*','fiscal.*');
    }).fetch().then(function(collection) {
        func(collection);
    }); 
}

exports.procurar = function(tax, func){
     Fiscal.forge().query(function(qb){
        qb.join('pessoa', 'pessoa.id_pessoa','=','fiscal.pessoa_id');
        qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
        qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
        qb.join('conta','pessoa.id_pessoa','=','conta.pessoa_id');
        qb.where('fiscal.id_fiscal', tax.id_fiscal);
        qb.where('usuario.autorizacao','=','5');
        qb.where('fiscal.ativo','=','true');
        qb.select('fiscal.*','usuario.*','pessoa.*','pessoa_fisica.*','conta.*');
    }).fetch().then(function(model) {
        func(model);
    });
}

exports.editar = function(tax, then, fail) {
        util.log(tax);
        var dat_nascimento = util.converteData(tax.data_nascimento);
        util.log("Nasc: "+tax.data_nascimento);
        util.log("Data: "+dat_nascimento);
        
        var usuario = new Usuario.Usuario({
            'id_usuario': tax.id_usuario,
            'login': tax.cpf,
            'autorizacao': '6',
            'primeiro_acesso': 'true',
            'ativo': 'true'
        });

        var usuario1 = new Usuario.Usuario({
            'id_usuario': tax.id_usuario,
            'login': tax.nome_usuario,
            'autorizacao': '5',
            'primeiro_acesso': 'true',
            'ativo': 'true'
        });

        var fiscal = new this.Fiscal({
            'id_fiscal': tax.id_fiscal,
            'ativo': 'true'
        });

        var pessoa = new Pessoa.Pessoa({
            'id_pessoa':tax.pessoa_id,
            'nome': tax.nome,
            'email': tax.email,
            'telefone': tax.telefone,
            'ativo': 'true'
        });
        var pessoaFisica = new PessoaFisica.PessoaFisica({
            'id_pessoa_fisica': tax.id_pessoa_fisica,
            'cpf': tax.cpf,
            'data_nascimento': dat_nascimento,
            'sexo': tax.sexo,
            'ativo': 'true'
        });

        Pessoa. Pessoa.fiveUpdateTransaction(pessoa, fiscal, usuario, usuario1, pessoaFisica, 
        function(result, err){
            if(result == true){
                    then(result);
            }else{
                    fail(result);
            }
                if(err) fail(err);}
        )
}

exports.desativar = function(tax, then, fail) {
    util.log('Tax: '+tax);
     this.procurar({id_fiscal: tax.id_fiscal},
        function(result){
        var pessoa = new Pessoa.Pessoa({
            'id_pessoa': result.attributes.pessoa_id,
            'ativo': 'false'
        });
        var pessoaFisica = new PessoaFisica.PessoaFisica({
            'id_pessoa_fisica': result.attributes.id_pessoa_fisica,
            'ativo': 'false'
        });

        var usuario = new Usuario.Usuario({
             'id_usuario': result.attributes.id_usuario,
            'ativo': 'false'
        });
        var usuario1 = new Usuario.Usuario({
            'id_usuario': result.attributes.id_usuario,
            'ativo': 'false'
        });

        var fiscal = new Fiscal({
            'id_fiscal': result.attributes.id_fiscal,
            'ativo': 'false'
        });

        var conta = new Conta.Conta({
            'id_conta' : result.attributes.id_conta,
            'data_fechamento': new Date(),
            'ativo': 'false'
        });

        Pessoa.sixUpdateTransaction(pessoa, fiscal, usuario, usuario1, conta, pessoaFisica, 
        function(model, err){
            if(model == true){
                    then(model);
            }else{
                    fail(model);
            }
            if(err) fail(err);})
        })
}
