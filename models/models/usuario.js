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

var Usuario = Bookshelf.Model.extend({
    tableName: 'usuario',
    idAttribute: 'id_usuario'
});

exports.Usuario = Usuario;

var UsuarioCollection =  Bookshelf.Collection.extend({
    model: Usuario
});

exports.getById = function(id, func) {
    util.log('getById');
    new Usuario({
        id_usuario: id
    }).fetch().then(function(model, err) {
        if (model != null)
            var retorno = model.attributes;
        if (err) {
            return func(null);
        }
        func(retorno);
    });
}

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


exports.validate = function(user) {
<<<<<<< HEAD
    if (validator.isNull(user.cpf) == true || user.cpf == '') {
        util.log("CPF obrigatório");
       return false;
    }

    if (validator.isNull(user.nome) == true || user.nome == '') {
        util.log("Nome obrigatório");
       return false;
    }
        if (validator.isNull(user.email) == true || user.email == '') {
        util.log("Email obrigatório");
       return false;
    }
    if (validator.isNull(user.telefone) == true || user.telefone == '') {
        util.log("Telefone obrigatório");
       return false;
    }
  if (validator.isNull(user.data_nascimento) == true || user.data_nascimento == '') {
        util.log("Data de nascimento obrigatório");
       return false;
    }
    if (validator.isNull(user.sexo) == true || user.sexo == '') {
        util.log("Sexo obrigatório");
       return false;
    }
=======
    util.log(user.login);
    if (validator.isNull(user.attributes.login) == true || user.attributes.login == '') {
        util.log("CPF obrigatório");
        return false;
    }
    if (validator.isNull(user.attributes.autorizacao) == null || user.attributes.autorizacao == '') {
        util.log("Autorizacao obrigatório");
        return false;
    } 
>>>>>>> d4476c9e38eb9d04c6020bcebc1c698d3247dc4d
    return true;
}

exports.validateNomeUsuario = function(user) {
<<<<<<< HEAD
    util.log("Login: " + user.attributes.login);
=======
    console.log("Login: " + user.attributes.login);
>>>>>>> d4476c9e38eb9d04c6020bcebc1c698d3247dc4d
    if (validator.isNull(user.attributes.login) == true || user.attributes.login == '') {
        util.log("Login obrigatório");
        return false;
    }
<<<<<<< HEAD

     if((user.attributes.login.length > 4) && (user.attributes.login.length < 8)){
        util.log("O nome do login deve conter no minimo 4 a 8 caracteres");
        return false;
    }
    return true;
}
=======
    if((user.attributes.login.length) >= 6){
          if((user.attributes.login.length) <= 8){
                return true;
          } else{
            util.log("O nome do login deve conter no minimo 6 a 8 caracteres");
            return false;
          }
     }else{
        util.log("O nome do login deve conter no minimo 6 a 8 caracteres");
        return false;
     }
    return true;
}

>>>>>>> d4476c9e38eb9d04c6020bcebc1c698d3247dc4d
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

<<<<<<< HEAD
   // if((this.validate(usuario) == true) && (PessoaFisica.validate(pessoaFisica) == true) &&(Pessoa.validate(pessoa) == true) ){
=======
    if((this.validate(usuario) == true) && (PessoaFisica.validate(pessoaFisica) == true) &&(Pessoa.validate(pessoa) == true) ){
>>>>>>> d4476c9e38eb9d04c6020bcebc1c698d3247dc4d
            util.log(usuario.login);
            new this.Usuario({
                'login': user.cpf,
            }).fetch().then(function(model) { 
              if(model == null){
                Pessoa.saveTransaction(pessoa, usuario, pessoaFisica, function(result, err){
                if(result == true){
<<<<<<< HEAD
                    util.enviarEmail(user, login, senhaGerada);
=======
                    util.enviarEmailConfirmacao(user, login, senhaGerada);
>>>>>>> d4476c9e38eb9d04c6020bcebc1c698d3247dc4d
                    then(result);
                }else{
                    fail(result);
                }
                if(err) fail(err);})
             } else {
                    util.log("CPF já existe!");
                    fail(false);
            }
            });
<<<<<<< HEAD
  //  }else{
     //   util.log("Campos obrigatorios!");
   //     fail(false);
   // }
=======
    }else{
        util.log("Campos obrigatorios!");
        fail(false);
    }
>>>>>>> d4476c9e38eb9d04c6020bcebc1c698d3247dc4d
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



exports.alterarSenha = function(user, then, fail){
    util.log("Tamanho: " + validation.verificaTamanhoDasSenhas(user));
    if((validation.validateSenha(user) == true) && (validation.verificaTamanhoDasSenhas(user) == true)){
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
                fail(false);
            } else {
                util.log("Alterado com sucesso!");
                then(true);
            }
        });
 
     } else {
         util.log("Houve erro ao alterar");
         fail(false);
     }
 });

 }else{
    util.log("Campos obrigatorios não preenchidos");
    fail(false);
 }
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

exports.procurar = function(user, func){
     Usuario.forge().query(function(qb){
        qb.join('pessoa', 'pessoa.id_pessoa','=','usuario.pessoa_id');
        qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
        qb.where('usuario.id_usuario', user.id_usuario);
        qb.select('usuario.*','pessoa.*','pessoa_fisica.*');
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
        Pessoa.updateTransaction(pessoa, usuario, pessoaFisica, function(result, err){
            if(result == true){
                    then(result);
            }else{
                    fail(result);
            }
            if(err) fail(err);})
        })
}
