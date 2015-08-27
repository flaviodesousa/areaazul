'use strict';

var AreaAzul = require('../../areaazul');
var log = AreaAzul.log;
var _ = require('lodash');
var validator = require('validator');
var Bookshelf = require('bookshelf').conexaoMain;
var Revendedor = require('./revendedor');
var UsuarioHasVeiculo = require('./usuario_has_veiculo');
var MovimentacaoConta = require('./movimentacaoconta');
var Veiculo = require('./veiculo');

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
                transacting: t
            };
            var optionsInsert = {
                transacting: t,
                method: 'insert'
            };
            var optionsUpdate = {
                transacting: t,
                method: 'update',
                patch: true
            };
            var ativacao;

            return Ativacao
                .forge({
                    data_ativacao: new Date(),
                    latitude: latitude,
                    longitude: longitude,
                    altitude: altitude,
                    usuario_pessoa_id: activation.usuario_pessoa_id,
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
                                        ultima_ativacao: new Date()
                                    }, optionsUpdate);
                            }
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
        });
    },

    desativar: function(desativacao) {
        return Ativacao
            .forge({
                id_ativacao: desativacao.id_ativacao,
                usuario_pessoa_id: desativacao.usuario_pessoa_id,
            })
            .fetch()
            .then(function(d) {
                if (!d) {
                    var err = new AreaAzul.BusinessException(
                        'Desativacao: Ativacao nao reconhecida', {
                            desativacao: desativacao
                        });
                    log.error(err.message, err.details);
                    throw err;
                }
                return d;
            })
            .then(function(d) {
                return d
                    .save({
                        data_desativacao: new Date()
                    }, {
                        patch: true
                    });
            })
            .then(function(ativacaoExistente) {
                log.info('Desativacao: sucesso', {
                    desativacao: ativacaoExistente
                });
                return ativacaoExistente;
            });
    },

    ativarPelaRevenda: function(ativacao) {
        return Bookshelf.transaction(function(t) {
             var options = {
                transacting: t
            };
            var optionsInsert = {
                transacting: t,
                method: 'insert'
            };
            var optionsUpdate = {
                transacting: t,
                method: 'update',
                patch: true
            };
            var idVeiculo = null;

            console.dir("Placa: "+ativacao.placa);
            return Veiculo
                .forge({
                    placa: ativacao.placa
                })
                .fetch()
                .then(function(veiculo) {
                    if (veiculo === null) {
                        return Veiculo._cadastrarVeiculo({
                                placa: ativacao.placa,
                                marca: ativacao.marca,
                                cor: ativacao.cor,
                                modelo: ativacao.modelo,
                                estado: ativacao.estado_id,
                            }, options);
                    } else {
                        idVeiculo = veiculo.id;
                        return veiculo;
                    }
                })
                .then(function() {
                    return Ativacao
                        .forge({
                            data_ativacao: new Date(),
                            usuario_pessoa_id: ativacao.usuario_pessoa_id,
                            veiculo_id: idVeiculo,
                            ativo: true
                        })
                        .save(null, optionsInsert)
                        .then(
                        function(a) {
                          return MovimentacaoConta
                            ._inserirDebito({
                                historico: 'ativacao',
                                tipo: 'ativacao',
                                pessoa_id: ativacao.usuario_pessoa_id,
                                valor: a.valor
                            }, options);
                        });
                });
        });


    },

});

module.exports = Ativacao;