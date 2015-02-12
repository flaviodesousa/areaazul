var Bookshelf = require('bookshelf').conexaoMain;
var Veiculo = require('./veiculo');
var Usuario = require('./usuario');
var util = require('./util');



var Ativacao = Bookshelf.Model.extend({
    tableName: 'ativacao',
    idAttribute: 'id_ativacao'
});

exports.Ativacao = Ativacao;


exports.ativar = function(activation, then, fail){

    var latitude = activation.latitude;
    var altitude = activation.longitude;
    var longitude = activation.altitude;


    console.log('latitude: '+latitude);
    if(latitude == ""){
        latitude = 0;
    } 
    if(longitude == ""){
        longitude = 0;
    }
    if(altitude == ""){
        altitude = 0;
    }

    var ativacao = new this.Ativacao({
         'data_ativacao': new Date(),
         'latitude': latitude,
         'longitude': longitude,
         'altitude': altitude,
         'usuario_id': activation.usuario_id,
         'veiculo_id': activation.veiculo_id,
         'ativo': 'true'
    });

    console.log(ativacao);
    ativacao.save().then(
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


  