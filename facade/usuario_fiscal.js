const _ = require('lodash');
const bcrypt = require('bcrypt-then');
const AreaAzul = require('../areaazul');
const Bookshelf = require('../database');
const log = require('../logging');

const UsuarioFiscal = Bookshelf.model('UsuarioFiscal');
const PessoaFisica = Bookshelf.model('PessoaFisica');
const Conta = Bookshelf.model('Conta');

module.exports.cadastrar = function(camposUsuarioFiscal) {
  var conta;

  return Bookshelf.transaction(function(t) {
    var options = { transacting: t };
    var optionsInsert = _.merge({ method: 'insert' }, options);
    return UsuarioFiscal
      ._camposValidos(camposUsuarioFiscal, null, options)
      .then(function(messages) {
        if (messages.length) {
          throw new AreaAzul
            .BusinessException(
            'Não foi possível cadastrar novo Usuário Fiscal.'
            + ' Dados inválidos',
            messages);
        }
      })
      .then(function() {
        return new UsuarioFiscal(
          { login: camposUsuarioFiscal.login })
          .fetch(_.merge({ require: true }, options));
      })
      .then(function(u) {
        throw new AreaAzul.BusinessException(
          'Alteração de usuário fiscal: ainda não suportada',
          { usuario: u });
      })
      .catch(Bookshelf.NotFoundError, () => {
        // Novo usuário fiscal
        var pessoaFisica;
        return new PessoaFisica({ cpf: camposUsuarioFiscal.cpf })
          .fetch(_.merge({ require: true }, options))
          .catch(Bookshelf.NotFoundError, () => {
            return PessoaFisica
              ._cadastrar(camposUsuarioFiscal, options);
          })
          .then(function(pf) {
            pessoaFisica = pf;
            return Conta._cadastrar(null, options);
          })
          .then(function(c) {
            conta = c;
            return bcrypt.hash(camposUsuarioFiscal.nova_senha);
          })
          .then(function(hash) {
            return new UsuarioFiscal({
              id: pessoaFisica.id,
              login: camposUsuarioFiscal.login,
              senha: hash,
              conta_id: conta.id,
              ativo: true
            })
              .save(null, optionsInsert);
          })
          .then(usuarioFiscal => {
            return UsuarioFiscal
              ._buscarPorId(usuarioFiscal.id, options);
          })
          .then(usuFis => usuFis.toJSON());
      });
  });
};
module.exports.autentico = function(login, senha) {
  var usuarioFiscal;
  return new UsuarioFiscal({ login: login })
    .fetch()
    .then(function(ur) {
      usuarioFiscal = ur;
      if (!usuarioFiscal) {
        var err = new AreaAzul.AuthenticationError(
          'Usuário fiscal: login inválido',
          { login: login });
        log.warn(err.message, err.details);
        throw err;
      }
      return bcrypt.compare(senha, usuarioFiscal.get('senha'));
    })
    .then(function(valid) {
      if (valid) {
        return UsuarioFiscal
          ._buscarPorId(usuarioFiscal.id, {})
          .then(usuFis => usuFis.toJSON());
      }
      const err = new AreaAzul.AuthenticationError(
        'Usuário fiscal: senha incorreta', {
          login: login,
          usuario: usuarioFiscal
        });
      log.warn(err.message, err.details);
      throw err;
    });
};
module.exports.buscarPorId = function(id) {
  return UsuarioFiscal
    ._buscarPorId(id, null)
    .then(usuFis => usuFis.toJSON());
};
