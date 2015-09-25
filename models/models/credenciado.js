var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require('./pessoa');
var PessoaFisica = require('./pessoafisica');
var Usuario = require('./usuario');
var UsuarioCollection = require('../collections/usuario');
var PessoaJuridica = require('./pessoajuridica');
var PessoaJuridicaCollection = require('../collections/pessoajuridica');
var PessoaCollection = require('../collections/pessoa');
var CredenciadoCollection = require('../collections/credenciado');
var PessoaFisicaCollection = require('../collections/pessoafisica');
var Areaazul_mailer = require('areaazul-mailer');
var validation = require('./validation');
var util = require('../../helpers/util');
var validator = require("validator");
var Conta = require('./conta');

var Credenciado = Bookshelf.Model.extend({
    tableName: 'credenciado',
    idAttribute: 'id_credenciado'
});

var CredenciadoCollection =  Bookshelf.Collection.extend({
    model: Credenciado
});


exports.listarpj = function(then, fail)
 {
    CredenciadoCollection.forge().query(function(qb){
         qb.join('pessoa', 'pessoa.id_pessoa','=','credenciado.pessoa_id');
         qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
         qb.join('pessoa_juridica','pessoa_juridica.pessoa_id','=','pessoa.id_pessoa');
         qb.where('credenciado.ativo','=','true');
         qb.select('usuario.*','pessoa.*','pessoa_juridica.*','credenciado.*');
    }).fetch().then(function(collection) {
        then(collection);
    }).catch(function(err){
        fail(err);
    }); 
}

exports.listarpf = function(then, fail)
 {
    CredenciadoCollection.forge().query(function(qb){
         qb.join('pessoa', 'pessoa.id_pessoa','=','credenciado.pessoa_id');
         qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
         qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
         qb.where('credenciado.ativo','=','true');
         qb.select('usuario.*','pessoa.*','pessoa_fisica.*','credenciado.*');
    }).fetch().then(function(collection) {
        then(collection);
    }).catch(function(err){
        fail(err);
    }); 
}

exports.procurarpf = function(accredited, then, fail){
     Credenciado.forge().query(function(qb){
        qb.join('pessoa', 'pessoa.id_pessoa','=','credenciado.pessoa_id');
        qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
        qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
        qb.join('conta','pessoa.id_pessoa','=','conta.pessoa_id');
        qb.where('credenciado.id_credenciado', accredited.id_credenciado);
        qb.select('credenciado.*','usuario.*','pessoa.*','pessoa_fisica.*','conta.*');
    }).fetch().then(function(model) {
        then(model);
    }).catch(function(err){
        fail(err);
    });
}

exports.procurarpj = function(accredited, then, fail){
     Credenciado.forge().query(function(qb){
        qb.join('pessoa', 'pessoa.id_pessoa','=','credenciado.pessoa_id');
        qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
        qb.join('pessoa_juridica','pessoa_juridica.pessoa_id','=','pessoa.id_pessoa');
        qb.join('conta','pessoa.id_pessoa','=','conta.pessoa_id');
        qb.where('credenciado.id_credenciado', accredited.id_credenciado);
        qb.select('credenciado.*','usuario.*','pessoa.*','pessoa_juridica.*','conta.*');
    }).fetch().then(function(model) {
        util.log(model);
        func(model);
    }).catch(function(err){
        fail(err);
    });
}

exports.procurar = function(accredited, then, fail){
     Credenciado.forge().query(function(qb){
        qb.join('pessoa', 'pessoa.id_pessoa','=','credenciado.pessoa_id');
        qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
        qb.join('pessoa_juridica','pessoa_juridica.pessoa_id','=','pessoa.id_pessoa');
        qb.join('pessoa_juridica','pessoa_juridica.pessoa_id','=','pessoa.id_pessoa');
        qb.where('credenciado.id_credenciado', accredited.id_credenciado);
        qb.select('credenciado.*','usuario.*','pessoa.*','pessoa_juridica.*');
    }).fetch().then(function(model) {
        then(model);
    }).catch(function(err){
        fail(err);
    });
}

exports.Credenciado = Credenciado;