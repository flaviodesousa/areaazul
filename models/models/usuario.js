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

    var usuario = new this.Usuario({
            'login': user.cpf,
            'autorizacao': '3',
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

    Pessoa.transaction(pessoa, usuario, conta, pessoaFisica, function(model){
        util.enviarEmailConfirmacao(user, login, senhaGerada);
        then(model);
    }, function(err) {
        fail(err);
    });
}

exports.listar = function(then, fail)
 {
    UsuarioCollection.forge().query(function(qb){
         qb.join('pessoa', 'pessoa.id_pessoa','=','usuario.pessoa_id');
         qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
         qb.where('usuario.ativo','=','true');
         qb.select('usuario.*')
         qb.select('pessoa.*');
         qb.select('pessoa_fisica.*');
    }).fetch().then(function(collection) {
        then(collection);
    }).catch(function(err){
        fail(err);
    }); 
}



exports.alterarSenha = function(user, then, fail){  
        new this.Usuario({
            id_usuario: user.id_usuario
        }).fetch().then(function(model) { 
            if (model != null) {                                                                                                                                                             
                var pwd = model.attributes.senha;
            }
            var hash = bcrypt.compareSync(user.senha, pwd);
            console.log("hash"+hash);
            if(hash != false){
                var new_senha = util.criptografa(user.nova_senha);
            
                model.save({
                    primeiro_acesso: 'false',
                    senha : new_senha,
                    ativo : 'true'
                }).then(function(model){
                    util.log("Alterado com sucesso!");
                    then(model);
                }).catch(function(err){
                    util.log("Houve erro ao alterar");
                    util.log("Model: "+model.attributes);
                    fail(model.attributes);
                    fail(err);
                });
             } else {
                fail();
             }
     }).catch(function(err){
        fail(err);
     });
}

exports.editar = function(user, then, fail) {
        var dat_nascimento = util.converteData(user.data_nascimento);

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

        Pessoa.updateTransaction(pessoa, usuario, pessoaFisica, 
        function(model){
            then(model);
        }, function(err){
            fail(err);
        });
}


exports.procurar = function(user, then, fail){
     Usuario.forge().query(function(qb){
        qb.join('pessoa', 'pessoa.id_pessoa','=','usuario.pessoa_id');
        qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
        qb.join('conta','pessoa.id_pessoa','=','conta.pessoa_id');
        qb.where('usuario.id_usuario', user.id_usuario);
        qb.select('usuario.*','pessoa.*','pessoa_fisica.*', 'conta.*');
    }).fetch().then(function(model){
        then(model);
    }).catch(function(err){
        fail(err);
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

        Pessoa.updateTransaction(pessoa, usuario, conta, pessoaFisica, 
        function(model){
            then(model);
        }, function(){
            fail(err);
        });

    });
}


exports.validate = function(user){
    var message = [];
    if (validator.isNull(user.nome) == true || user.nome == '') {
        message.push({attribute : 'nome', problem : "Nome obrigatório"});
    }
    if (validator.isNull(user.sexo) == true || user.sexo == '') {
        message.push({attribute : "sexo", problem : "Nome obrigatório"});
    }
    if (validator.isNull(user.cpf) == true || user.cpf == '') {
        message.push({attribute : "cpf", problem : "CPF é obrigatório"});
    }
    if (validator.isNull(user.email) == true || user.email == '') {
       message.push({attribute : "email", problem : "Email obrigatório!"});
    }
    if(validator.isEmail(user.email) == false){
       message.push({attribute: "email" , problem : "Email inválido!"});
    }
    if(validation.isCPF(user.cpf) == false){
        message.push({attribute : "cpf", problem : "CPF inválido!"});
    }
    if (user.data_nascimento == '') {
       message.push({attribute : "data_nascimento", problem : "Data de nascimento é obrigatório!"});
    }

    for(var i = 0; i<message.length;i++){
        console.log("Atributo: "+message[i].attribute+" Problem: "+message[i].problem);
    }
    return message;
}

exports.validateNomeUsuario = function(user) {
    var message = [];
    if (validator.isNull(user.login) == true || user.login == '') {
        message.push({attribute : 'nova_senha', problem : "Login é obrigatório!"});
    }
    if((user.login.length > 4) && (user.login.length < 8)){
        message.push({attribute : 'login', problem : "O nome de login deve conter no minimo 4 a 8 caracteres"});
    }
    return message;
}


exports.validarSenha = function(user){
    var message = [];
    if(user.nova_senha == null || user.nova_senha == ''){
        message.push({attribute : 'nova_senha', problem : "Nova senha é obrigatório!"});
    }
    if(user.senha == null || user.senha == ''){
        message.push({attribute : 'senha', problem : "Senha é obrigatório!"});
    }
    if(user.conf_senha == null || user.conf_senha == ''){
        message.push({attribute : 'conf_senha', problem : "Confirmação de senha é obrigatório!"});
    }
    if(user.nova_senha  != user.conf_senha){
        message.push({attribute : 'nova_senha', problem : "As senhas devem ser iguais!"});                                               
    }
    if(user.senha.length < 4 && user.senha.length > 8 ){
        message.push({attribute : 'senha', problem : "A senha deve conter no minimo 4 a 8 caracteres!"});  
    }
    if(user.conf_senha.length < 4 && user.conf_senha.length > 8 ){
        message.push({attribute : 'conf_senha', problem : "A confirmação de senha deve conter no minimo 4 a 8caracteres!"});  
    }
    if(user.nova_senha.length < 4 && user.nova_senha.length  > 8 ){
        message.push({attribute : 'nova_senha', problem : "A nova senha deve conter no minimo 4 a 8 caracteres!"});  
    }

    for(var i = 0; i<message.length;i++){
        console.log("Atributo: "+message[i].attribute+" Problem: "+message[i].problem);
    }

    return message;
}
