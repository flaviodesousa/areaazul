'use strict';

var debug = require('debug')('areaazul:model:ativacao');
var validator = require('validator');
var moment = require('moment');
var _ = require('lodash');
var AreaAzul = require('../../areaazul');
var log = AreaAzul.log;
var util = require('../../helpers/util');
var Bookshelf = require('bookshelf').conexaoMain;
var UsuarioHasVeiculo = require('./usuario_has_veiculo');
var MovimentacaoConta = require('./movimentacaoconta');
var Conta = require('./conta');
var Veiculo = require('./veiculo');
var UsuarioRevendedor = require('./usuario_revendedor');


var Ativacao = Bookshelf.Model.extend({
  tableName: 'ativacao',
  idAttribute: 'id_ativacao'
}, {
  _ativar: function(activation, options) {
    var optionsInsert = _.merge({}, options, {method: 'insert'});
    var optionsUpdate = _.merge({}, options, {method: 'update', patch: true });
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

    return Ativacao
      .forge({
        data_ativacao: new Date(),
        latitude: latitude,
        longitude: longitude,
        altitude: altitude,
        pessoa_id: activation.usuario_pessoa_id,
        veiculo_id: activation.veiculo_id,
        ativo: true
      })
      .save(null, optionsInsert)
      .then(function(a) {
        ativacao = a;
        return UsuarioHasVeiculo
          .forge({
            usuario_pessoa_id: activation.usuario_pessoa_id,
            veiculo_id: activation.veiculo_id
          })
          .fetch()
          .then(function(usuariohasveiculo) {
            if (usuariohasveiculo === null) {
              return UsuarioHasVeiculo
                .forge({
                  usuario_pessoa_id: activation.usuario_pessoa_id,
                  veiculo_id: activation.veiculo_id,
                  ultima_ativacao: new Date()
                })
                .save(null, optionsInsert);
            }
            return usuariohasveiculo
              .save({ ultima_ativacao: new Date() }, optionsUpdate);
          })
          .then(function() {
            return MovimentacaoConta
              ._inserirDebito({
                historico: 'ativacao',
                tipo: 'ativacao',
                pessoa_id: activation.usuario_pessoa_id,
                valor: activation.valor
              }, options);
          });
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
    var optionsPath = _.merge({}, options, { patch: true });
    return Ativacao
      .forge({
        id_ativacao: desativacao.id_ativacao,
        pessoa_id: desativacao.usuario_pessoa_id
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
        return d;
      })
      .then(function(d) {
        return d
          .save({ data_desativacao: new Date() }, optionsPath);
      })
      .then(function(ativacaoExistente) {
        log.info('Desativacao: sucesso', { desativacao: ativacaoExistente });
        return ativacaoExistente;
      });
  },
  desativar: function(desativacao) {
    log.info('desativar()', desativacao);
    return Bookshelf.transaction(function(t) {
      var options = { transacting: t };
      return Ativacao._desativar(desativacao, options);
    });
  },
  _ativarPelaRevenda: function(ativacao, options) {
    var optionsInsert = _.merge({}, options, { method: 'insert' });
    var placaSemMascara = '';
    if (ativacao.placa) {
      placaSemMascara = util.placaSemMascara(ativacao.placa);
    }
    return Ativacao
      .validarAtivacao(ativacao, placaSemMascara)
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
          .fetch();
      })
      .then(function(veiculo) {
        if (veiculo) {
          debug('ativarPelaRevenda() veiculo existe #' + veiculo.id);
          return veiculo;
        }
        debug('ativarPelaRevenda() veiculo nao existe, cadastrando');
        return Veiculo.cadastrar({
          placa: placaSemMascara,
          marca: ativacao.marca,
          cor: ativacao.cor,
          modelo: ativacao.modelo,
          cidade_id: ativacao.cidade
        }, options);
      })
      .then(function(v) {
        debug('ativarPelaRevenda() ativando veiculo #' + v.id);
        return Ativacao
          .forge({
            data_ativacao: new Date(),
            pessoa_id: ativacao.usuario_pessoa_id,
            veiculo_id: v.id,
            ativo: true
          })
          .save(null, optionsInsert)
          .then(function(a) {
            return UsuarioRevendedor
              .forge({
                pessoa_id: a.get('pessoa_id')
              })
              .fetch();
          })
          .then(function(usuario) {
            return MovimentacaoConta
              ._inserirDebito({
                historico: 'ativacao',
                tipo: 'ativacao',
                pessoa_id: usuario.get('revendedor_id'),
                valor: 10.00
              }, options);
          });
      });
  },
  ativarPelaRevenda: function(ativacao) {
    log.info('ativarPelaRevenda()', ativacao);
    return Bookshelf.transaction(function(t) {
      return Ativacao._ativarPelaRevenda(ativacao, { transacting: t });
    });
  },
  _validarAtivacao: function(ativacao, placa, options) {
    var message = [];

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
      })
      .then(function() {
        return Ativacao
          ._verificaSaldo(ativacao.usuario_pessoa_id, options)
          .then(function(conta) {
            if (!conta || conta.get('saldo') < ativacao.valor) {
              message.push({
                attribute: 'saldo',
                problem: 'Usuário não possui saldo em conta!'
              });
            }
            return message;
          });
      });
  },

  validarAtivacao: function(ativacao, placa) {
    return Ativacao._validarAtivacao(ativacao, placa, {});
  },

  _verificaSaldo: function(id, options) {
    return Conta
      .forge()
      .query(function(qb) {
        qb
          .innerJoin('pessoa', 'pessoa.id_pessoa', 'revendedor.pessoa_id')
          .innerJoin('revendedor', 'revendedor.conta_id', 'conta.id_conta')
          .innerJoin('usuario_revendedor',
            'usuario_revendedor.revendedor_id', 'revendedor.pessoa_id')
          .where('usuario_revendedor.pessoa_id', id)
          .select('pessoa.*')
          .select('conta.*')
          .select('revendedor.*')
          .select('usuario_revendedor.*');
      })
      .fetch(options);
  },
  _verificaAtivacao: function(placa, options) {
    return Ativacao
      .forge()
      .query(function(qb) {
        qb
          .innerJoin('veiculo', 'veiculo.id_veiculo', 'ativacao.veiculo_id')
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

module.exports = Ativacao;
