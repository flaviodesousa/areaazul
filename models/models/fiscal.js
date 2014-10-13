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

    var usuario = new Usuario.Usuario({
            'login': tax.cpf,
            'autorizacao': '1',
            'primeiro_acesso': 'true',
            'senha': senha,
            'ativo': 'true'
    });

    var usuario1 = new Usuario.Usuario({
            'login': tax.nome_usuario,
            'autorizacao': '1',
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
    console.log("Validate:" +(Usuario.validateNomeUsuario(usuario1)));
    if((Usuario.validateNomeUsuario(usuario1) == true) && (Usuario.validate(usuario) == true) && (PessoaFisica.validate(pessoaFisica) == true) &&(Pessoa.validate(pessoa) == true) ){
            console.log(usuario.login);
            new Usuario.Usuario({
                'login': tax.cpf,
            }).fetch().then(function(model) { 
              if(model == null){
                Pessoa.fiveTransaction(pessoa, fiscal, usuario, usuario1, pessoaFisica, function(result, err){
                if(result == true){
                    util.enviarEmail(tax, senhaGerada);
                    then(result);
                }else{
                    fail(result);
                }
                if(err) fail(err);})
             } else {
                    console.log("CPF já existe!");
                    fail(false);
            }
            });
    }else{
        console.log("Campos obrigatorios!");
        fail(false);
    }
}
