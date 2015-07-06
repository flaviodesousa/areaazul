var Bookshelf = require('bookshelf').conexaoMain;
var _ = require('lodash');
var Conta = require('./conta');
var math = require('mathjs');

var MovimentacaoConta = Bookshelf.Model.extend({
    tableName: 'movimentacao_conta',
    idAttribute: 'id_movimentacao_conta'
},{

inserirCredito: function(conta){

 return Bookshelf.transaction(function(t) {
  var options = { transacting: t };
  var optionsInsert = _.merge({}, options || {}, {method: 'insert'});
  var optionsUpdate = { transacting: t, method: 'update', patch: true };
  var movimentacaoconta;


  return Conta
  .forge({pessoa_id: conta.pessoa_id})
  .fetch()
  .then(function(c){
    var saldoAtual = 0, novoSaldo = 0;
    saldoAtual = c.get('saldo');
    novoSaldo = math.sum(saldoAtual,conta.valor);
    console.log("Novo saldo"+novoSaldo);
    if(c != null){
      return c.save({ saldo: novoSaldo},optionsUpdate)
      .then(function(){
         console.log("passei aq 2");
        return MovimentacaoConta
          .forge({
             data_deposito: new Date(),
             historico: conta.historico,
             tipo: 'atualizar saldo',
             valor: conta.valor,
             ativo: true,
             conta_id: c.id,
             historico: 'Inserção de credito',
             pessoa_id: c.get('pessoa_id'),
        })
        .save(null, optionsInsert)
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
});
}
});

module.exports = MovimentacaoConta;