'use strict';

var _ = require('lodash');

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;

var UsuarioHasVeiculo = Bookshelf.Model.extend(
  {
    tableName: 'usuario_has_veiculo',
    veiculo: function() {
      return this.belongsTo('Veiculo', 'veiculo_id');
    },
    usuario: function() {
      return this.belongsTo('Usuario', 'usuario_id');
    }
  }, {

    cadastrar: function(usuarioHasVeiculo) {
      return Bookshelf.transaction(
        function(t) {
          return UsuarioHasVeiculo
            ._salvar(usuarioHasVeiculo, { transacting: t });
        });
    },


    _salvar: function(usuarioHasVeiculo, options) {

      var optionsInsert = _.merge({ method: 'insert' }, options || {});
      var optionsUpdate = _.merge({ method: 'update', patch: true },
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

module.exports = UsuarioHasVeiculo;
