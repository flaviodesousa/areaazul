'use strict';

var debug = require('debug')('areaazul:model:ativacao');
var validator = require('validator');
var moment = require('moment');
var _ = require('lodash');

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
const log = AreaAzul.log;
var util = require('../../helpers/util');
const UsuarioHasVeiculo = Bookshelf.model('UsuarioHasVeiculo');
const MovimentacaoConta = Bookshelf.model('MovimentacaoConta');
const Conta = Bookshelf.model('Conta');
const Veiculo = Bookshelf.model('Veiculo');
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
        pessoa_fisica_id: activation.pessoa_fisica_id,
        veiculo_id: activation.veiculo_id,
        ativo: true
      })
      .save(null, optionsInsert)
      .then(function(a) {
        ativacao = a;
        return UsuarioHasVeiculo
          .forge({
            usuario_id: activation.usuario_id,
            veiculo_id: activation.veiculo_id
          })
          .fetch(options)
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
            return MovimentacaoConta
              ._inserirDebito({
                historico: 'ativacao',
                tipo: 'ativacao',
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
        pessoa_fisica_id: desativacao.pessoa_fisica_id
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
    log.info('desativar', desativacao);
    return Bookshelf.transaction(function(t) {
      var options = { transacting: t };
      return Ativacao._desativar(desativacao, options);
    });
  },
  _ativarPelaRevenda: function(ativacao, options) {
    var optionsInsert = _.merge({ method: 'insert' }, options);
    var placaSemMascara = '';
    if (ativacao.placa) {
      placaSemMascara = util.placaSemMascara(ativacao.placa);
    }
    return Ativacao
      ._validarAtivacao(ativacao, placaSemMascara, options)
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
        return new Ativacao({
            data_ativacao: new Date(),
            pessoa_fisica_id: ativacao.pessoa_fisica_id,
            veiculo_id: v.id,
            ativo: true
          })
          .save(null, optionsInsert)
          .then(function() {
            return new UsuarioRevendedor({
                id: ativacao.pessoa_fisica_id
              })
              .fetch(options);
          })
          .then(function(usuario) {
            return MovimentacaoConta
              ._inserirDebito({
                historico: 'ativacao-revenda usuario='
                  + usuario.id + '/revenda=' + usuario.revendedor_id,
                tipo: 'ativacao',
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

  validarAtivacao: function(ativacao, placa) {
    return Ativacao._validarAtivacao(ativacao, placa, {});
  },

  _verificaSaldo: function(id, options) {
    return Conta
      .query(function(qb) {
        qb
          .innerJoin('revendedor', 'revendedor.conta_id', 'conta.id')
          .innerJoin('pessoa', 'pessoa.id', 'revendedor.id')
          .innerJoin('usuario_revendedor',
            'usuario_revendedor.revendedor_id', 'revendedor.id')
          .where('usuario_revendedor.id', id)
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
Bookshelf.model('Ativacao', Ativacao);

module.exports = Ativacao;
