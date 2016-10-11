var bcrypt = require('bcrypt-then');

const AreaAzul = require('../areaazul');
const Bookshelf = require('../database');
const log = require('../logging');

const UsuarioRevendedor = Bookshelf.model('UsuarioRevendedor');
const UsuariosRevendedores = Bookshelf.collection('UsuariosRevendedores');

module.export.listarUsuarioRevenda = function(idRevendedor) {
  return new UsuariosRevendedores()
    .query({ where: { revendedor_id: idRevendedor } })
    .fetch({ withRelated: [
      'revendedor', 'pessoaFisica', 'pessoaFisica.pessoa' ] });
};
module.export.autorizado = function(login, senha) {
  var usuarioRevendedor;
  return new UsuarioRevendedor({ login: login })
    .fetch({
      require: true,
      withRelated: [
        'revendedor', 'pessoaFisica', 'pessoaFisica.pessoa' ] })
    .catch(Bookshelf.NotFoundError, () => {
      const err = new AreaAzul.AuthenticationError(
        'Usuário revendedor: login inválido', {
          login: login
        });
      log.warn(err.message, err.details);
      throw err;
    })
    .then(function(ur) {
      usuarioRevendedor = ur;
      return bcrypt.compare(senha, ur.get('senha'));
    })
    .then(function(valid) {
      if (valid) {
        return usuarioRevendedor;
      }
      const err = new AreaAzul.AuthenticationError(
        'Usuário revendedor: senha incorreta', {
          login: login,
          usuario: usuarioRevendedor
        });
      log.warn(err.message, err.details);
      throw err;
    });
};
module.export.inserir = function(entidade) {
  return Bookshelf.transaction(function(t) {
    return UsuarioRevendedor._salvarUsuarioRevenda(
      entidade, null, { transacting: t });
  });
};
module.export.alterar = function(entidade) {
  return Bookshelf.transaction(function(t) {
    const options = { transacting: t };
    return new UsuarioRevendedor({
      revendedor_id: entidade.revendedor_id, login: entidade.login
    })
      .fetch(options)
      .then(function(usuarioRevendedor) {
        return UsuarioRevendedor
          ._salvarUsuarioRevenda(entidade, usuarioRevendedor, options);
      });
  });
};
module.export.procurar = function(id, func) {
  UsuarioRevendedor.forge()
    .query(function(qb) {
      qb
        .distinct()
        .innerJoin('pessoa_fisica', 'pessoa_fisica.id',
          'usuario_revendedor.pessoa_fisica_id')
        .innerJoin('pessoa', 'pessoa.id', 'pessoa_fisica.id')
        .where('usuario_revendedor.id', id)
        .select('pessoa_fisica.*')
        .select('pessoa.*')
        .select('usuario_revendedor.*');
    }).fetch().then(function(model) {
    func(model);
  });
};

module.export.desativar = function(id) {
  return UsuarioRevendedor
    .forge({
      id: id
    })
    .fetch()
    .then(function(revenda) {
      if (!revenda) {
        throw new AreaAzul.BusinessException(
          'Desativação de usuário revendedor: Usuário não encontrado',
          { id: id });
      }
      return revenda
        .save({ ativo: false }, { patch: true });
    });
};
module.export.buscarPorId = function(id) {
  return new UsuarioRevendedor({ id: id })
    .fetch({ require: true })
    .catch(Bookshelf.NotFoundError, () => {
      const err = new AreaAzul.BusinessException(
        'Usuário revendedor: id não encontrado', {
          id: id
        });
      log.warn(err.message, err.details);
      throw err;
    });
};
module.export.procurarLogin = function(login) {
  return this._procurarLogin(login, null);
};
