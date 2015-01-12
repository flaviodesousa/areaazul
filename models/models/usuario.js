var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require('./pessoa');
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

var Usuario = Bookshelf.Model.extend({
    tableName: 'usuario',
    idAttribute: 'id_usuario'
});

exports.Usuario = Usuario;

var UsuarioCollection =  Bookshelf.Collection.extend({
    model: Usuario
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


exports.cadastrar = function(user, then, fail) {
    var senhaGerada = util.generate();
    var senha = util.criptografa(senhaGerada);
    var dat_nascimento = moment(Date.parse(user.data_nascimento)).format("YYYY-MM-DD");  

    var login;
     if(user.cpf != null){
        login = user.cpf;
    }else{
        login = user.cnpj;
    }

    util.log("Login: "+login);

    var usuario = new this.Usuario({
            'login': user.cpf,
            'autorizacao': '6',
            'primeiro_acesso': 'true',
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
        'data_nascimento': dat_nascimento,
        'sexo': user.sexo,
        'ativo': 'true'
    });


    var conta = new Conta.Conta({
        'data_abertura': new Date(),
        'saldo': '10.0',
        'ativo': 'true'
    });

    new this.Usuario({
        'login': user.cpf,
    }).fetch().then(function(model) { 
      if(model == null){
        Pessoa.transaction(pessoa, usuario, conta, pessoaFisica, function(result, err){
        if(result == true){
            util.enviarEmailConfirmacao(user, login, senhaGerada);
            then(result);
        }else{
            fail(result);
        }
        if(err) fail(err);})
     } else {
            util.log("Usuario já existe!");
            fail(false);
    }
    });
}


exports.validateNomeUsuario = function(user) {
    util.log("Login: " + user.login);
    if (validator.isNull(user.login) == true || user.login == '') {
        util.log("Login obrigatório");
        return false;
    }

     if((user.login.length > 4) && (user.login.length < 8)){
        util.log("O nome do login deve conter no minimo 4 a 8 caracteres");
        return false;
    }
    return true;
}


exports.listar = function(func)
 {
    UsuarioCollection.forge().query(function(qb){
         qb.join('pessoa', 'pessoa.id_pessoa','=','usuario.pessoa_id');
         qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
         qb.where('usuario.ativo','=','true');
         qb.select('usuario.*')
         qb.select('pessoa.*');
         qb.select('pessoa_fisica.*');
    }).fetch().then(function(collection) {
        util.log(collection.models);
        func(collection);
    }); 
}

exports.validarSenha = function(user){
      if((validation.validateSenha(user) == true) && (validation.verificaTamanhoDasSenhas(user) == true)){
        return true;
      }else{
        return false;
      }
}

exports.alterarSenha = function(user, then, fail){  
        new this.Usuario({
            id_usuario: user.id_usuario
        }).fetch().then(function(model) { 
            if (model != null) {                                                                                                                                                             
                var pwd = model.attributes.senha;
            }
          
            var hash = bcrypt.compareSync(user.senha, pwd);
            util.log(hash);
            if(hash != false){
                var new_senha = util.criptografa(user.nova_senha);
            
                model.save({
                    primeiro_acesso: 'false',
                    senha : new_senha,
                    ativo : 'true'
                }).then(function(model, err) {
                    if (err) {
                        util.log("Houve erro ao alterar");
                        util.log("Model: "+model.attributes);
                        fail(model.attributes);
                    } else {
                        util.log("Alterado com sucesso!");
                        then(true);
                    }
                });
             } else {
                 util.log("Houve erro ao alterar");
                 util.log(model.attributes);
                 fail(model);
             }
 });
}

exports.editar = function(user, then, fail) {
        util.log(user);
        var dat_nascimento = util.converteData(user.data_nascimento);
        util.log("Nasc: "+user.data_nascimento);
        util.log("Data: "+dat_nascimento);
        var usuario = new this.Usuario({
            'id_usuario': user.id_usuario,
            'login': user.cpf,
            'autorizacao': '6',
            'primeiro_acesso': 'true',
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
            'data_nascimento': dat_nascimento,
            'sexo': user.sexo,
            'ativo': 'true'
        });
        Pessoa.updateTransaction(pessoa, usuario, pessoaFisica, function(result, err){
            if(result == true){
                    then(result);
            }else{
                    fail(result);
            }
                if(err) fail(err);}
        )
}

exports,validateAlteracao = function(user){
  util.log(user.login);
    if (validator.isNull(user.nome) == true || user.nome == '') {
        util.log("Nome obrigatório");
        return false;
    }
    if (validator.isNull(user.sexo) == true || user.sexo == '') {
        util.log("Sexo obrigatório");
        return false;
    }
    if (validator.isNull(user.email) == true || user.email == '') {
        util.log("Email obrigatório!");
        return false;
    }
    if(validator.isEmail(user.email) == false){
        util.log("Email Inválido");
        return false;
    }
    if (user.data_nascimento == '') {
        util.log("Data Nascimento obrigatório");
        return false;
    }
    return true;
}

exports.validate = function(user){
    util.log(user);
    if (validator.isNull(user.nome) == true || user.nome == '') {
        util.log("Nome obrigatório");
        return false;
    }
    if (validator.isNull(user.sexo) == true || user.sexo == '') {
        util.log("Sexo obrigatório");
        return false;
    }
    if (validator.isNull(user.cpf) == true || user.cpf == '') {
        util.log("CPF obrigatório!");
        return false;
    }
    if (validator.isNull(user.email) == true || user.email == '') {
        util.log("Email obrigatório!");
        return false;
    }
    if(validator.isEmail(user.email) == false){
        util.log("Email Inválido");
        return false;
    }
    if(validation.isCPF(user.cpf) == false){
        util.log("Cpf Inválido");
        return false;
    }
    if (user.data_nascimento == '') {
        util.log("Data Nascimento obrigatório");
        return false;
    }
    return true;
}

exports.procurar = function(user, func){
     Usuario.forge().query(function(qb){
        qb.join('pessoa', 'pessoa.id_pessoa','=','usuario.pessoa_id');
        qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
        qb.join('conta','pessoa.id_pessoa','=','conta.pessoa_id');
        qb.where('usuario.id_usuario', user.id_usuario);
        qb.select('usuario.*','pessoa.*','pessoa_fisica.*', 'conta.*');
    }).fetch().then(function(model) {
        util.log(model);
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

        var conta = new Conta.Conta({
            'id_conta' : result.attributes.id_conta,
            'data_fechamento': new Date(),
            'ativo': 'false'
        });

        Pessoa.updateTransaction(pessoa, usuario, conta, pessoaFisica, function(result, err){
            if(result == true){
                    then(result);
            }else{
                    fail(result);
            }
            if(err) fail(err);})
        })
}