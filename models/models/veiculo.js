'use strict';

var _ = require('lodash');
var Bookshelf = require('bookshelf').conexaoMain;
var validator = require('validator');
var validation = require('./validation');
var util = require('./util');

var Usuario = require('./usuario');
var UsuarioHasVeiculo = require('./usuario_has_veiculo');

var Veiculo = Bookshelf.Model.extend({
    tableName: 'veiculo',
    idAttribute: 'id_veiculo',
    usuarios: function() {
        return this.belongsToMany(Usuario)
            .through(UsuarioHasVeiculo);
    },
}, {

    _cadastrar: function(vehicle, options) {
        var optionsInsert = _.merge({}, options || {}, {
            method: 'insert'
        });

        return Veiculo
            .forge({
                cidade_id: vehicle.cidade_id,
                placa: vehicle.placa,
                marca: vehicle.marca,
                modelo: vehicle.modelo,
                cor: vehicle.cor,
                ano_fabricado: vehicle.ano_fabricado,
                ano_modelo: vehicle.ano_modelo,
                ativo: true,
            })
            .save(null, optionsInsert)
            .then(function(veiculo) {
                return veiculo;
            });
    },

    _cadastrarVeiculo: function(vehicle, options) {
        Veiculo._cadastrar(vehicle, options);
    },

    procurarVeiculo: function(placa) {
        return Veiculo.forge().query(function(qb) {
            qb.where('veiculo.placa', placa);
            qb.join('cidade', 'veiculo.cidade_id', '=', 'cidade.id_cidade');
            qb.join('estado', 'cidade.estado_id', '=', 'estado.id_estado');
            qb.select('veiculo.*');
            qb.select('cidade.*');
            qb.select('estado.id_estado');
            qb.select('estado.uf');
        }).fetch();
    },

    validate: function(vehicle) {
        var message = [];
        if (validator.isNull(vehicle.estado_id)) {
            message.push({
                attribute: 'cidade',
                problem: 'Cidade é obrigatória!',
            });
        }
        if (validator.isNull(vehicle.placa)) {
            message.push({
                attribute: 'placa',
                problem: 'Placa é obrigatória!',
            });
        }
        if (validator.isNull(vehicle.modelo)) {
            message.push({
                attribute: 'modelo',
                problem: 'Modelo é obrigatório!',
            });
        }
        if (validator.isNull(vehicle.marca)) {
            message.push({
                attribute: 'marca',
                problem: 'Marca é obrigatória!',
            });
        }
        if (validator.isNull(vehicle.cor)) {
            message.push({
                attribute: 'cor',
                problem: 'Cor é obrigatória!',
            });
        }
        if (validator.isNull(vehicle.ano_fabricado)) {
            message.push({
                attribute: 'ano_fabricado',
                problem: 'Ano de fabricação é obrigatório!',
            });
        }
        if (validator.isNull(vehicle.ano_modelo)) {
            message.push({
                attribute: 'ano_modelo',
                problem: 'Ano de modelo é obrigatório!',
            });
        }
        if (!validator.isNumeric(vehicle.ano_fabricado)) {
            message.push({
                attribute: 'ano_fabricado',
                problem: 'Ano de fabricação é inválido!',
            });
        }
        if (!validator.isNumeric(vehicle.ano_modelo)) {
            message.push({
                attribute: 'ano_modelo',
                problem: 'Ano de modelo é inválido!',
            });
        }
        if (!validation.validaPlaca(vehicle)) {
            message.push({
                attribute: 'placa',
                problem: 'Placa é inválida!',
            });
        }
        return true;
    },
});


module.exports = Veiculo;