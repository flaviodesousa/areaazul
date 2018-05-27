'use strict';

const debug = require('debug')('areaazul:model:ativacao');
const validator = require('validator');
const moment = require('moment');
require('moment-timezone');
const _ = require('lodash');
const math = require('money-math');
const superagent = require('superagent');

const AreaAzul = require('../areaazul');
const Bookshelf = require('../database');
const log = require('../logging');
const AAU = require('areaazul-utils');
const Usuario = Bookshelf.model('Usuario');
const UsuarioHasVeiculo = Bookshelf.model('UsuarioHasVeiculo');
const MovimentacaoConta = Bookshelf.model('MovimentacaoConta');
const Veiculo = Bookshelf.model('Veiculo');
const Revendedor = Bookshelf.model('Revendedor');
const UsuarioRevendedor = Bookshelf.model('UsuarioRevendedor');
const Configuracao = Bookshelf.model('Configuracao');

const Ativacao = Bookshelf.Model.extend({
  tableName: 'ativacao'
}, {


  _validarAtivacao: (ativacao, options) => {
    let messages = [];

    if (!ativacao.tempo_minutos) {
      messages.push({
        attribute: 'tempo_minutos',
        problem: 'Tempo em minutos não fornecido'
      });
    } else if (isNaN(ativacao.tempo_minutos)) {
      messages.push({
        attribute: 'tempo_minutos',
        problem: 'Tempo em minutos deve ser um número'
      });
    } else if (ativacao.tempo_minutos <= 0) {
      messages.push({
        attribute: 'tempo_minutos',
        problem: 'Tempo deve ser superior a 0 minutos'
      });
    }

    return Configuracao
      ._buscar(options)
      .then(configuracao => {
        // Tempo em minutos válido, então calculo o valor:
        // valor = valor da ativacao (por hora) * tempo_minutos / 60 minutos
        ativacao.valor =
          math.div(
            math.mul(
              configuracao.get('valor_ativacao_reais'),
              math.floatToAmount(ativacao.tempo_minutos)),
            '60.00');
      })
      .then(() => messages);
  },


  _validarAtivacaoUsuario: (ativacao, options) => {
    let messages = [];
    let semUsuarioId = false;
    let semVeiculoId = false;

    if (!ativacao.usuario_id) {
      messages.push({
        attribute: 'usuario_id',
        problem: 'Falta usuário'
      });
      semUsuarioId = true;
    } else if (!validator.isNumeric('' + ativacao.usuario_id)) {
      messages.push({
        attribute: 'usuario_id',
        problem: 'Identificador de usuário inválido'
      });
      semUsuarioId = true;
    }

    if (!ativacao.veiculo_id) {
      messages.push({
        attribute: 'veiculo_id',
        problem: 'Falta veículo'
      });
      semVeiculoId = true;
    } else if (!validator.isNumeric('' + ativacao.veiculo_id)) {
      messages.push({
        attribute: 'veiculo_id',
        problem: 'Identificador de veículo inválido'
      });
      semVeiculoId = true;
    }

    return Ativacao
      ._validarAtivacao(ativacao, options)
      .then(mensagensComuns => {
        messages.push.apply(messages, mensagensComuns);
        if (semUsuarioId) {
          return;
        }
        return Usuario
          ._buscarPorId(ativacao.usuario_id, options)
          .then(function(usuario) {
            if (!usuario ||
              math.cmp(
                usuario.related('conta')
                  .get('saldo'),
                ativacao.valor) < 0) {
              messages.push({
                attribute: 'saldo',
                problem: 'Usuário não possui saldo suficiente em conta!'
              });
            }
          })
          .catch(AreaAzul.BusinessException, () => {
            messages.push({
              attribute: 'usuario_id',
              problem: `Não há usuário com id ${ativacao.usuario_id}`
            });
            semUsuarioId = true;
          });
      })
      .then(function() {
        if (semVeiculoId) {
          return null;
        }
        return Veiculo
          ._buscarPorId(ativacao.veiculo_id, options);
      })
      .catch(AreaAzul.BusinessException, () => {
        messages.push({
          attribute: 'veiculo_id',
          problem: `Não há veículo com id ${ativacao.usuario_id}`
        });
        semVeiculoId = true;
      })
      .then(() => messages);
  },


  _ativar: function(camposAtivacao, options) {
    const optionsInsert = _.merge({ method: 'insert' }, options);
    let ativacao = null;

    let latitude = camposAtivacao.latitude;
    let altitude = camposAtivacao.longitude;
    let longitude = camposAtivacao.altitude;

    if (!validator.isNumeric('' + latitude)) {
      latitude = null;
    }
    if (!validator.isNumeric('' + longitude)) {
      longitude = null;
    }
    if (!validator.isNumeric('' + altitude)) {
      altitude = null;
    }

    const dataAtivacao = moment()
      .utc();
    const dataExpiracao = dataAtivacao.clone()
      .add(camposAtivacao.tempo_minutos, 'minutes');

    return Ativacao
      ._validarAtivacaoUsuario(camposAtivacao, options)
      .then(function(messages) {
        if (messages && messages.length) {
          debug('_ativar() ativacao invalida');
          throw new AreaAzul
            .BusinessException(
              'Não foi possível ativar veículo. Dados inválidos',
              messages);
        }
      })
      .then(function() {
        return new Ativacao({
          data_ativacao: dataAtivacao.toDate(),
          data_expiracao: dataExpiracao.toDate(),
          latitude: latitude,
          longitude: longitude,
          altitude: altitude,
          ativador: 'usuario',
          id_ativador: camposAtivacao.usuario_id,
          veiculo_id: camposAtivacao.veiculo_id
        })
          .save(null, optionsInsert);
      })
      .then(a => {
        ativacao = a;
        return new AtivacaoUsuario({
          ativacao_id: ativacao.id,
          usuario_id: camposAtivacao.usuario_id
        })
          .save(null, optionsInsert);
      })
      .then(() => UsuarioHasVeiculo
        ._salvar({
          usuario_id: camposAtivacao.usuario_id,
          veiculo_id: camposAtivacao.veiculo_id
        }, options))
      .then(function() {
        return new Usuario({ id: camposAtivacao.usuario_id })
          .fetch(options);
      })
      .then(function(usuario) {
        return MovimentacaoConta
          ._inserirDebito({
            historico: 'ativacao',
            tipo: 'ativacao',
            valor: camposAtivacao.valor,
            conta_id: usuario.get('conta_id')
          }, options);
      })
      .then(function() {
        return ativacao;
      });
  },


  _desativar: function(desativacao, options) {
    const optionsPatch = _.merge({ patch: true }, options);
    return new AtivacaoUsuario({
      ativacao_id: desativacao.ativacao_id,
      usuario_id: desativacao.usuario_id
    })
      .fetch(options)
      .then(function(d) {
        if (!d) {
          const err = new AreaAzul.BusinessException(
            'Desativacao: Ativacao nao reconhecida',
            { desativacao: desativacao });
          log.error(err.message, err.details);
          throw err;
        }
        return new Ativacao({ id: desativacao.ativacao_id })
          .fetch(options);
      })
      .then(function(d) {
        return d
          .save({
            data_desativacao: moment().utc().toDate()
          }, optionsPatch);
      })
      .then(function(ativacaoExistente) {
        log.info('Desativacao: sucesso', { desativacao: ativacaoExistente });
        return ativacaoExistente;
      });
  },


  _ativarPorRevenda: function(camposAtivacao, options) {
    const optionsInsert = _.merge({ method: 'insert' }, options);
    let ativacao;
    let configuracao;
    let usuarioRevendedor = null;
    const dataAtivacao = moment()
      .utc();
    const dataExpiracao = dataAtivacao.clone()
      .add(camposAtivacao.tempo_minutos, 'minutes');
    return Configuracao
      ._buscar(options)
      .then(c => {
        configuracao = c;
        return Ativacao
          ._validarAtivacaoRevenda(camposAtivacao, configuracao, options);
      })
      .then(function(messages) {
        if (messages.length) {
          debug('ativarPorRevenda() ativação inválida');
          throw new AreaAzul
            .BusinessException(
              'Não foi possível ativar veículo. Dados inválidos',
              messages);
        }
        debug('ativarPorRevenda() ativação válida');
      })
      .then(() => {
        return new UsuarioRevendedor({
          id: camposAtivacao.usuario_revendedor_id
        })
          .fetch(options);
      })
      .then(function(usuRev) {
        usuarioRevendedor = usuRev;
      })
      .then(function() {
        debug('ativarPorRevenda() buscando veiculo com placa ' +
          camposAtivacao.placa);
        return Veiculo
          .forge({ placa: camposAtivacao.placa })
          .fetch(options);
      })
      .then(function(veiculo) {
        if (veiculo) {
          debug('ativarPorRevenda() veiculo existe #' + veiculo.id);
          return veiculo;
        }
        debug('ativarPorRevenda() veiculo nao existe, cadastrando');
        return Veiculo._cadastrar({
          placa: camposAtivacao.placa,
          tipo: camposAtivacao.tipo,
          marca: camposAtivacao.marca,
          cor: camposAtivacao.cor,
          modelo: camposAtivacao.modelo,
          cidade_id: camposAtivacao.cidade_id
        }, options);
      })
      .then(function(v) {
        debug('ativarPorRevenda() ativando veiculo #' + v.id);
        return new Ativacao({
          data_ativacao: dataAtivacao.toDate(),
          data_expiracao: dataExpiracao.toDate(),
          ativador: 'revenda',
          id_ativador: usuarioRevendedor.id,
          veiculo_id: v.id
        })
          .save(null, optionsInsert);
      })
      .then(function(ativacaoSalva) {
        ativacao = ativacaoSalva;
        return new AtivacaoUsuarioRevendedor({
          ativacao_id: ativacao.id,
          usuario_revendedor_id: usuarioRevendedor.id
        })
          .save(null, optionsInsert);
      })
      .then(() => {
        return new Revendedor({ id: usuarioRevendedor.get('revendedor_id') })
          .fetch(options);
      })
      .then(function(revendedor) {
        return MovimentacaoConta
          ._inserirDebito({
            conta_id: revendedor.get('conta_id'),
            historico: `ativacao-revenda usuario=${usuarioRevendedor.id}/revenda=${revendedor.id}`,
            tipo: 'ativacao',
            valor: camposAtivacao.valor
          }, options);
      })
      .then(() => {
        if (process.env.AREAAZUL_SMS_API_URL && camposAtivacao.telefone) {
          let expiracao = dataExpiracao.clone()
            .tz(configuracao.get('parametros').fuso_horario)
            .format('H:mm');
          superagent
            .post(process.env.AREAAZUL_SMS_API_URL)
            .send({
              telefone: camposAtivacao.telefone,
              texto: `areaazul.org informa: seu veículo placa ${camposAtivacao.placa} está ativado até ${expiracao}`
            })
            .end((err, res) => {
              if (err || !res.ok) {
                log.error('Ativação: Erro ao enviar SMS', {
                  err: err,
                  res: res,
                  camposAtivacao: camposAtivacao,
                  ativacao: ativacao
                });
                return;
              }
              log.verbose('Ativação: SMS enviado', {
                res: res,
                camposAtivacao: camposAtivacao,
                ativacao: ativacao
              });
            });
        }
        return null;
      })
      .then(() => {
        return ativacao;
      });
  },


  _validarAtivacaoRevenda: function(camposAtivacao, configuracao, options) {
    let messages = [];
    let idUsuarioRevendedor;

    if (!camposAtivacao.usuario_revendedor_id) {
      messages.push({
        attribute: 'usuario_revendedor_id',
        problem: 'Falta identificador do revendedor'
      });
    } else if (!validator.isNumeric('' + camposAtivacao.usuario_revendedor_id)) {
      messages.push({
        attribute: 'usuario_revendedor_id',
        problem: 'Deve ser numérico'
      });
    } else {
      idUsuarioRevendedor = 0 + camposAtivacao.usuario_revendedor_id;
    }

    if (!AAU.isPlaca(camposAtivacao.placa)) {
      messages.push({
        attribute: 'placa',
        problem: 'Placa inválida'
      });
    }

    if (camposAtivacao.telefone) {
      if (!/^\d{11}$/.test(camposAtivacao.telefone)) {
        messages.push({
          attribute: 'telefone',
          problem: 'O número de telefone, se presente, deve ter exatamente 11 dígitos'
        });
      }
    }

    return Ativacao
      ._validarAtivacao(camposAtivacao, options)
      .then(mensagensComuns => {
        messages.push.apply(messages, mensagensComuns);
        return new Veiculo({ placa: camposAtivacao.placa })
          .fetch(_.merge({ require: true }, options));
      })
      .then(function(veiculo) {
        return Ativacao
          ._verificaAtivacao(veiculo.get('placa'), options);
      })
      .then(function(ativado) {
        if (ativado) {
          messages.push({
            attribute: 'placa',
            problem: 'AreaAzul já ativada para este veículo!'
          });
        }
      })
      .catch(Bookshelf.NotFoundError, () =>
        // Placa não cadastrada, verificar se há dados suficientes para
        // cadastrar novo veículo
        Veiculo
          ._validarVeiculo(camposAtivacao, options)
          .then(function(messagesVeiculo) {
            messages.push.apply(messages, messagesVeiculo);
          }))
      .then(() =>
        Ativacao
          ._validarAtivacao(camposAtivacao, options)
          .then(messagesComuns => {
            messages.push.apply(messages, messagesComuns);
          }))
      .then(() => {
        if (!idUsuarioRevendedor) {
          return messages;
        }
        return UsuarioRevendedor
          ._buscarPorId(idUsuarioRevendedor, options)
          .then(function(usuRev) {
            if (!usuRev ||
              math.cmp(
                usuRev.related('revendedor')
                  .related('conta')
                  .get('saldo'),
                camposAtivacao.valor) < 0) {
              messages.push({
                attribute: 'valor',
                problem: 'Revenda não possui saldo suficiente em conta!'
              });
            }
            return messages;
          })
          .catch(Bookshelf.Model.NotFoundError, () => {
            idUsuarioRevendedor = undefined;
            messages.push({
              attribute: 'usuario_revendedor_id',
              problem: 'Identificador de revendedor inválido'
            });
          });
      });
  },


  _verificaAtivacao: function(placa, options) {
    return Ativacao
      .forge()
      .query(function(qb) {
        qb
          .innerJoin('veiculo', 'veiculo.id', 'ativacao.veiculo_id')
          .whereNull('ativacao.data_desativacao')
          .andWhere('ativacao.data_expiracao', '>=', moment().utc())
          .andWhere('veiculo.placa', '=', placa)
          .select('ativacao.*')
          .select('veiculo.*');
      })
      .fetch(options);
  },


  _lista: (idAtivador, antesDe, limite, ativador, options) =>
    Ativacao
      .query(qb => {
        qb.where({ ativador: ativador, id_ativador: idAtivador })
          .where('data_ativacao', '<', antesDe)
          .orderBy('data_ativacao', 'desc')
          .limit(limite);
      })
      .fetchAll(options)


});
Bookshelf.model('Ativacao', Ativacao);


