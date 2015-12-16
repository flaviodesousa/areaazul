'use strict';

var AreaAzul = require('../../areaazul');
var log = AreaAzul.log;
var util = require('../../helpers/util');
var validator = require('validator');
var Bookshelf = require('bookshelf').conexaoMain;
var UsuarioHasVeiculo = require('./usuario_has_veiculo');
var MovimentacaoConta = require('./movimentacaoconta');
var Conta = require('./conta');
var validator = require('validator');
var moment = require('moment');
var Veiculo = require('./veiculo');
var UsuarioRevendedor = require('./usuario_revendedor');


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
            return Ativacao
                .validarAtivacao(ativacao,placaSemMascara)
                .then(function(messages) {
                    if (messages.length) {
                        throw new AreaAzul
                            .BusinessException(
                                'Nao foi possivel ativar veículo. Dados invalidos',
                                messages);
                    }
                    console.dir(messages);
                    return messages;
                }).then(function() {
                    return Veiculo
                        .forge({
                            placa: placaSemMascara,
                        }).fetch();
                }).then(function(veiculo) {
                    if (veiculo) {
                        return veiculo;
                    } else {
                        return Veiculo.cadastrar({
                            placa: placaSemMascara,
                            marca: ativacao.marca,
                            cor: ativacao.cor,
                            modelo: ativacao.modelo,
                            cidade_id: ativacao.cidade,
                        }, options);
                    }
                })
                .then(function(v) {
                    return Ativacao
                        .forge({
                            data_ativacao: new Date(),
                            pessoa_id: ativacao.usuario_pessoa_id,
                            veiculo_id: v.id,
                            ativo: true,
                        })
                        .save(null, optionsInsert)
                        .then(function(a) {
                            return UsuarioRevendedor
                                   .forge({pessoa_fisica_pessoa_id: a.get('pessoa_id')})
                                   .fetch();
                        })
                        .then(function(usuario){
                            return MovimentacaoConta
                            ._inserirDebito({
                                historico: 'ativacao',
                                tipo: 'ativacao',
                                pessoa_id: usuario.get('revendedor_id'),
                                valor: 10.00,
                            }, options);
                        });
                });
        });
    },

    validarAtivacao: function(ativacao, placa) {

        var message = [];

        
        
        if (validator.isNull(ativacao.marca)) {
            message.push({
                attribute: 'marca',
                problem: 'Campo marca é obrigatório!',
            });
        }
        if (validator.isNull(ativacao.modelo)) {
            message.push({
                attribute: 'modelo',
                problem: 'Campo modelo é obrigatório!',
            });
        }
        if (validator.isNull(ativacao.cor)) {
            message.push({
                attribute: 'cor',
                problem: 'Campo cor é obrigatório!',
            });
        }
        if (validator.isNull(ativacao.tempo)) {
            message.push({
                attribute: 'tempo',
                problem: 'Campo tempo é obrigatório!',
            });
        }
        return Ativacao
            .verificaAtivacao(placa)
            .then(function(ativado) {
                if (ativado) {
                    message.push({
                        attribute: 'ativado',
                        problem: 'Este veículo está com uso ativado!',
                    });
                }
                return message;

            }).then(function() {
                return Ativacao
                    .verificaSaldo(ativacao.usuario_pessoa_id)
                    .then(function(conta) {
                        console.dir(conta);
                        if (conta.get('saldo') <= 0) {
                            message.push({
                                attribute: 'saldo',
                                problem: 'Usuário não possui saldo em conta!',
                            });
                        }
                        return message;
                    });
            });


    },


    verificaSaldo: function(id) {
        return Conta
            .forge()
            .query(function(qb) {
                qb
                    .innerJoin('pessoa', function() {
                        this.on('pessoa.id_pessoa', '=', 'conta.pessoa_id');
                    })
                    .innerJoin('revendedor', function() {
                        this.on('revendedor.pessoa_id', '=', 'pessoa.id_pessoa');
                    })
                    .innerJoin('usuario_revendedor', function() {
                        this.on('usuario_revendedor.revendedor_id', '=', 'revendedor.pessoa_id');
                    })
                    .where('usuario_revendedor.pessoa_fisica_pessoa_id', id)
                    .select('pessoa.*')
                    .select('conta.*')
                    .select('revendedor.*')
                    .select('usuario_revendedor.*');
                    console.log(qb);
            })
            .fetch();
    },

    verificaAtivacao: function(placa) {
        return Ativacao
            .forge()
            .query(function(qb) {
                qb
                    .innerJoin('veiculo', function() {
                        this.on('veiculo.id_veiculo', '=', 'ativacao.veiculo_id');
                    })
                    .where('ativacao.data_ativacao', '>=', moment().subtract(60, 'minutes').calendar())
                    .andWhere('veiculo.placa', '=', placa)
                    .select('ativacao.*')
                    .select('veiculo.*');
                    console.log("SQL"+qb);
            })
            .fetch();
    },

});

module.exports = Ativacao;