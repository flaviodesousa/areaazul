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
                Pessoa.fiveSaveTransaction(pessoa, fiscal, usuario, usuario1, pessoaFisica, function(result, err){
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

exports.listar = function(func)
 {
    FiscalCollection.forge().query(function(qb){
         qb.join('pessoa', 'pessoa.id_pessoa','=','fiscal.pessoa_id');
         qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
         qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
         qb.where('fiscal.ativo','=','true');
         qb.select('usuario.*','pessoa.*','pessoa_fisica.*','fiscal.*');
    }).fetch().then(function(collection) {
     //   console.log(collection.models);
        func(collection);
    }); 
}


exports.procurar = function(tax, func){
     FiscalCollection.forge().query(function(qb){
        qb.join('pessoa', 'pessoa.id_pessoa','=','fiscal.pessoa_id');
        qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
        qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
        qb.where('fiscal.id_fiscal', tax.id_fiscal);
        qb.select('fiscal.*','usuario.*','pessoa.*','pessoa_fisica.*');
    }).fetch().then(function(collection) {
        console.log("Modelo: "+collection);
        func(collection);
    });
}

exports.editar = function(tax, then, fail) {
        console.log(tax);
        var dat_nascimento = util.converteData(tax.data_nascimento);
        console.log("Nasc: "+tax.data_nascimento);
        console.log("Data: "+dat_nascimento);
        
        var usuario = new Usuario.Usuario({
            'id_usuario': tax.id_usuario,
            'login': tax.cpf,
            'autorizacao': '1',
            'primeiro_acesso': 'true',
            'ativo': 'true'
        });

        var usuario1 = new Usuario.Usuario({
            'id_usuario': tax.id_usuario,
            'login': tax.nome_usuario,
            'autorizacao': '1',
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

        Pessoa. Pessoa.fiveUpdateTransaction(pessoa, fiscal, usuario, usuario1, pessoaFisica, function(result, err){
            if(result == true){
                    then(result);
            }else{
                    fail(result);
            }
                if(err) fail(err);}
        )
}

exports.desativar = function(tax, then, fail) {

     this.procurar({id_fiscal: tax.id_fiscal},
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
            'ativo': 'true'
        });
        Pessoa.fiveUpdateTransaction(pessoa, fiscal, usuario, usuario1, pessoaFisica, function(result, err){
            if(result == true){
                    then(result);
            }else{
                    fail(result);
            }
            if(err) fail(err);})
        })
}

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
