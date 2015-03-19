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
var crud = require('./crud');
var Conta = require('./conta');

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
            'autorizacao': '3',
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

    var conta = new Conta.Conta({
        'data_abertura': new Date(),
        'saldo': '10.0',
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

    new Usuario.Usuario({
    'login': functionary.nome_usuario, 
    }).fetch().then(function(model) { 
        Pessoa.sixSaveTransaction(pessoa, funcionario, usuario, usuario1, conta, pessoaFisica, 
            function(model){
                util.enviarEmailConfirmacao(functionary,login + " Nome de usuario: "+functionary.nome_usuario ,senhaGerada);
                then(result);
        }, function(err){
                fail(err);
     }).catch(function(err){
        fail(err);
     });
    });
}


exports.validateFuncionario = function(functionary){

    var usuario = new Usuario.Usuario({
            'login': functionary.cpf,
            'autorizacao': '6',
            'primeiro_acesso': 'true',
            'senha': senha,
            'ativo': 'true'
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



    if(Usuario.validateNomeUsuario(functionary) != true){
        return false;
    }

    if(Usuario.validate(usuario) != true){
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
    FuncionarioCollection.forge().query(function(qb){
         qb.join('pessoa', 'pessoa.id_pessoa','=','funcionario.pessoa_id');
         qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
         qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
         qb.where('funcionario.ativo','=','true');
         qb.where('usuario.autorizacao','=','7');
         qb.select('usuario.*','pessoa.*','pessoa_fisica.*','funcionario.*');
    }).fetch().then(function(collection) {
        then(collection);
    }).catch(function(err){
        fail(err);
    }); 
}

exports.procurar = function(functionary, then, fail){
    Funcionario.forge().query(function(qb){
         qb.join('pessoa', 'pessoa.id_pessoa','=','funcionario.pessoa_id');
         qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
         qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
         qb.join('conta','pessoa.id_pessoa','=','conta.pessoa_id');
         qb.where('funcionario.id_funcionario', functionary.id_funcionario);
         qb.where('usuario.autorizacao','=','7');
         qb.select('usuario.*','pessoa.*','pessoa_fisica.*','funcionario.*', 'conta.*');
    }).fetch().then(function(model) {
        then(model);
    }).catch(function(err){
        fail(err);
    }); 
}

exports.editar = function(functionary, then, fail) {
        var dat_nascimento = util.converteData(functionary.data_nascimento);
        
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

        Pessoa.fiveUpdateTransaction(pessoa, funcionario, usuario, usuario1, pessoaFisica, 
            function(model){
                then(model);
            }, function(err){
                fail(err);
        });

}

exports.desativar = function(functionary, then, fail) {
     this.procurar({id_funcionario: functionary.id_funcionario},
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
            var funcionario = new Funcionario({
                'id_funcionario': result.attributes.id_funcionario,
                'ativo': 'false'
            });
            var conta = new Conta.Conta({
                'id_conta' : result.attributes.id_conta,
                'data_fechamento': new Date(),
                'ativo': 'false'
            });

            Pessoa.fiveUpdateTransaction(pessoa, funcionario, usuario, pessoaFisica, conta, 
                function(model){
                    then(model);
                }, function(){
                    fail(err);
            });
        });
}