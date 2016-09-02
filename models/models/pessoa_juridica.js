'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const validation = require('./validation');
const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
const Pessoa = Bookshelf.model('Pessoa');

var PessoaJuridica = Bookshelf.Model.extend({
  tableName: 'pessoa_juridica'
}, {
  _camposValidos: function(camposPessoaJuridica, options) {
    var message = [];

    if (!camposPessoaJuridica.nome_fantasia) {
      message.push({
        attribute: 'nome_fantasia',
        problem: 'Nome fantasia obrigatório!'
      });
    }

    if (!camposPessoaJuridica.razao_social) {
      message.push({
        attribute: 'razao_social',
        problem: 'Razao social obrigatório!'
      });
    }

    if (validation.isCNPJ(camposPessoaJuridica.cnpj) === false) {
      message.push({
        attribute: 'cnpj',
        problem: 'Cnpj inválido!'
      });
    }

    return Promise.resolve(message);
  },
  _cadastrar: function(camposPessoaJuridica, options) {
    var optionsInsert = _.merge({ method: 'insert' }, options || {});
    return Pessoa
      ._cadastrar(camposPessoaJuridica, options)
      .then(function(pessoa) {
        return PessoaJuridica
          .forge({
            cnpj: camposPessoaJuridica.cnpj,
            nome_fantasia: camposPessoaJuridica.nome_fantasia,
            razao_social: camposPessoaJuridica.razao_social,
            contato: camposPessoaJuridica.telefone,
            id: pessoa.id
          })
          .save(null, optionsInsert);
      });
  },
  cadastrar: function(camposPessoaJuridica) {
    return Bookshelf.transaction(function(t) {
      return PessoaJuridica
        ._cadastrar(camposPessoaJuridica, { transacting: t });
    });
  },
  _buscarPorCNPJ: function(cnpj, options) {
    return PessoaJuridica.forge({ cnpj: cnpj }).fetch(options);
  }
});
Bookshelf.model('PessoaJuridica', PessoaJuridica);

module.exports = PessoaJuridica;
