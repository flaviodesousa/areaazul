module.exports = function(app) {

	var AreaAzul = require('areaazul'),
        Usuario = AreaAzul.models.usuario;

    var usuarioController = {
        index: function(req, res) {
            res.render('usuario/index');
        },

        home: function(req, res){
            res.render('usuario/home', {value:user.attributes});
        },   
    	alterarSenha: function(req, res){
            Usuario.alterarSenha({
                id_usuario: req.body.id_usuario,
                login: req.body.login,
                senha: req.body.senha,
                nova_senha: req.body.nova_senha,
                conf_senha: req.body.conf_senha
            },
            function(result) {
                console.log("Alterado com sucesso!!!");
                res.redirect('usuario/index');
            },
            function(result) {
                console.log("Erro ao salvar!!!");
                res.redirect('usuario/index');
            });
    }
}
    return usuarioController;
}