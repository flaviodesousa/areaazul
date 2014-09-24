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
    console.log('getById');
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
    console.log(user.login);
    if (validator.isNull(user.attributes.login) == true || user.attributes.login == '') {
        console.log("CPF obrigatório");
        return false;
    }
    if (validator.isNull(user.attributes.autorizacao) == null || user.attributes.autorizacao == '') {
        console.log("Autorizacao obrigatório");
        return false;
    } 
    return true;
}

exports.cadastrar = function(user, then, fail) {
    var senhaGerada = util.generate();
    var senha = util.criptografa(senhaGerada);
    var dat_nascimento = moment(Date.parse(user.data_nascimento)).format("YYYY-MM-DD");       
    var usuario = new this.Usuario({
            'login': user.cpf,
            'autorizacao': '1',
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

    if((this.validate(usuario) == true) && (PessoaFisica.validate(pessoaFisica) == true) &&(Pessoa.validate(pessoa) == true) ){
            console.log(usuario.login);
            new this.Usuario({
                'login': user.cpf,
            }).fetch().then(function(model) { 
              if(model == null){
                Pessoa.saveTransaction(pessoa, usuario, pessoaFisica, function(result, err){
                if(result == true){
                    util.enviarEmail(user, senhaGerada);
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
    UsuarioCollection.forge().query(function(qb){
         qb.join('pessoa', 'pessoa.id_pessoa','=','usuario.pessoa_id');
         qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
         qb.where('usuario.ativo','=','true');
         qb.select('usuario.*')
         qb.select('pessoa.*');
         qb.select('pessoa_fisica.*');
    }).fetch().then(function(collection) {
        console.log(collection.models);
        func(collection);
    }); 
}



exports.alterarSenha = function(user, then, fail){
    console.log("Tamanho: " + validation.verificaTamanhoDasSenhas(user));
    if((validation.validateSenha(user) == true) && (validation.verificaTamanhoDasSenhas(user) == true)){
    new this.Usuario({
            id_usuario: user.id_usuario
        }).fetch().then(function(model) { 
            if (model != null) {                                                                                                                                                             
                var pwd = model.attributes.senha;
            }
          
            var hash = bcrypt.compareSync(user.senha, pwd);
            console.log(hash);
            if(hash != false){
                var new_senha = util.criptografa(user.nova_senha);
            
        model.save({
            primeiro_acesso: 'false',
            senha : new_senha,
            ativo : 'true'
        }).then(function(model, err) {
            if (err) {
                console.log("Houve erro ao alterar");
                fail(false);
            } else {
                console.log("Alterado com sucesso!");
                then(true);
            }
        });
 
     } else {
         console.log("Houve erro ao alterar");
         fail(false);
     }
 });

 }else{
    console.log("Campos obrigatorios não preenchidos");
    fail(false);
 }
}

exports.editar = function(user, then, fail) {
        console.log(user);
        var dat_nascimento = util.converteData(user.data_nascimento);
        console.log("Nasc: "+user.data_nascimento);
        console.log("Data: "+dat_nascimento);
        var usuario = new this.Usuario({
            'id_usuario': user.id_usuario,
            'login': user.cpf,
            'autorizacao': '1',
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
        Pessoa.saveTransaction(pessoa, usuario, pessoaFisica, function(result, err){
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
        console.log(model);
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
        Pessoa.saveTransaction(pessoa, usuario, pessoaFisica, function(result, err){
            if(result == true){
                    then(result);
            }else{
                    fail(result);
            }
            if(err) fail(err);})
        })
}
