'use strict';

var Bookshelf = require('bookshelf').conexaoMain;
var _ = require('lodash');



var UsuarioHasVeiculo =  Bookshelf.Model.extend({
  tableName: 'usuario_has_veiculo',
  // Coluna id intruduzida por bug no Bookshelf
  idAttribute: 'id_usuario_has_veiculo',
  veiculo: function() {
    return this.belongsTo(require('./veiculo'), 'veiculo_id');
  },
  usuario: function() {
    return this.belongsTo(require('./usuario'), 'usuario_pessoa_id');
  },
}, {

	cadastrar: function(usuario_has_veiculo){
	    return Bookshelf.transaction(function(t) {
	      return UsuarioHasVeiculo
	        ._salvar(usuario_has_veiculo, { transacting: t });
	    });
	},


	_salvar: function(usuario_has_veiculo){

		var optionsInsert = _.merge({}, options || {}, {method: 'insert'}),
        	optionsUpdate = _.merge({}, options || {}, {method: 'update'}, {patch: true });

        return UsuarioHasVeiculo
		       .forge({
		            usuario_pessoa_id: usuario_has_veiculo.usuario_pessoa_id,
		            veiculo_id: usuario_has_veiculo.veiculo_id,
		        })
		        .fetch()
		        .then(function(usuariohasveiculo) {
		           if (usuariohasveiculo === null) {
		                return UsuarioHasVeiculo
		                    .forge({
		                        usuario_pessoa_id: activation.usuario_pessoa_id,
		                        veiculo_id: activation.veiculo_id,
		                        ultima_ativacao: new Date(),
		                    })
		                    .save(null, optionsInsert);
		            } else {
		                return usuariohasveiculo
		                    .save({
		                        ultima_ativacao: new Date(),
		                    }, optionsUpdate);
		            }
   		});
    }
});

module.exports = UsuarioHasVeiculo;
