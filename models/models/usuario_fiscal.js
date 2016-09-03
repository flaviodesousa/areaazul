'use strict';

const _ = require('lodash');
const bcrypt = require('bcrypt-then');

const AreaAzul = require('../../areaazul');
const log = AreaAzul.log;
const Bookshelf = AreaAzul.db;
var util = require('../../helpers/util');

const Pessoa = Bookshelf.model('Pessoa');
const PessoaFisica = Bookshelf.model('PessoaFisica');
const Conta = Bookshelf.model('Conta');

var UsuarioFiscal = Bookshelf.Model.extend({
  tableName: 'usuario_fiscal',
  pessoaFisica: function() {
    return this.hasOne('PessoaFisica', 'id');
  },
  fiscalizacoes: function() {
    return this.hasMany('Fiscalizacao', 'fiscal_id');
  },
  _desativar: function(usuarioFiscal, options) {
    return usuarioFiscal
      .save({ ativo: false }, _.merge({ patch: true }, options));
  },
  desativar: function(usuarioFiscal) {
    return Bookshelf.transaction(function(t) {
      return UsuarioFiscal
        ._desativar(usuarioFiscal, { transacting: true });
    });
  }
}, {
  _cadastrar: function(fiscalFields, options) {
    var Fiscal = this;
    var pessoaFisica = null;
    var senha;

    var optionsInsert = _.merge({ method: 'insert' }, options);
    // Verifica se a pessoa fisica ja' existe
    return new PessoaFisica({cpf: fiscalFields.cpf})
      .fetch(options)
      .then(function pessoaFisicaExiste(pessoaFisica) {
        // Se pessoa fisica ja' existir, conectar a ela
        if (pessoaFisica !== null) {
          return pessoaFisica;
        }
        // Caso nao exista, criar a pessoa fisica
        return PessoaFisica
          ._cadastrar(fiscalFields, options);
      })
      .then(function salvarPessoaFisica(pf) {
        pessoaFisica = pf;
        return bcrypt.hash(fiscalFields.senha);
      })
      .then(function cadastrarConta(hash) {
        senha = hash;
        return Conta._cadastrar(null, options);
      })
      .then(function salvarFiscal(conta) {
        return new Fiscal({
            login: fiscalFields.login,
            senha: senha,
            primeiro_acesso: true,
            ativo: true,
            id: pessoaFisica.id,
            conta_id: conta.id
          })
          .save(null, optionsInsert);
      });
  },
  cadastrar: function(fiscalFields) {
    var UsuarioFiscal = this;
    return Bookshelf.transaction(function transacao(t) {
      return UsuarioFiscal._cadastrar(fiscalFields, { transacting: t });
    });
  },
  autorizado: function(login, senha) {
    var usuarioFiscal;
    var err;
    return UsuarioFiscal
      .forge({login: login})
      .fetch()
      .then(function(uf) {
        if (!uf) {
          err = new AreaAzul.AuthenticationError(
            'Usuario: login invalido', { login: login });
          throw err;
        }
        usuarioFiscal = uf;
        return bcrypt.compare(senha, usuarioFiscal.get('senha'));
      })
      .then(function(valid) {
        if (valid) {
          return usuarioFiscal;
        }
        err = new AreaAzul.AuthenticationError(
          'Usuario: senha incorreta', {
            login: login,
            usuario_fiscal: usuarioFiscal
          });
        throw err;
      });
  },
  procurar: function(usuarioFiscal, then, fail) {
    UsuarioFiscal.forge().query(function(qb) {
      qb.join('pessoa', 'pessoa.id', 'usuario_fiscal.id')
        .join('pessoa_fisica',
          'pessoa_fisica.id', 'pessoa.id')
        .where('usuario_fiscal.id', usuarioFiscal.id)
        .where('usuario_fiscal.ativo', '=', 'true')
        .select('usuario_fiscal.*', 'pessoa.*', 'pessoa_fisica.*');
    }).fetch().then(function(model) {
      then(model);
    }).catch(function(err) {
      fail(err);
    });
  }
});
Bookshelf.model('UsuarioFiscal', UsuarioFiscal);

module.exports = UsuarioFiscal;
