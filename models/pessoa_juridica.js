'use strict';

const _ = require('lodash');
const AU = require('areaazul-utils');

const validation = require('./validation');
const AreaAzul = require('../areaazul');
const log = require('../logging');
const Bookshelf = require('../database');
const Pessoa = Bookshelf.model('Pessoa');

const PessoaJuridica = Bookshelf.Model.extend({
  tableName: 'pessoa_juridica',
  pessoa: function() {
    return this.hasOne('Pessoa', 'id');
  }
}, {


  _camposValidos: function(camposPessoaJuridica, options) {
    let messages = [];

    if (!AU.isTexto(camposPessoaJuridica.nome_fantasia)) {
      messages.push({
        attribute: 'nome_fantasia',
        problem: 'Nome fantasia obrigatório'
      });
    }

    if (!AU.isTexto(camposPessoaJuridica.razao_social)) {
      messages.push({
        attribute: 'razao_social',
        problem: 'Razão social obrigatória'
      });
    }

    if (!validation.isCNPJ(camposPessoaJuridica.cnpj)) {
      messages.push({
        attribute: 'cnpj',
        problem: 'CNPJ inválido'
      });
    }

    return Pessoa
      ._camposValidos(camposPessoaJuridica, options)
      .then(function(messagesPessoa) {
        messages.push.apply(messages, messagesPessoa);
        return messages;
      });
  },


  _cadastrar: function(camposPessoaJuridica, options) {
    const optionsInsert = _.merge({ method: 'insert' }, options || {});
    return PessoaJuridica
      ._camposValidos(camposPessoaJuridica, options)
      .then(messages => {
        if (messages && messages.length) {
          const err = new AreaAzul.BusinessException(
            'Não foi possível cadastrar. Dados inválidos.', {
              messages: messages
            });
          log.warn(err.message, err.details);
          throw err;
        }
      })
      .then(() => {
        return Pessoa
          ._cadastrar(camposPessoaJuridica, options);
      })
      .then(function(pessoa) {
        return new PessoaJuridica({
          cnpj: camposPessoaJuridica.cnpj,
          nome_fantasia: camposPessoaJuridica.nome_fantasia,
          razao_social: camposPessoaJuridica.razao_social,
          contato: camposPessoaJuridica.telefone,
          id: pessoa.id
        })
          .save(null, optionsInsert);
      });
  },


  _buscarPorCNPJ: function(cnpj, options) {
    return PessoaJuridica.forge({ cnpj: cnpj })
      .fetch(options);
  }


});
Bookshelf.model('PessoaJuridica', PessoaJuridica);

const PessoasJuridicas = Bookshelf.Collection.extend({
  model: PessoaJuridica
});
Bookshelf.collection('PessoasJuridicas', PessoasJuridicas);
