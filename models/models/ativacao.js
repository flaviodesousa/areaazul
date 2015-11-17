'use strict';

var AreaAzul = require('../../areaazul');
var log = AreaAzul.log;
var util = require('../../helpers/util');
var validator = require('validator');
var Bookshelf = require('bookshelf').conexaoMain;
var UsuarioHasVeiculo = require('./usuario_has_veiculo');
var MovimentacaoConta = require('./movimentacaoconta');
var Veiculo = require('./veiculo');
var validator = require('validator');
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

            return Ativacao
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

            return Veiculo
                .forge({
                    placa: placaSemMascara,
                })
                .fetch()
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
                    console.log("----------------VALOR DO V--------------------------");
                    return Ativacao.forge({
                            veiculo_id: v.id,
                        }).fetch()
                        .then(function(ativacao) {
                            //VALIDAÇÃO DE INTERVALO DE ATIVAÇÃO.
                            console.log("ATIVAÇÃO NO MODEL DE ATIVAÇÃO:");
                            console.dir(ativacao);
                            if (ativacao.data_ativacao > moment().subtract(60, 'minutes').calendar()) {

                                console.log("RETORNOU POR JÁ ESTAR ATIVO A MENOS DE 60 MINUTOS:"+ativacao.data_ativacao+"//"+moment().subtract(60, 'minutes').calendar());
                                return ativacao;

                            } else {

                                console.log("RETORNOU POR JÁ ESTAR ATIVO A MAIS DE 60 MINUTOS:"+ativacao.data_ativacao+"//"+moment().subtract(60, 'minutes').calendar());
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
                        })

                });
        });


    },

    validarAtivacao: function(ativacao) {
        var message = [];
        if (validator.isNull(ativacao.tipo_veiculo)) {
            message.push({
                attribute: 'tipo_veiculo',
                problem: 'Cidade tipo veiculo é obrigatório!',
            });
        }
        if (validator.isNull(ativacao.tempo)) {
            message.push({
                attribute: 'tempo',
                problem: 'Campo tempo é obrigatório!',
            });
        }
        return message;
    },

});

module.exports = Ativacao;