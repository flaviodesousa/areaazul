const Promise = require('bluebird');
const validator = require('validator');
const _ = require('lodash');

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;

const AreaAzulMailer = require('areaazul-mailer');

const util = require('areaazul-utils');

const RecuperacaoSenha = Bookshelf.model('RecuperacaoSenha');

var Pessoa = Bookshelf.Model.extend({
  tableName: 'pessoa'
}, {
  _camposValidos: function(camposPessoa/*, options*/) {
    var message = [];

    if (!camposPessoa.nome) {
      message.push({
        attribute: 'nome',
        problem: 'Nome obrigatório!'
      });
    }

    if (!camposPessoa.email) {
      message.push({
        attribute: 'email',
        problem: 'Email obrigatório!'
      });
    } else if (!validator.isEmail(camposPessoa.email)) {
      message.push({
        attribute: 'email',
        problem: 'Email inválido!'
      });
    }

    if (camposPessoa.telefone) {
      const telefoneNumeros = validator.whitelist(
        camposPessoa.telefone, '0123456789');
      if (telefoneNumeros.length < 10) {
        message.push({
          attribute: 'telefone',
          problem: 'Telefone inválido! Inclua o código de área.'
        });
      }
    }

    return Promise.resolve(message);
  },
  _cadastrar: function(camposPessoa, options) {
    const optionsInsert = _.merge({ method: 'insert' }, options);
    const Pessoa = this;
    return Pessoa
      ._camposValidos(camposPessoa, options)
      .then(function(messages) {
        if (messages.length) {
          throw new AreaAzul
            .BusinessException(
            'Não foi possível cadastrar nova Pessoa. Dados inválidos',
            messages);
        }
        return messages;
      })
      .then(function() {
        return new Pessoa({
          nome: camposPessoa.nome,
          email: camposPessoa.email,
          telefone: camposPessoa.telefone,
          observacao: camposPessoa.observacao
        })
          .save(null, optionsInsert);
      });
  },
  verificaEmail: function(pessoaAVerificar, then, fail) {
    var _uuid = util.geradorUUIDAleatorio();
    Pessoa.forge({ email: pessoaAVerificar.email })
      .fetch()
      .then(function(pessoa) {
        if (pessoa !== null) {
          RecuperacaoSenha.cadastrar({
              uuid: _uuid,
              pessoa_id: pessoa.id
            },
            function() {
              AreaAzulMailer.enviar.emailer({
                from: 'AreaAzul <cadastro@areaazul.org>',
                to: pessoaAVerificar.email,
                cc: 'cadastro@areaazul.org',
                subject: 'AreaAzul nova senha ',
                html: `
<p>Por favor ${pessoa.get('nome')} clique no link abaixo para alterar 
sua senha.</p>
<a href="https://demo.areaazul.org/${_uuid}">Trocar Senha</a>`
              });
              then(pessoa);
            },
            function() {
              throw new Error('Erro !!!');
            });

        } else {
          throw new Error('Email não existe!!!');
        }
      })
      .catch(function(err) {
        fail(err);
      });
  }
});
Bookshelf.model('Pessoa', Pessoa);

module.exports = Pessoa;
