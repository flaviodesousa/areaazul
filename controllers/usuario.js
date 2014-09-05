module.exports = function(app) {

	var AreaAzul = require('areaazul'),
        Usuario = AreaAzul.models.usuario;

    var usuarioController = {
        index: function(req, res) {
            res.render('usuario/index');
        },
        home: function(req, res) {
        
            Usuario.procurar({ id_usuario: value.id_usuario},
            function(result){

                res.render("usuario/home", {value:result.attributes});
                console.log(result.attributes);
                return result;
            })

        },    
    	alterarSenha: function(req, res){
            Usuario.alterarSenha({
                id_usuario: req.body.id_usuario,
                senha: req.body.senha,
                nova_senha: req.body.nova_senha,
                conf_senha: req.body.conf_senha
            },
            function(result) {
                console.log("Alterado com sucesso!!!");
                res.redirect('/usuario');
            },
            function(result) {
                console.log("Erro ao salvar!!!");
                res.redirect('/usuario');
            });
    }
}
    return usuarioController;
}