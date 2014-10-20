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

var Funcionario = Bookshelf.Model.extend({
    tableName: 'funcionario',
    idAttribute: 'id_funcionario'
});

exports.Funcionario = Funcionario;

var FuncionarioCollection =  Bookshelf.Collection.extend({
    model: Funcionario
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

exports.cadastrar = function(functionary, then, fail) {
    var senhaGerada = util.generate();
    var senha = util.criptografa(senhaGerada);
    var dat_nascimento = moment(Date.parse(functionary.data_nascimento)).format("YYYY-MM-DD");       


    var login;
     if(functionary.cpf != null){
        login = functionary.cpf;
    }else{
        login = functionary.cnpj;
    }

    var usuario = new Usuario.Usuario({
            'login': functionary.cpf,
            'autorizacao': '6',
            'primeiro_acesso': 'true',
            'senha': senha,
            'ativo': 'true'
    });

    var usuario1 = new Usuario.Usuario({
            'login': functionary.nome_usuario,
            'autorizacao': '7',
            'primeiro_acesso': 'true',
            'senha': senha,
            'ativo': 'true'
    });

    var funcionario = new this.Funcionario({
        'ativo': 'true',
        'empregador_id':'1'
    });

    var pessoa = new Pessoa.Pessoa({
        'nome': functionary.nome,
        'email': functionary.email,
        'telefone': functionary.telefone,
        'ativo': 'true'
    });
    var pessoaFisica = new PessoaFisica.PessoaFisica({
        'cpf': functionary.cpf,
        'data_nascimento': dat_nascimento,
        'sexo': functionary.sexo,
        'ativo': 'true'
    });
    console.log("Validate:" +(Usuario.validateNomeUsuario(usuario1)));
    if((Usuario.validateNomeUsuario(usuario1) == true) && (Usuario.validate(usuario) == true) && (PessoaFisica.validate(pessoaFisica) == true) &&(Pessoa.validate(pessoa) == true) ){
            console.log(usuario.login);
            new Usuario.Usuario({
                'login': functionary.cpf,
            }).fetch().then(function(model) { 
              if(model == null){
                Pessoa.fiveSaveTransaction(pessoa, funcionario, usuario, usuario1, pessoaFisica, function(result, err){
                if(result == true){
                    util.enviarEmail(functionary,login + " Nome de usuario: "+functionary.nome_usuario ,senhaGerada);
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
    FuncionarioCollection.forge().query(function(qb){
         qb.join('pessoa', 'pessoa.id_pessoa','=','funcionario.pessoa_id');
         qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
         qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
         qb.where('funcionario.ativo','=','true');
         qb.where('usuario.autorizacao','=','7');
         qb.select('usuario.*','pessoa.*','pessoa_fisica.*','funcionario.*');
    }).fetch().then(function(collection) {
        func(collection);
    }); 
}

exports.procurar = function(functionary, func){
    Funcionario.forge().query(function(qb){
         qb.join('pessoa', 'pessoa.id_pessoa','=','funcionario.pessoa_id');
         qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
         qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
         qb.where('funcionario.id_funcionario', functionary.id_funcionario);
         qb.where('usuario.autorizacao','=','7');
         qb.select('usuario.*','pessoa.*','pessoa_fisica.*','funcionario.*');
    }).fetch().then(function(model) {
        func(model);
    }); 
}

exports.editar = function(functionary, then, fail) {
        console.log(functionary);
        var dat_nascimento = util.converteData(functionary.data_nascimento);
        console.log("Nasc: "+functionary.data_nascimento);
        console.log("Data: "+dat_nascimento);
        
        var usuario = new Usuario.Usuario({
            'id_usuario': functionary.id_usuario,
            'login': functionary.cpf,
            'autorizacao': '1',
            'primeiro_acesso': 'true',
            'ativo': 'true'
        });

        var usuario1 = new Usuario.Usuario({
            'id_usuario': functionary.id_usuario,
            'login': functionary.nome_usuario,
            'autorizacao': '1',
            'primeiro_acesso': 'true',
            'ativo': 'true'
        });

        var funcionario = new this.Funcionario({
            'id_funcionario': functionary.id_funcionario,
            'ativo': 'true'
        });

        var pessoa = new Pessoa.Pessoa({
            'id_pessoa':functionary.pessoa_id,
            'nome': functionary.nome,
            'email': functionary.email,
            'telefone': functionary.telefone,
            'ativo': 'true'
        });
        var pessoaFisica = new PessoaFisica.PessoaFisica({
            'id_pessoa_fisica': functionary.id_pessoa_fisica,
            'cpf': functionary.cpf,
            'data_nascimento': dat_nascimento,
            'sexo': functionary.sexo,
            'ativo': 'true'
        });

        Pessoa. Pessoa.fiveUpdateTransaction(pessoa, funcionario, usuario, usuario1, pessoaFisica, function(result, err){
            if(result == true){
                    then(result);
            }else{
                    fail(result);
            }
                if(err) fail(err);}
        )
}

exports.desativar = function(functionary, then, fail) {
     this.procurar({id_funcionario: functionary.id_funcionario},
        function(model){
            console.log("Resultado: "+model);
        
            var pessoa = new Pessoa.Pessoa({
                'id_pessoa':model.attributes.pessoa_id,
                'ativo': 'false'
            });
            var pessoaFisica = new PessoaFisica.PessoaFisica({
                'id_pessoa_fisica': model.attributes.id_pessoa_fisica,
                'ativo': 'false'
            });

            var usuario = new Usuario.Usuario({
                 'id_usuario': model.attributes.id_usuario,
                'ativo': 'false'
            });
            var funcionario = new Funcionario({
                'id_funcionario': model.attributes.id_funcionario,
                'ativo': 'false'
            });
            Pessoa.transactionUpdate(pessoa, funcionario, usuario, pessoaFisica, function(model, err){
                if(model == true){
                        then(model);
                }else{
                        fail(model);
                }
                if(err) fail(err);})
            })
}