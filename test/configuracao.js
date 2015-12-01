'use strict';

var should = require('chai').should();
var AreaAzul = require('../areaazul');
var Configuracao = AreaAzul.models.Configuracao;

describe('model.configuracao', function() {
    var id_configuracao = null;


    describe('alterar()', function() {
        it('alterar as configurações', function(done) {
            var config = {
                valor_ativacao: 6.00,
                tempo_tolerancia: 16.0,
                franquia: 10.0,
                ciclo_ativacao: 70.0,
                ciclo_fiscalizacao: 60.0,
            };
            Configuracao.alterar(config)
                .then(function(model) {
                    id_configuracao = model.id;
                    done();
                })
                .catch(function(err) {
                    done(err);
                });
        });
    });
});