'use strict';

var _ = require('lodash');
var util = require('../../helpers/util');
var AreaAzul = require('../../areaazul');
var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require('./pessoa').Pessoa;
var PessoaFisica = require('./pessoa_fisica').PessoaFisica;
var Conta = require('./conta');

var UsuarioFiscal = Bookshelf.Model.extend({
  tableName: 'usuario_fiscal',
  pessoaFisica: function() {
    return this.hasOne('PessoaFisica', 'id');
  },
  fiscalizacoes: function() {
    return this.hasMany('Fiscalizacao', 'fiscal_id');
  },
  desativar: function(tax, then, fail) {
    util.log('Tax: ' + tax);
    var pessoa = new Pessoa.Pessoa({
      id_pessoa: tax.pessoa_id,
      ativo: false
    });
    var pessoaFisica = new PessoaFisica.PessoaFisica({
      id_pessoa_fisica: tax.id_pessoa_fisica,
      ativo: false
    });
    var usuarioFiscal = new UsuarioFiscal({
      pessoa_id: tax.pessoa_id,
      ativo: false
    });

    Pessoa.sixUpdateTransaction(pessoa, usuarioFiscal, pessoaFisica,
      function(model) {
        then(model);
      }, function(err) {
        fail(err);
      });
  }
}, {
  _cadastrar: function(fiscalFields, options) {
    var Fiscal = this;
    var pessoaFisica = null;

    var senha;
    if (!fiscalFields.senha) {
      senha = util.criptografa(util.generate());
    } else {
      senha = util.criptografa(fiscalFields.senha);
    }

    var optionsInsert = _.merge({ method: 'insert' }, options);
    // Verifica se a pessoa fisica ja' existe
    return PessoaFisica
      .forge({cpf: fiscalFields.cpf})
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
      })
      .then(function cadastrarConta() {
        return Conta._cadastrar(null, options);
      })
      .then(function salvarFiscal(conta) {
        return new Fiscal({
            login: fiscalFields.login,
            senha: senha,
            primeiro_acesso: true,
            ativo: true,
            pessoa_id: pessoaFisica.get('pessoa_id'),
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
    var UsuarioFiscal = this;
    var err;
    return UsuarioFiscal
      .forge({login: login})
      .fetch()
      .then(function(usuarioFiscal) {
        if (usuarioFiscal === null) {
          err = new AreaAzul.BusinessException(
            'Usuario: login invalido', { login: login });
          err.authentication_event = true;
          throw err;
        }
        if (util.senhaValida(senha, usuarioFiscal.get('senha'))) {
          return usuarioFiscal;
        }
        err = new AreaAzul.BusinessException(
          'Usuario: senha incorreta', {
            login: login,
            usuario_fiscal: usuarioFiscal
          });
        err.authentication_event = true;
        throw err;
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
  }
});
Bookshelf.model('UsuarioFiscal', UsuarioFiscal);

module.exports = UsuarioFiscal;
