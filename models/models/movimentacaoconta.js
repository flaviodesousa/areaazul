'use strict';

var Bookshelf = require('bookshelf').conexaoMain;
var _ = require('lodash');
var Conta = require('./conta');
var math = require('mathjs');

var MovimentacaoConta = Bookshelf.Model.extend({
    tableName: 'movimentacao_conta',
    idAttribute: 'id_movimentacao_conta'
},{

_inserirMovimentacaoConta: function(movimentacaoconta, options){
      var optionsInsert = _.merge({}, options || {}, {method: 'insert'});

      return MovimentacaoConta.forge({
             data_deposito: new Date(),
             historico: movimentacaoconta.historico,
             tipo: movimentacaoconta.tipo,
             valor: movimentacaoconta.valor,
             ativo: true,
             conta_id: movimentacaoconta.conta_id,
             pessoa_id: movimentacaoconta.pessoa_id,
        })
        .save(null, optionsInsert)
        .then(function(mc){
          return mc;
        });

},

_inserirCredito: function(conta, options){
  var optionsUpdate = { transacting: options, method: 'update', patch: true };
  var movimentacaoconta;

  return Conta
  .forge({pessoa_id: conta.pessoa_id})
  .fetch()
  .then(function(c){
    var saldoAtual = 0, novoSaldo = 0;
    saldoAtual = Number(c.get('saldo'));
    novoSaldo = math.sum(saldoAtual,conta.valor);

    if(c != null){
       return c.save({ saldo: novoSaldo},optionsUpdate)
        .then(function(c){
          return MovimentacaoConta._inserirMovimentacaoConta({
             tipo: 'atualizar saldo',
             valor: conta.valor,
             conta_id: c.id,
             historico: 'Inserção de credito',
             pessoa_id: c.get('pessoa_id'),
          },options)
          .then(function(mc) {
              movimentacaoconta = mc;
              return mc;
          });
        });
    }else{
      throw new Error('Conta não encontrada!!!');
    }
   
    })
    .then(function() {
        return movimentacaoconta;
    });
},


_creditarValor: function(conta, options){
  var optionsUpdate =  {transacting: options, method: 'update', patch: true };
  var movimentacaoconta;

  return Conta
  .forge({pessoa_id: conta.pessoa_id})
  .fetch()
  .then(function(c){
    var saldoAtual = 0; 
    var novoSaldo = 0;

    saldoAtual = Number(c.get('saldo'));
    novoSaldo = math.subtract(saldoAtual,conta.valor);

    if(c != null){
      return c.save({ saldo: novoSaldo},optionsUpdate)
      .then(function(){
        return MovimentacaoConta.
           _inserirMovimentacaoConta({
             tipo: 'atualizar saldo',
             valor: conta.valor,
             conta_id: c.id,
             historico: 'Inserção de credito',
             pessoa_id: c.get('pessoa_id'),
        }, options)
        .then(function(mc){
            movimentacaoconta = mc;
            return mc;
        });
      });
    }else{
      throw new Error('Conta não encontrada!!!');
    }
    })
    .then(function() {
        return movimentacaoconta;
    });
}

});

module.exports = MovimentacaoConta;