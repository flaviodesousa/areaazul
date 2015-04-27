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

var UsuarioFiscal = Bookshelf.Model.extend({
    tableName: 'usuario_fiscal',
    idAttribute: 'pessoa_id'
});

module.exports = UsuarioFiscal;

var FiscalCollection =  Bookshelf.Collection.extend({
    model: UsuarioFiscal
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

    var usuario_fiscal = new this.UsuarioFiscal({
            'login': tax.login,
            'autorizacao': '6',
            'primeiro_acesso': 'true',
            'senha': senha,
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

    new Usuario.Usuario({
    'login': tax.nome_usuario,
    }).fetch().then(function(model) {
        Pessoa.sixSaveTransaction(pessoa, usuario_fiscal, usuario, usuario1, conta, pessoaFisica,
        function(model){
            util.enviarEmailConfirmacao(tax,login + " Nome de usuario: "+tax.nome_usuario ,senhaGerada);
            then(model);
        }, function(err){
            fail(err);
        });
     }).catch(function(){
        fail(err);
     })
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

exports.listar = function(then, fail)
 {
    FiscalCollection.forge().query(function(qb){
         qb.join('pessoa', 'pessoa.id_pessoa','=','usuario_fiscal.pessoa_id');
         qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
         qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
         qb.where('usuario_fiscal.ativo','=','true');
         qb.where('usuario.autorizacao','=','5');
         qb.select('usuario.*','pessoa.*','pessoa_fisica.*','usuario_fiscal.*');
    }).fetch().then(function(collection) {
        then(collection);
    }).catch(function(err){
        fail(err);
    });
}

exports.procurar = function(tax, then, fail){
     UsuarioFiscal.forge().query(function(qb){
        qb.join('pessoa', 'pessoa.id_pessoa','=','usuario_fiscal.pessoa_id');
        qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
        qb.join('conta','pessoa.id_pessoa','=','conta.pessoa_id');
        qb.where('usuario_fiscal.pessoa_id', tax.pessoa_id);
        qb.where('usuario.autorizacao','=','5');
        qb.where('usuario_fiscal.ativo','=','true');
        qb.select('usuario_fiscal.*','usuario.*','pessoa.*','pessoa_fisica.*','conta.*');
    }).fetch().then(function(model) {
        then(model);
    }).catch(function(err){
        fail(err);
    });
}

exports.editar = function(tax, then, fail) {

        var dat_nascimento = util.converteData(tax.data_nascimento);

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

        var usuario_fiscal = new this.UsuarioFiscal({
            'pessoa_id': tax.pessoa_id,
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

        Pessoa.fiveUpdateTransaction(pessoa, usuario_fiscal, usuario, usuario1, pessoaFisica,
        function(model){
            then(model);
        }, function(err){
           fail(err);
        });
}

exports.desativar = function(tax, then, fail) {
    util.log('Tax: '+tax);
     this.procurar({pessoa_id: tax.pessoa_id},
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

        var usuario_fiscal = new UsuarioFiscal({
            'pessoa_id': result.attributes.pessoa_id,
            'ativo': 'false'
        });

        var conta = new Conta.Conta({
            'id_conta' : result.attributes.id_conta,
            'data_fechamento': new Date(),
            'ativo': 'false'
        });

        Pessoa.sixUpdateTransaction(pessoa, usuario_fiscal, usuario, usuario1, conta, pessoaFisica,
            function(model){
                then(model);
            }, function(err){
               fail(err);
        });
     });
}
