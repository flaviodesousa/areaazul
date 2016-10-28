'use strict';

const debug = require('debug')('areaazul:model:ativacao');
const validator = require('validator');
const moment = require('moment');
const _ = require('lodash');
const math = require('money-math');

const AreaAzul = require('../../areaazul');
const Bookshelf = require('../../database');
const log = require('../../logging');
const util = require('areaazul-utils');
const Usuario = Bookshelf.model('Usuario');
const UsuarioHasVeiculo = Bookshelf.model('UsuarioHasVeiculo');
const MovimentacaoConta = Bookshelf.model('MovimentacaoConta');
const Veiculo = Bookshelf.model('Veiculo');
const Revendedor = Bookshelf.model('Revendedor');
const UsuarioRevendedor = Bookshelf.model('UsuarioRevendedor');
const Configuracao = Bookshelf.model('Configuracao');

var Ativacao = Bookshelf.Model.extend({
  tableName: 'ativacao'
}, {
  _validarAtivacao: (ativacao) => {
    var messages = [];

    if (!ativacao.tempo) {
      messages.push({
        attribute: 'tempo',
        problem: 'Tempo em minutos não fornecido'
      });
    } else if (!validator.isNumeric('' + ativacao.tempo)) {
      messages.push({
        attribute: 'tempo',
        problem: 'Tempo em minutos deve ser um número'
      });
    } else if (ativacao.tempo <= 0) {
      messages.push({
        attribute: 'tempo',
        problem: 'Tempo deve ser superior a 0 minutos'
      });
    }

    return Configuracao
      ._buscar()
      .then(configuracao => {
        // Tempo em minutos válido, então calculo o valor:
        // valor = valor da ativacao (por hora) * tempo (minutos) / 60 minutos
        ativacao.valor =
          math.div(
            math.mul(
              configuracao.get('valor_ativacao_reais'),
              math.floatToAmount(ativacao.tempo)),
          '60.00');
      })
      .then(() => messages);
  },
  _validarAtivacaoUsuario: (ativacao, options) => {
    var messages = [];
    var semUsuarioId = false;
    var semVeiculoId = false;

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
        if (semUsuarioId) { return; }
        return Usuario
          ._buscarPorId(ativacao.usuario_id, options)
          .then(function(usuario) {
            if (!usuario ||
              math.cmp(
                usuario.related('conta').get('saldo'),
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
        if (semVeiculoId) { return null; }
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
    var optionsInsert = _.merge({ method: 'insert' }, options);
    var optionsUpdate = _.merge({ method: 'update', patch: true }, options);
    var ativacao = null;

    var latitude = camposAtivacao.latitude;
    var altitude = camposAtivacao.longitude;
    var longitude = camposAtivacao.altitude;

    if (!validator.isNumeric('' + latitude)) {
      latitude = null;
    }
    if (!validator.isNumeric('' + longitude)) {
      longitude = null;
    }
    if (!validator.isNumeric('' + altitude)) {
      altitude = null;
    }

    const dataAtivacao = moment();
    const dataExpiracao = moment().add(camposAtivacao.tempo, 'minutes');

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
          data_ativacao: dataAtivacao,
          data_expiracao: dataExpiracao,
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
      .then(() =>
        UsuarioHasVeiculo
          .forge({
            usuario_id: camposAtivacao.usuario_id,
            veiculo_id: camposAtivacao.veiculo_id
          })
          .fetch(_.merge({ require: true }, options)))
      .then(usuariohasveiculo =>
        usuariohasveiculo
          .save({ ultima_ativacao: dataAtivacao }, optionsUpdate))
      .catch(Bookshelf.NotFoundError, () =>
        new UsuarioHasVeiculo({
          usuario_id: camposAtivacao.usuario_id,
          veiculo_id: camposAtivacao.veiculo_id,
          ultima_ativacao: dataAtivacao
        })
          .save(null, optionsInsert))
      .then(function() {
        return new Usuario({ id: camposAtivacao.usuario_id })
          .fetch();
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
    var optionsPatch = _.merge({ patch: true }, options);
    return new AtivacaoUsuario({
      ativacao_id: desativacao.ativacao_id,
      usuario_id: desativacao.usuario_id
    })
      .fetch(options)
      .then(function(d) {
        if (!d) {
          var err = new AreaAzul.BusinessException(
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
          .save({ data_desativacao: new Date() }, optionsPatch);
      })
      .then(function(ativacaoExistente) {
        log.info('Desativacao: sucesso', { desativacao: ativacaoExistente });
        return ativacaoExistente;
      });
  },
  _ativarPorRevenda: function(camposAtivacao, options) {
    const optionsInsert = _.merge({ method: 'insert' }, options);
    var ativacao;
    var usuarioRevendedor = null;
    var placaSemMascara = '';
    if (camposAtivacao.placa) {
      placaSemMascara = util.placaSemMascara(camposAtivacao.placa);
    }
    const dataAtivacao = moment();
    const dataExpiracao = moment().add(camposAtivacao.tempo, 'minutes');
    return Ativacao
      ._validarAtivacaoRevenda(camposAtivacao, placaSemMascara, options)
      .then(function(messages) {
        if (messages.length) {
          debug('ativarPorRevenda() ativacao invalida');
          throw new AreaAzul
            .BusinessException(
            'Não foi possível ativar veículo. Dados inválidos',
            messages);
        }
        debug('ativarPorRevenda() ativacao valida');
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
          placaSemMascara);
        return Veiculo
          .forge({ placa: placaSemMascara })
          .fetch(options);
      })
      .then(function(veiculo) {
        if (veiculo) {
          debug('ativarPorRevenda() veiculo existe #' + veiculo.id);
          return veiculo;
        }
        debug('ativarPorRevenda() veiculo nao existe, cadastrando');
        return Veiculo._cadastrar({
          placa: placaSemMascara,
          marca: camposAtivacao.marca,
          cor: camposAtivacao.cor,
          modelo: camposAtivacao.modelo,
          cidade_id: camposAtivacao.cidade_id
        }, options);
      })
      .then(function(v) {
        debug('ativarPorRevenda() ativando veiculo #' + v.id);
        return new Ativacao({
          data_ativacao: dataAtivacao,
          data_expiracao: dataExpiracao,
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
            historico: 'ativacao-revenda usuario='
            + usuarioRevendedor.id + '/revenda=' + revendedor.id,
            tipo: 'ativacao',
            valor: camposAtivacao.valor
          }, options);
      })
      .then(() => {
        return ativacao;
      });
  },
  _validarAtivacaoRevenda: function(ativacao, placa, options) {
    var messages = [];
    var idUsuarioRevendedor;

    if (!ativacao.usuario_revendedor_id) {
      messages.push({
        attribute: 'usuario_revendedor_id',
        problem: 'Falta identificador do revendedor'
      });
    } else if (!validator.isNumeric('' + ativacao.usuario_revendedor_id)) {
      messages.push({
        attribute: 'usuario_revendedor_id',
        problem: 'Deve ser numérico'
      });
    } else {
      idUsuarioRevendedor = 0 + ativacao.usuario_revendedor_id;
    }

    return Ativacao
      ._validarAtivacao(ativacao, options)
      .then(mensagensComuns => {
        messages.push.apply(messages, mensagensComuns);
        return new Veiculo({ placa: ativacao.placa })
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
          ._validarVeiculo(ativacao, options)
          .then(function(messagesVeiculo) {
            messages.push.apply(messages, messagesVeiculo);
          }))
      .then(() =>
        Ativacao
          ._validarAtivacao(ativacao, options)
          .then(messagesComuns => {
            messages.push.apply(messages, messagesComuns);
          }))
      .then(() => {
        if (!idUsuarioRevendedor) { return messages; }
        return UsuarioRevendedor
          ._buscarPorId(idUsuarioRevendedor, options)
          .then(function(usuRev) {
            if (!usuRev ||
                math.cmp(
                  usuRev.related('revendedor')
                    .related('conta').get('saldo'),
                  ativacao.valor) < 0) {
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
          .andWhere('ativacao.data_ativacao', '>=',
            moment().subtract(60, 'minutes').calendar())
          .andWhere('veiculo.placa', '=', placa)
          .select('ativacao.*')
          .select('veiculo.*');
      })
      .fetch(options);
  }
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

module.exports = Ativacao;
