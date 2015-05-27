'use strict';

var _ = require('lodash');
var Bookshelf = require('bookshelf').conexaoMain;
var validator = require('validator');
var util = require('./util');
var validation = require('./validation');

var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require('./pessoa').Pessoa;


var PessoaJuridica = Bookshelf.Model.extend({
  tableName: 'pessoa_juridica',
  idAttribute: 'pessoa_id',
},{
  _cadastrar: function(pj, options) {
    console.log('pj: '+pj);
    var optionsInsert = _.merge(options || {}, {method: 'insert'});
    return Pessoa
      .forge({
        nome: pj.nome,
        email: pj.email,
        telefone: pj.telefone,
        ativo: true,
      })
      .save(null, options)
      .then(function(pessoa) {
        return PessoaJuridica
          .forge({
            cnpj: pj.cnpj,
            nome_fantasia: pj.nome_fantasia,
            razao_social: pj.razao_social,
            inscricao_estadual: pj.inscricao_estadual,
            contato: pj.contato,
            ramo_atividade: pj.ramo_atividade,
            ativo: true,
            pessoa_id: pessoa.id,
          })
          .save(null, optionsInsert);
      });
  },
  cadastrar: function(tax) {

    console.log("cheguei aq"+tax);
    var pessoaJuridica = null;
    var PessoaJuridica = this;

    return Bookshelf.transaction(function(t) {
      return PessoaJuridica
        ._cadastrar(tax, {transacting: t})
        .then(function(pj) {
          pessoaJuridica = pj;
        });
    })
      .then(function() {
        return pessoaJuridica;
      });
  },





});


exports.validate =  function(pessoaJuridica) {
  var message = [];

  if (validator.isNull(pessoaJuridica.attributes.cnpj) == true || pessoaJuridica.attributes.cnpj == '') {
    message.push({
      attribute: 'cnpj',
      problem: 'Cnpj obrigatório!',
    });
  }

  if (validation.isCNPJ(pessoaJuridica.attributes.cnpj) != true) {
    message.push({
      attribute: 'cnpj',
      problem: 'Cnpj inválido!',
    });
  }

  if (validator.isNull(pessoaJuridica.attributes.razao_social) == true || pessoaJuridica.attributes.razao_social == '') {
    message.push({
      attribute: 'cnpj',
      problem: 'Razão social obrigatório!',
    });

  }

  if (validator.isNull(pessoaJuridica.attributes.contato) == true 
    || pessoaJuridica.attributes.contato == '') {
    message.push({
      attribute: 'cnpj',
      problem: 'Contato obrigatório!',
    });
  }
  return message;
}





module.exports = PessoaJuridica;