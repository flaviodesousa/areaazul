module.exports = function(app) {
    return {
        registrar: function(req, res) {
        	console.log('body');
        	console.dir(req.body);
            Fiscalizacao.cadastrar({
            	fiscal: req.body.fiscal,
  				senha: req.body.senha,
  				placa: req.body.placa,
  				latitude: req.body.latitude,
  				longitude: req.body.longitude },
                function(result) {
                    console.log("Cadastrado com sucesso!!!");
                    res.status(200).end();
                },
                function(result) {
                    console.log("Erro ao salvar!!!");
                    res.status(400).end();
                })
        }
    }
}
