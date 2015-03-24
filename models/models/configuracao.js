var Bookshelf = require('bookshelf').conexaoMain;
var util = require('./util');

var Configuracao = Bookshelf.Model.extend({
    tableName: 'configuracao',
    idAttribute: 'id_configuracao'
});

exports.Configuracao = Configuracao;

var ConfiguracaoCollection =  Bookshelf.Collection.extend({
    model: Configuracao
});

exports.cadastrar = function(configuration, then, fail){
    var configuracao = new this.Configuracao({
         'tempo_limite_estacionamento': configuration.tempo_limite_estacionamento,
         'tempo_maximo': configuration.tempo_maximo,
         'tempo_tolerancia': configuration.tempo_tolerancia,
         'valor_unitario': configuration.valor_unitario,
         'comissao_credenciado': configuration.comissao_credenciado,
         'comissao_revendedor': configuration.comissao_revendedor, 
         'ativo': 'true'
    });

    configuracao.save().then(function(model){
            then(model);
    }).catch(function(err){
            fail(err);
    });
}

exports.listar = function(then, fail) {
    ConfiguracaoCollection.forge().query(function(qb) {
        qb.select('configuracao.*')
    }).fetch().then(function(collection) {
        util.log(collection.models);
        then(collection);
    }).catch(function(err){
        fail(err);
    });
}

exports.procurar = function(configuration, then, fail){

    Configuracao.forge().query(function(qb){
        qb.where('configuracao.id_configuracao', configuration.id_configuracao);
        qb.select('configuracao.*');
    }).fetch().then(function(model) {
        util.log(model);
        then(model);
    }).catch(function(err){
        fail(err);
    });
}

exports.editar = function(configuration, then, fail){

  new this.Configuracao({
       id_configuracao : configuration.id_configuracao,
  }).fetch().then(function(model){
    model.save(configuration).then(function(model){
          util.log(model);
          then(model);
      }).catch(function(err){
         fail(err);
      });
  }).catch(function(err){
         fail(err);
  });
}

exports.desativar = function(configuration, then, fail){
  new this.Configuracao({
       id_configuracao : configuration.id_configuracao,
  }).fetch().then(function(model){
    model.save(configuration).then(function(model){
        then(model);
    }).catch(function(err){
        fail(err);
    });
  }).catch(function(err){
        fail(err);
  });
}

