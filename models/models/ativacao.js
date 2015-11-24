'use strict';

var AreaAzul = require('../../areaazul');
var Promise = require('bluebird');
var log = AreaAzul.log;
var util = require('../../helpers/util');
var validator = require('validator');
var Bookshelf = require('bookshelf').conexaoMain;
var UsuarioHasVeiculo = require('./usuario_has_veiculo');
var MovimentacaoConta = require('./movimentacaoconta');
var Conta = require('./conta');
var Veiculo = require('./veiculo');
var validator = require('validator');
var validation = require('./validation');
var moment = require('moment');

var Ativacao = Bookshelf.Model.extend({
  tableName: 'ativacao',
  idAttribute: 'id_ativacao',

}, {

  ativar: function(activation) {

    var latitude = activation.latitude;
    var altitude = activation.longitude;
    var longitude = activation.altitude;

    if (validator.isNull(latitude)) {
      latitude = null;
    }
    if (validator.isNull(longitude)) {
      longitude = null;
    }
    if (validator.isNull(altitude)) {
      altitude = null;
    }

    return Bookshelf.transaction(function(t) {
      var options = {
        transacting: t,
      };
      var optionsInsert = {
        transacting: t,
        method: 'insert',
      };
      var optionsUpdate = {
        transacting: t,
        method: 'update',
        patch: true,
      };
      var ativacao;

      return
        Ativacao
                .forge({
                  data_ativacao: new Date(),
                  latitude: latitude,
                  longitude: longitude,
                  altitude: altitude,
                  pessoa_id: activation.usuario_pessoa_id,
                  veiculo_id: activation.veiculo_id,
                  ativo: true,
                })
                .save(null, optionsInsert)
                .then(function(a) {
                  ativacao = a;
                  return UsuarioHasVeiculo
                        .forge({
                          usuario_pessoa_id: activation.usuario_pessoa_id,
                          veiculo_id: activation.veiculo_id,
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
                        })
                        .then(function() {
                          return MovimentacaoConta
                                ._inserirDebito({
                                  historico: 'ativacao',
                                  tipo: 'ativacao',
                                  pessoa_id: activation.usuario_pessoa_id,
                                  valor: activation.valor,
                                }, options);
                        });
                })
                .then(function() {
                  return ativacao;
                });
    });
  },

  desativar: function(desativacao) {
    return Ativacao
            .forge({
              id_ativacao: desativacao.id_ativacao,
              pessoa_id: desativacao.usuario_pessoa_id,
            })
            .fetch()
            .then(function(d) {
              if (!d) {
                var err = new AreaAzul.BusinessException(
                        'Desativacao: Ativacao nao reconhecida', {
                          desativacao: desativacao,
                        });
                log.error(err.message, err.details);
                throw err;
              }
              return d;
            })
            .then(function(d) {
              return d
                    .save({
                      data_desativacao: new Date(),
                    }, {
                      patch: true,
                    });
            })
            .then(function(ativacaoExistente) {
              log.info('Desativacao: sucesso', {
                desativacao: ativacaoExistente,
              });
              return ativacaoExistente;
            });
  },

  ativarPelaRevenda: function(ativacao) {





    return Bookshelf.transaction(function(t) {
      var options = {
        transacting: t,
      };
      var optionsInsert = {
        transacting: t,
        method: 'insert',
      };
      var idVeiculo = null;
      var placaSemMascara = '';
      if (ativacao.placa) {
        placaSemMascara = util.placaSemMascara(ativacao.placa);
      }

      return Ativacao
          .validarAtivacao(ativacao)
                .then(function(messages) {
                  console.log('PRIMEIRO LOG');
                  if (messages.length) {
                    throw new AreaAzul
                        .BusinessException(
                            'Nao foi possivel ativar veículo. Dados invalidos',
                            messages);
                  }
                  return messages;
                }).catch(function(err) {
                  console.dir(err);
                });/*.then(function() {
                    console.log("SEGUNDO LOG");
                    return Veiculo
                        .forge({
                            placa: placaSemMascara,
                        }).fetch()
                        .then(function(veiculo) {
                            if (veiculo) {
                                return veiculo;
                            } else {
                                return Veiculo._cadastrar({
                                    placa: placaSemMascara,
                                    marca: ativacao.marca,
                                    cor: ativacao.cor,
                                    modelo: ativacao.modelo,
                                    cidade: ativacao.cidade,
                                }, options);
                            }
                        })
                        .then(function(v) {
                            return Ativacao.verificaAtivacao(v.id)
                                .then(function(result) {
                                    if (result) {
                                        ativacao = null;
                                        return ativacao;
                                    } else {
                                        return Ativacao
                                            .forge({
                                                data_ativacao: new Date(),
                                                pessoa_id: ativacao.usuario_pessoa_id,
                                                veiculo_id: v.id,
                                                ativo: true,
                                            })
                                            .save(null, optionsInsert)
                                            .then(
                                                function(a) {
                                                    return MovimentacaoConta
                                                        ._inserirDebito({
                                                            historico: 'ativacao',
                                                            tipo: 'ativacao',
                                                            pessoa_id: a.get('pessoa_id'),
                                                            valor: 10.00,
                                                        }, options);
                                                });

                                    }

                                });

                        });
                });*/

    });


  },

  validarAtivacao: function(ativacao) {

    var message = [];
    if (validator.isNull(ativacao.placa)) {
      message.push({
        attribute: 'placa',
        problem: 'Campo placa é obrigatório!',
      });
    } else
        if (validator.isNull(ativacao.cidade)) {
          message.push({
            attribute: 'cidade',
            problem: 'Campo cidade é obrigatório!',
          });
        } else
        if (validator.isNull(ativacao.marca)) {
          message.push({
            attribute: 'marca',
            problem: 'Campo marca é obrigatório!',
          });
        } else if (validator.isNull(ativacao.modelo)) {
          message.push({
            attribute: 'modelo',
            problem: 'Campo modelo é obrigatório!',
          });
        } else if (validator.isNull(ativacao.cor)) {
          message.push({
            attribute: 'cor',
            problem: 'Campo cor é obrigatório!',
          });
        } else if (validator.isNull(ativacao.tempo)) {
          message.push({
            attribute: 'tempo',
            problem: 'Campo tempo é obrigatório!',
          });
        } else if (validator.isNull(ativacao.celular)) {
          message.push({
            attribute: 'celular',
            problem: 'Campo celular é obrigatório!',
          });
        }


    return Ativacao
        .verificaSaldo(ativacao.usuario_pessoa_id)
            .then(function(conta) {
              console.log('SALDO');
              console.log(conta);
              if (conta) {
                console.log(conta);
                message.push({
                  attribute: 'saldo',
                  problem: 'Usuário não possui saldo em conta!',
                });
              }

              return message;
            });


  },

  verificaSaldo: function(id) {
    Conta.forge()
            .query(function(qb) {
              qb
                    .innerJoin('pessoa', function() {
                      this.on('pessoa.id_pessoa', '=', 'conta.pessoa_id');
                    })
                    .where('conta.pessoa_id', id)
                    .select('pessoa.*')
                    .select('conta.*');
              console.log('SQL: ' + qb);
            }).fetch()
            .then(function(model) {
              return model;
            });
  },

  verificaAtivacao: function(id_veiculo) {

    return Ativacao
        .forge()
            .query(function(qb) {
              qb
                    .innerJoin('veiculo', function() {
                      this.on('veiculo.id_veiculo', '=', 'ativacao.veiculo_id');
                    })
                    .where('ativacao.data_ativacao', '>=', moment().subtract(60, 'minutes').calendar())
                    .andWhere('ativacao.veiculo_id', '=', id_veiculo)
                    .select('ativacao.*')
                    .select('veiculo.*');
              console.log('sql' + qb);

            })
            .fetch()
            .then(function(collection) {
              return collection;
            }).catch(function(err) {
              console.dir(err);
              return err;
            });
  },

});

module.exports = Ativacao;
