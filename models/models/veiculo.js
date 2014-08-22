var Bookshelf = require('bookshelf').conexaoMain;

var Veiculo = Bookshelf.Model.extend({
    tableName: 'veiculo',
    idAttribute: 'id_veiculo'
});

exports.Veiculo = Veiculo;

exports.cadastrar = function(vehicle, fail, then){

	var veiculo = new this.veiculo({

       'placa': vehicle.placa,
       'placa_numero': vehicle.placa_numero,
       'marca': vehicle.marca,
       'modelo': vehicle.modelo,
       'cor': vehicle.cor,
       'ano_fabricado': vehicle.ano_fabricacao,
       'ano_modelo': vehicle.ano_modelo,
       'status': 'true'
	});

	veiculo.save().then(function(model, err){
				if(err){
					return fail(false);
				} else {
					return then(true)
				}
	})
}

