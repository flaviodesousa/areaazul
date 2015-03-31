var Bookshelf = require('bookshelf').conexaoMain;
var Veiculo = require('./veiculo');
var Usuario = require('./usuario');
var util = require('./util');
var Revendedor = require('./revendedor');



var Ativacao = Bookshelf.Model.extend({
    tableName: 'ativacao',
    idAttribute: 'id_ativacao'
});

exports.Ativacao = Ativacao;


exports.ativar = function(activation, then, fail){

    var latitude = activation.latitude;
    var altitude = activation.longitude;
    var longitude = activation.altitude;

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


    ativacao.save().then(function(model) { 
        then(model);
    }).catch(function(err) {
        fail(err);
    });


}

exports.ativarPelaRevenda = function(car, then, fail){

    console.log("usuario"+car.usuario_id);
     console.log("veiculo"+car.veiculo_id);
    var ativacao = new this.Ativacao({
         'data_ativacao': new Date(),
         'usuario_id': car.usuario_id,
         'veiculo_id': car.veiculo_id,
         'ativo': 'true'  
    });

    var usuario = new Usuario.Usuario({
        'id_usuario': car.usuario_id
    });

    console.log(usuario);

    Revendedor.buscarRevendedor(usuario,
        function(result){
            ativacao.save().then(function(model) {
                console.log("sucesso");
                then(model);
            }).catch(function(err) {
                console.log("erro"+err);
                fail(err);
            });
        }, 
        function(result){
            fail(result);
        }
    );

}