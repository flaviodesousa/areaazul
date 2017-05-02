'use strict';

const _ = require('lodash');
const Bookshelf = require('../database');
const moment = require('moment');
const Promise = require('bluebird');

const AreaAzul = require('../areaazul');
const log = require('../logging');
const AreaazulUtils = require('areaazul-utils');

const Veiculo = Bookshelf.model('Veiculo');
const UsuarioFiscal = Bookshelf.model('UsuarioFiscal');
const Configuracao = Bookshelf.model('Configuracao');

const Fiscalizacao = Bookshelf.Model.extend({
  tableName: 'fiscalizacao',
  veiculo: function() {
    return this.belongsTo('Veiculo');
  },
  usuarioFiscal: function() {
    return this.belongsTo('UsuarioFiscal');
  }
}, {


  _listar: (options) => Configuracao
    ._buscar(options)
    .then(configuracao => {
      let apos = moment()
        .utc()
        .subtract(configuracao.get('ciclo_fiscalizacao_minutos'), 'minutes')
        .toDate();
      return Fiscalizacao
        .query(function(qb) {
          qb.where('timestamp', '>', apos)
            .orderBy('timestamp', 'desc');
        })
        .fetchAll({
          withRelated: [
            'veiculo.cidade.estado',
            'usuarioFiscal.pessoaFisica.pessoa' ]
        });
    }),


  _listarAtivas: (minutos, options) =>
    Fiscalizacao
      .query(function(qb) {
        qb.where('timestamp', '>=',
          moment()
            .utc()
            .subtract(minutos, 'minutes')
            .calendar())
          .orderBy('timestamp', 'desc');
      })
      .fetchAll(
        _.merge({
          withRelated: [
            'veiculo.cidade.estado',
            'usuarioFiscal.pessoaFisica.pessoa' ]
        }, options)),


  _camposValidos: (camFis, options) => {
    let messages = [];
    const placa = AreaazulUtils.placaSemMascara(camFis.placa);

    if (!AreaazulUtils.isPlaca(placa)) {
      messages.push({
        attribute: 'placa',
        problem: 'Placa inválida'
      });
    }
    if (!camFis.usuario_fiscal_id || isNaN(camFis.usuario_fiscal_id)) {
      messages.push({
        attribute: 'usuario_fiscal_id',
        problem: 'Id de usuário fiscal inválido'
      });
    } else {
      return UsuarioFiscal
        ._buscarPorId(camFis.usuario_fiscal_id, options)
        .catch(AreaAzul.BusinessException, () => {
          messages.push({
            attribute: 'usuario_fiscal_id',
            problem: 'Não há fiscal com este ID'
          });
        })
        .then(() => messages);
    }

    return Promise.resolve(messages);
  },


  _cadastrar: (camposFiscalizacao, options) => {
    const placa = AreaazulUtils.placaSemMascara(camposFiscalizacao.placa);
    let veiculoId;
    return Fiscalizacao
      ._camposValidos(camposFiscalizacao, options)
      .then(messages => {
        if (messages && messages.length) {
          const be = new AreaAzul.BusinessException(
            'Dados de fiscalização inválidos.', messages);
          log.warn(be.message, be.details);
          throw be;
        }
      })
      .then(() =>
        Veiculo
          ._buscarPorPlaca(placa, options))
      .then(v => {
        if (v) {
          veiculoId = v.id;
        }
      })
      .then(() =>
        new Fiscalizacao({
          placa: placa,
          veiculo_id: veiculoId,
          latitude: camposFiscalizacao.latitude,
          longitude: camposFiscalizacao.longitude,
          timestamp: moment()
            .utc(),
          usuario_fiscal_id: camposFiscalizacao.usuario_fiscal_id
        })
          .save(null, options));
  }


});
Bookshelf.model('Fiscalizacao', Fiscalizacao);

const Fiscalizacoes = Bookshelf.Collection.extend({
  model: Fiscalizacao
}, {});
Bookshelf.collection('Fiscalizacoes', Fiscalizacoes);
