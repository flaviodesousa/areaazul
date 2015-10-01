'use strict';

var _ = require('lodash');
var Bookshelf = require('bookshelf').conexaoMain;
var validator = require('validator');
var validation = require('./validation');
var util = require('../../helpers/util');

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

        if(placa){
            var placaSemMascara = util.formata(placa);

        }
        return Veiculo.forge().query(function(qb) {
            qb.where('veiculo.placa', placaSemMascara);
            qb.join('cidade', 'veiculo.cidade_id', '=', 'cidade.id_cidade');
            qb.join('estado', 'cidade.estado_id', '=', 'estado.id_estado');
            qb.select('veiculo.*');
            qb.select('cidade.*');
            qb.select('estado.id_estado');
            qb.select('estado.uf');
        }).fetch();
    },

    validarVeiculo: function(veiculo) {
        var message = [];
        if (validator.isNull(veiculo.cidade_id)) {
            message.push({
                attribute: 'cidade',
                problem: 'Cidade é obrigatória!',
            });
        }
        if (validator.isNull(veiculo.placa)) {
            message.push({
                attribute: 'placa',
                problem: 'Campo placa é obrigatória!',
            });
        }
        if (validator.isNull(veiculo.modelo)) {
            message.push({
                attribute: 'modelo',
                problem: 'Campo modelo é obrigatório!',
            });
        }
        if (validator.isNull(veiculo.marca)) {
            message.push({
                attribute: 'marca',
                problem: 'Campo marca é obrigatório!',
            });
        }
        if (validator.isNull(veiculo.cor)) {
            message.push({
                attribute: 'cor',
                problem: 'Campo cor é obrigatório!',
            });
        }
    /*    if (validator.isNull(veiculo.ano_fabricado)) {
            message.push({
                attribute: 'ano_fabricado',
                problem: 'Campo ano de fabricação é obrigatório!',
            });
        }
        if (validator.isNull(veiculo.ano_modelo)) {
            message.push({
                attribute: 'ano_modelo',
                problem: 'Campo ano de modelo é obrigatório!',
            });
        }
        if (!validator.isNumeric(veiculo.ano_fabricado)) {
            message.push({
                attribute: 'ano_fabricado',
                problem: 'Ano de fabricação informado é inválido!',
            });
        }
        if (!validator.isNumeric(veiculo.ano_modelo)) {
            message.push({
                attribute: 'ano_modelo',
                problem: 'Ano de modelo informado é inválido!',
            });
        }*/

        return message;
    },

});


module.exports = Veiculo;