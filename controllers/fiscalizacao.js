module.exports = function(app) {
	var AreaAzul = require('areaazul');
    var Fiscalizacao = AreaAzul.models.fiscalizacao;

    return {
        registrar: function(req, res) {
        	console.log('fiscalizacao-registrar-body');
        	console.dir(req.body);
            Fiscalizacao.cadastrar({
            	fiscal: req.body.fiscal,
  				senha: req.body.senha,
  				placa: req.body.placa,
  				latitude: req.body.latitude,
  				longitude: req.body.longitude },
                function(result) {
                    console.log("Cadastrado com sucesso!!! id=" + result.id);
                    res.status(200).end();
                },
                function(result) {
                    console.log("Erro ao salvar: " + result);
                    res.status(400).send("" + result).end();
                })
        }
    }
}
