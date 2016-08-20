var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require('./pessoa');
var Usuario = require('./usuario');
var PessoaFisica = require('./pessoa_fisica');
var PessoaCollection = require('../collections/pessoa');
var UsuarioCollection = require('../collections/usuario');
var PessoaFisicaCollection = require('../collections/pessoa_fisica');
var bcrypt = require('bcrypt');
var Areaazul_mailer = require('areaazul-mailer');
var moment = require('moment');
var validator = require("validator");
var validation = require('./validation');
var util = require('../../helpers/util');
var Conta = require('./conta');

var Funcionario = Bookshelf.Model.extend({
    tableName: 'funcionario'
});
Bookshelf.model('Funcionario', Funcionario);

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
