'use strict';

const _ = require('lodash');

const Bookshelf = require('../database');

const UsuarioHasVeiculo = Bookshelf.Model.extend(
  {
    tableName: 'usuario_has_veiculo',
    veiculo: function() {
      return this.belongsTo('Veiculo', 'veiculo_id');
    },
    usuario: function() {
      return this.belongsTo('Usuario', 'usuario_id');
    }
  }, {
    _salvar: function(usuarioHasVeiculo, options) {

      const optionsInsert = _.merge({ method: 'insert' }, options || {});
      const optionsUpdate = _.merge({ method: 'update', patch: true },
                                  options || {});

      return new UsuarioHasVeiculo(
        {
          usuario_id: usuarioHasVeiculo.usuario_id,
          veiculo_id: usuarioHasVeiculo.veiculo_id
        })
        .fetch(options)
        .then(
          function(usuariohasveiculo) {
            if (!usuariohasveiculo) {
              return new UsuarioHasVeiculo(
                {
                  usuario_id: usuarioHasVeiculo.usuario_id,
                  veiculo_id: usuarioHasVeiculo.veiculo_id,
                  ultima_ativacao: new Date()
                })
                .save(null, optionsInsert);
            }
            return usuariohasveiculo
              .save({ ultima_ativacao: new Date() }, optionsUpdate);
          });
    }
  });
Bookshelf.model('UsuarioHasVeiculo', UsuarioHasVeiculo);

const UsuariosHaveVeiculos = Bookshelf.Collection.extend({
  model: UsuarioHasVeiculo
}, {
});
Bookshelf.collection('UsuariosHaveVeiculos', UsuariosHaveVeiculos);