const AtivacaoUsuario = Bookshelf.Model.extend({
  tableName: 'ativacao_usuario',
  idAttribute: [ 'ativacao_id', 'usuario_id' ]
});
Bookshelf.model('AtivacaoUsuario', AtivacaoUsuario);


const AtivacaoUsuarioRevendedor = Bookshelf.Model.extend({
  tableName: 'ativacao_usuario_revendedor',
  idAttribute: [ 'ativacao_id', 'usuario_revendedor_id' ]
});
Bookshelf.model('AtivacaoUsuarioRevendedor', AtivacaoUsuarioRevendedor);


const AtivacaoUsuarioFiscal = Bookshelf.Model.extend({
  tableName: 'ativacao_usuario_fiscal',
  idAttribute: [ 'ativacao_id', 'usuario_fiscal_id' ]
});
Bookshelf.model('AtivacaoUsuarioFiscal', AtivacaoUsuarioFiscal);


const Ativacoes = Bookshelf.Collection.extend({
  model: Ativacao
}, {


  _listarAtivacoes: function() {
    return Ativacoes
      .forge()
      .query(function(qb) {
        qb
          .innerJoin('veiculo', 'veiculo.id', 'ativacao.veiculo_id')
          .leftJoin('fiscalizacao',
            'fiscalizacao.veiculo_id', 'ativacao.veiculo_id')
          .where('ativacao.data_expiracao', '>=', moment().utc())
          .select('ativacao.*')
          .select('veiculo.*');
      })
      .fetch()
      .then(function(collectionVeiculosSomenteAtivados) {
        return collectionVeiculosSomenteAtivados;
      });
  },


  _listarAtivacoesExpirando: function() {
    return Ativacoes
      .forge()
      .query(function(qb) {
        qb
          .innerJoin('veiculo', 'veiculo.id', 'ativacao.veiculo_id')
          .leftJoin('fiscalizacao',
            'fiscalizacao.veiculo_id', 'ativacao.veiculo_id')
          .where('ativacao.data_expiracao', '<=',
            moment()
              .utc()
              .subtract(5, 'minutes'))
          .andWhere('ativacao.data_expiracao', '>=',
            moment()
              .utc()
              .subtract(5, 'minutes'))
          .select('ativacao.*')
          .select('veiculo.*');
      })
      .fetch()
      .then(function(collectionVeiculosSomenteAtivados) {
        return collectionVeiculosSomenteAtivados;
      });
  },


  _listarAtivacoesExpiraram: function() {
    return Ativacoes
      .forge()
      .query(function(qb) {
        qb
          .innerJoin('veiculo',
            'veiculo.id', 'ativacao.veiculo_id')
          .leftJoin('fiscalizacao',
            'fiscalizacao.veiculo_id', 'ativacao.veiculo_id')
          .where('ativacao.data_expiracao', '>', moment().utc())
          .select('ativacao.*')
          .select('veiculo.*');
      })
      .fetch()
      .then(function(collectionVeiculosSomenteAtivados) {
        return collectionVeiculosSomenteAtivados;
      });
  }


});
Bookshelf.collection('Ativacoes', Ativacoes);
