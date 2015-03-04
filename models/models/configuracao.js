var Bookshelf = require('bookshelf').conexaoMain;
var util = require('./util');
var ConfiguracaoCollection = require('../collections/configuracao');

var Configuracao = Bookshelf.Model.extend({
    tableName: 'configuracao',
    idAttribute: 'id_configuracao'
});

exports.Configuracao = Configuracao;


exports.cadastrar = function(configuration, then, fail){


    var configuracao = new this.Configuracao({
    	 'tempo_limite': configuration.tempo_limite,
     	 'tempo_maximo': configuration.tempo_maximo,
     	 'tempo_tolerancia': configuration.tempo_tolerancia,
     	 'valor_unitario': configuration.valor_unitario,
     	 'comissao_credenciado': configuration.comissao_credenciado,
     	 'comissao_revendedor': configuration.comissao_revendedor, 
         'ativo': 'true'
    });

    console.log(configuracao);
    configuracao.save().then(
    function(model)
    {
        if(model != null){
            then(true);
            util.log("Salvo com sucesso!!!");
        }
       
    }, function(){
        fail(false);
        util.log("Erro ao salvar!!!"); 
    });


}

exports.listar = function(func)
 {
    ConfiguracaoCollection.forge().query(function(qb){
         qb.where('configuracao.ativo','=','true');
         qb.select('configuracao.*');
    }).fetch().then(function(collection) {
        util.log(collection.models);
        func(collection);
    }); 
}
/*
exports.listar =  function(func){
	var configuracoes = ConfiguracaoCollection.Configuracao().fecth().then(
		function(collection){
    		util.log(collection.models);
        	func(collection);
		});

}*/
