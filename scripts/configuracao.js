#!/usr/bin/env node

'use strict';

var moment = require('moment');
var AreaAzul = require('../areaazul');

var a = require('yargs').argv;

if (!a.valor_ativacao || !a.tempo_tolerancia) {
    console.log('--valor_ativacao <valor_ativacao> --tempo_tolerancia <tempo_tolerancia>');
    console.log('  [--franquia <franquia>]');
    console.log('  [--ciclo_ativacao  <ciclo_ativacao>]');
    console.log('  [--ciclo_fiscalizacao <ciclo_fiscalizacao>]');
    process.exit(0);
}

AreaAzul.models.Configuracao.alterar({
    valor_ativacao: a.valor_ativacao,
    tempo_tolerancia: a.tempo_tolerancia,
    franquia: a.franquia || 10.0,
    ciclo_ativacao: a.ciclo_ativacao || 60.0,
    ciclo_fiscalizacao: a.ciclo_fiscalizacao || 60.0,
})
    .then(function(conf) {
        console.dir(conf);
        console.log('Configuracao ID=' + conf.id);
    })
    .then(function() {
        process.exit(0);
    })
    .catch(function(e) {
        console.error('Erro ao criar configuracao: ' + e);
        console.dir(e);
        process.exit(1);
    });