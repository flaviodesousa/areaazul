/**
 * Created by flavio on 4/29/17.
 */
'use strict';

const debug = require('debug')('areaazul:seed:03');
const moment = require('moment');

exports.seed = (knex, Promise) => Promise.all([
  {
    nome: 'Flávio de Sousa',
    email: 'flavio@areaazul.org',
    cpf: '41632125153',
    senha: '$2a$10$kU35XcGQ1Pmyq4GIJd9WIeBNVt1RaCI3WLCsSX6zvp2H0tkQSKBTS',
    autorizacao: 'administrador'
  },
  {
    nome: 'Makario Luis Orozimbo',
    email: 'makario@solutions.inf.br',
    cpf: '55365060644',
    senha: '$2a$10$kU35XcGQ1Pmyq4GIJd9WIeBNVt1RaCI3WLCsSX6zvp2H0tkQSKBTS',
    autorizacao: 'administrador'
  }
].map(pessoa =>
  knex('pessoa')
    .returning('id')
    .insert({
      nome: pessoa.nome,
      email: pessoa.email
    })
    .then(p => {
      debug('pessoa adicionada', { pessoa: p });
      pessoa.id = p[ 0 ];
      return knex('pessoa_fisica')
        .insert({
          id: pessoa.id,
          cpf: pessoa.cpf
        });
    })
    .then(() => knex('usuario_administrativo')
      .insert({
        id: pessoa.id,
        login: pessoa.cpf,
        senha: pessoa.senha,
        autorizacao: pessoa.autorizacao
      }))
    .then(() => knex('conta')
      .returning('id')
      .insert({
        data_abertura: moment()
          .utc()
      }))
    .then(conta => knex('usuario_fiscal')
      .insert({
        id: pessoa.id,
        login: pessoa.cpf,
        senha: pessoa.senha,
        conta_id: conta[ 0 ]
      }))));
