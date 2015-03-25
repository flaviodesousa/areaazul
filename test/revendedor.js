var AreaAzul = require('../areaazul');
var should = require('should');
var Revendedor = AreaAzul.models.revendedor;

describe('model.revendedor', function() {

	describe('buscarRevendedor()', function() {
		it('retorna um revendedor', function(done) {
			var revendedor = { id_usuario : 53}
			Revendedor.buscarRevendedor(revendedor,
				function(model) {
					console.log("caiu aq 1");
					model.should.not.empty;
					done();
				},
				function(err) {
					console.log("caiu aq 2");
					done(err);
				});
		});
	});

});