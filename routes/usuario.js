module.exports = function(app) {
    var usuario = app.controllers.usuario;
    var login = app.controllers.login;

    app.get("/usuario", usuario.index);
    app.get('/usuario/home', usuario.home);
  	app.post('/usuario/alteracao_senha/:id_usuario',usuario.alterarSenha);

}


