'use strict';

var debug = require('debug')('areaazul:model:ativacao');
var validator = require('validator');
var moment = require('moment');
var _ = require('lodash');

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
const log = AreaAzul.log;
var util = require('../../helpers/util');
const Usuario = Bookshelf.model('Usuario');
const UsuarioHasVeiculo = Bookshelf.model('UsuarioHasVeiculo');
const MovimentacaoConta = Bookshelf.model('MovimentacaoConta');
const Conta = Bookshelf.model('Conta');
const Veiculo = Bookshelf.model('Veiculo');
const Revendedor = Bookshelf.model('Revendedor');
const UsuarioRevendedor = Bookshelf.model('UsuarioRevendedor');


var Ativacao = Bookshelf.Model.extend({
  tableName: 'ativacao'
}, {
  _ativar: function(activation, options) {
    var optionsInsert = _.merge({ method: 'insert' }, options);
    var optionsUpdate = _.merge({ method: 'update', patch: true }, options);
    var ativacao = null;

    var latitude = activation.latitude;
    var altitude = activation.longitude;
    var longitude = activation.altitude;

    if (!validator.isNumeric('' + latitude)) {
      latitude = null;
    }
    if (!validator.isNumeric('' + longitude)) {
      longitude = null;
    }
    if (!validator.isNumeric('' + altitude)) {
      altitude = null;
    }

    return new Ativacao({
        data_ativacao: new Date(),
        latitude: latitude,
        longitude: longitude,
        altitude: altitude,
        veiculo_id: activation.veiculo_id
      })
      .save(null, optionsInsert)
      .then(function(a) {
        ativacao = a;
        return new AtivacaoUsuario({
            ativacao_id: ativacao.id,
            usuario_id: activation.usuario_id
          })
          .save(null, optionsInsert);
      })
      .then(function() {
        return UsuarioHasVeiculo
          .forge({
            usuario_id: activation.usuario_id,
            veiculo_id: activation.veiculo_id
          })
          .fetch(options);
      })
      .then(function(usuariohasveiculo) {
        if (!usuariohasveiculo) {
          return UsuarioHasVeiculo
            .forge({
              usuario_id: activation.usuario_id,
              veiculo_id: activation.veiculo_id,
              ultima_ativacao: new Date()
            })
            .save(null, optionsInsert);
        }
        return usuariohasveiculo
          .save({ ultima_ativacao: new Date() }, optionsUpdate);
      })
      .then(function() {
        return new Usuario({ id: activation.usuario_id })
          .fetch();
      })
      .then(function(usuario) {
        return MovimentacaoConta
          ._inserirDebito({
            historico: 'ativacao',
            tipo: 'ativacao',
            valor: activation.valor,
            conta_id: usuario.get('conta_id')
          }, options);
      })
      .then(function() {
        return ativacao;
      });
  },
  ativar: function(activation) {
    log.info('ativar', { ativacao: activation });

    return Bookshelf.transaction(function(t) {
      var options = { transacting: t };
      return Ativacao._ativar(activation, options);
    });
  },

  _desativar: function(desativacao, options) {
    var optionsPatch = _.merge({ patch: true }, options);
    return new AtivacaoUsuario({
        ativacao_id: desativacao.ativacao_id,
        usuario_id: desativacao.usuario_id
      })
      .fetch(options)
      .then(function(d) {
        if (!d) {
          var err = new AreaAzul.BusinessException(
            'Desativacao: Ativacao nao reconhecida',
            { desativacao: desativacao });
          log.error(err.message, err.details);
          throw err;
        }
        return new Ativacao({ id: desativacao.ativacao_id })
          .fetch(options)
      })
      .then(function(d) {
        return d
          .save({ data_desativacao: new Date() }, optionsPatch);
      })
      .then(function(ativacaoExistente) {
        log.info('Desativacao: sucesso', { desativacao: ativacaoExistente });
        return ativacaoExistente;
      });
  },
  desativar: function(desativacao) {
    log.info('desativar', desativacao);
    return Bookshelf.transaction(function(t) {
      var options = { transacting: t };
      return Ativacao._desativar(desativacao, options);
    });
  },
  _ativarPelaRevenda: function(ativacao, options) {
    var optionsInsert = _.merge({ method: 'insert' }, options);
    var usuario = null;
    var placaSemMascara = '';
    if (ativacao.placa) {
      placaSemMascara = util.placaSemMascara(ativacao.placa);
    }
    return Ativacao
      ._validarAtivacaoRevenda(ativacao, placaSemMascara, options)
      .then(function(messages) {
        if (messages.length) {
          debug('ativarPelaRevenda() ativacao invalida');
          throw new AreaAzul
            .BusinessException(
            'Nao foi possivel ativar veículo. Dados invalidos',
            messages);
        }
        debug('ativarPelaRevenda() ativacao valida');

        return messages;
      })
      .then(function() {
        debug('ativarPelaRevenda() buscando veiculo com placa ' +
          placaSemMascara);
        return Veiculo
          .forge({placa: placaSemMascara})
          .fetch(options);
      })
      .then(function(veiculo) {
        if (veiculo) {
          debug('ativarPelaRevenda() veiculo existe #' + veiculo.id);
          return veiculo;
        }
        debug('ativarPelaRevenda() veiculo nao existe, cadastrando');
        return Veiculo._cadastrar({
          placa: placaSemMascara,
          marca: ativacao.marca,
          cor: ativacao.cor,
          modelo: ativacao.modelo,
          cidade_id: ativacao.cidade
        }, options);
      })
      .then(function(v) {
        debug('ativarPelaRevenda() ativando veiculo #' + v.id);
        return new Ativacao({
            data_ativacao: new Date(),
            veiculo_id: v.id
          })
          .save(null, optionsInsert);
      })
      .then(function() {
        return new UsuarioRevendedor({
            id: ativacao.usuario_revendedor_id
          })
          .fetch(options);
      })
      .then(function(u) {
        usuario = u;
        return new Revendedor({ id: usuario.get('revendedor_id') })
          .fetch(options);
      })
      .then(function(revendedor) {
        return MovimentacaoConta
          ._inserirDebito({
            conta_id: revendedor.get('conta_id'),
            historico: 'ativacao-revenda usuario='
              + usuario.id + '/revenda=' + revendedor.id,
            tipo: 'ativacao',
            valor: 10.00
          }, options);
      });
  },
  ativarPelaRevenda: function(ativacao) {
    log.info('ativarPelaRevenda()', ativacao);
    return Bookshelf.transaction(function(t) {
      return Ativacao._ativarPelaRevenda(ativacao, { transacting: t });
    });
  },
  __validarAtivacao: function(message, ativacao, placa, options) {
    if (validator.isNull('' + ativacao.marca)) {
      message.push({
        attribute: 'marca',
        problem: 'Marca é obrigatória!'
      });
    }
    if (validator.isNull('' + ativacao.modelo)) {
      message.push({
        attribute: 'modelo',
        problem: 'Modelo é obrigatório!'
      });
    }
    if (validator.isNull('' + ativacao.cor)) {
      message.push({
        attribute: 'cor',
        problem: 'Cor é obrigatória!'
      });
    }
    if (validator.isNull('' + ativacao.tempo)) {
      message.push({
        attribute: 'tempo',
        problem: 'Tempo é obrigatório!'
      });
    }
    if (!validator.isNumeric('' + ativacao.tempo)) {
      message.push({
        attribute: 'tempo',
        problem: 'Tempo deve ser um número'
      });
    }
    return Ativacao
      ._verificaAtivacao(placa, options)
      .then(function(ativado) {
        if (ativado) {
          message.push({
            attribute: 'ativado',
            problem: 'AreaAzul já ativada para este veículo!'
          });
        }
        return message;
      });
  },
  _validarAtivacao: function(ativacao, placa, options) {
    var message = [];
    return this
      ._validarAtivacao(message, ativacao, placa, options)
      .then(function() {
        return Ativacao
          ._verificaSaldo(ativacao.usuario_pessoa_id, options);
      })
      .then(function(conta) {
        if (!conta || conta.get('saldo') < ativacao.valor) {
          message.push({
            attribute: 'saldo',
            problem: 'Usuário não possui saldo em conta!'
          });
        }
        return message;
      });
  },
  _validarAtivacaoRevenda: function(ativacao, placa, options) {
    var message = [];
    return this
      .__validarAtivacao(message, ativacao, placa, options)
      .then(function() {
        return Ativacao
          ._verificaSaldoRevendedor(ativacao.usuario_revendedor_id, options);
      })
      .then(function(conta) {
        if (!conta || conta.get('saldo') < ativacao.valor) {
          message.push({
            attribute: 'valor',
            problem: 'Revenda não possui saldo suficiente em conta!'
          });
        }
        return message;
      });
  },
  _verificaSaldoRevendedor: function(idUsuarioRevendedor, options) {
    return Conta
      .query(function(qb) {
        qb
          .innerJoin('revendedor', 'revendedor.conta_id', 'conta.id')
          .innerJoin('usuario_revendedor',
            'usuario_revendedor.revendedor_id', 'revendedor.id')
          .where('usuario_revendedor.id', idUsuarioRevendedor)
          .select('conta.*')
          .select('revendedor.*')
          .select('usuario_revendedor.*');
      })
      .fetch(options);
  },
  _verificaSaldo: function(idUsuario, options) {
    return Conta
      .query(function(qb) {
        qb
          .innerJoin('usuario', 'usuario.conta_id', 'conta.id')
          .where('usuario.id', idUsuario)
          .select('conta.*')
          .select('usuario_revendedor.*');
      })
      .fetch(options);
  },
  _verificaAtivacao: function(placa, options) {
    return Ativacao
      .forge()
      .query(function(qb) {
        qb
          .innerJoin('veiculo', 'veiculo.id', 'ativacao.veiculo_id')
          .whereNull('ativacao.data_desativacao')
          .andWhere('ativacao.data_ativacao', '>=',
            moment().subtract(60, 'minutes').calendar())
          .andWhere('veiculo.placa', '=', placa)
          .select('ativacao.*')
          .select('veiculo.*');
      })
      .fetch(options);
  }

});
Bookshelf.model('Ativacao', Ativacao);

const AtivacaoUsuario = Bookshelf.Model.extend({
  tableName: 'ativacao_usuario',
  idAttribute: ['ativacao_id', 'usuario_id']
});
Bookshelf.model('AtivacaoUsuario', AtivacaoUsuario);

const AtivacaoUsuarioRevendedor = Bookshelf.Model.extend({
  tableName: 'ativacao_usuario_revendedor',
  idAttribute: ['ativacao_id', 'usuario_revendedor_id']
});
Bookshelf.model('AtivacaoUsuarioRevendedor', AtivacaoUsuarioRevendedor);

const AtivacaoUsuarioFiscal = Bookshelf.Model.extend({
  tableName: 'ativacao_usuario_fiscal',
  idAttribute: ['ativacao_id', 'usuario_fiscal_id']
});
Bookshelf.model('AtivacaoUsuarioFiscal', AtivacaoUsuarioFiscal);

module.exports = Ativacao;
