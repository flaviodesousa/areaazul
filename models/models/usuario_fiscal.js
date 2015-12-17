'use strict';

var _ = require('lodash');
var util = require('../../helpers/util');
var AreaAzul = require('../../areaazul');
var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require('./pessoa').Pessoa;
var PessoaFisica = require('./pessoafisica').PessoaFisica;
var Fiscalizacao = require('./fiscalizacao');

var UsuarioFiscal = Bookshelf.Model.extend({
  tableName: 'usuario_fiscal',
  idAttribute: 'pessoa_id',
  pessoaFisica: function() {
    return this.hasOne(PessoaFisica, 'pessoa_id');
  },
  fiscalizacoes: function() {
    return this.hasMany(Fiscalizacao, 'fiscal_id');
  },
  desativar: function(tax, then, fail) {
    util.log('Tax: ' + tax);
    var pessoa = new Pessoa.Pessoa({
      id_pessoa: tax.pessoa_id,
      ativo: false,
    });
    var pessoaFisica = new PessoaFisica.PessoaFisica({
      id_pessoa_fisica: tax.id_pessoa_fisica,
      ativo: false,
    });
    var usuarioFiscal = new UsuarioFiscal({
      pessoa_id: tax.pessoa_id,
      ativo: false,
    });

    Pessoa.sixUpdateTransaction(pessoa, usuarioFiscal, pessoaFisica,
      function(model) {
        then(model);
      }, function(err) {
        fail(err);
      });
  },

}, {
  cadastrar: function(tax) {
    var Fiscal = this;
    var fiscal = null;

    var senha;
    if (!tax.senha) {
      senha = util.criptografa(util.generate());
    } else {
      senha = util.criptografa(tax.senha);
    }

    return Bookshelf.transaction(function(t) {
      var trx = { transacting: t };
      var trxIns = _.merge({}, trx, { method: 'insert' });
      // Verifica se a pessoa fisica ja' existe
      return PessoaFisica
        .forge({cpf: tax.cpf})
        .fetch()
        .then(function(pessoaFisica) {
          // Se pessoa fisica ja' existir, conectar a ela
          if (pessoaFisica !== null) {
            return pessoaFisica;
          }
          // Caso nao exista, criar a pessoa fisica
          return PessoaFisica
            ._cadastrar(tax, trx);
        })
        .then(function(pessoaFisica) {
          return Fiscal
            .forge({
              login: tax.login,
              senha: senha,
              primeiro_acesso: true,
              ativo: true,
              pessoa_id: pessoaFisica.get('pessoa_id'),
            })
            .save(null, trxIns);
        })
        .then(function(f) {
          fiscal = f;
          return f;
        });
    })
      .then(function() {
        return fiscal;
      });
  },
  autorizado: function(login, senha) {
    var UsuarioFiscal = this;
    var err;
    return UsuarioFiscal
      .forge({login: login})
      .fetch()
      .then(function(usuarioFiscal) {
        if (usuarioFiscal === null) {
          err = new AreaAzul.BusinessException(
              'Usuario: login invalido', {
                  login: login
              });
          err.authentication_event = true;
          throw err;
        }
        if (util.senhaValida(senha, usuarioFiscal.get('senha'))) {
          return usuarioFiscal;
        } else {
          err = new AreaAzul.BusinessException(
              'Usuario: senha incorreta', {
                  login: login,
                  usuario_fiscal: usuarioFiscal
              });
          err.authentication_event = true;
          throw err;
        }
      });
  },
  procurar: function(tax, then, fail) {
    UsuarioFiscal.forge().query(function(qb) {
      qb.join('pessoa', 'pessoa.id_pessoa', '=', 'usuario_fiscal.pessoa_id');
      qb.join('pessoa_fisica',
          'pessoa_fisica.pessoa_id', '=', 'pessoa.id_pessoa');
      qb.where('usuario_fiscal.pessoa_id', tax.pessoa_id);
      qb.where('usuario_fiscal.ativo', '=', 'true');
      qb.select('usuario_fiscal.*', 'pessoa.*', 'pessoa_fisica.*');
    }).fetch().then(function(model) {
      then(model);
    }).catch(function(err) {
      fail(err);
    });
  },
});

module.exports = UsuarioFiscal;
