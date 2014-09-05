module.exports = function(app) {
    var usuario = app.controllers.usuario;
    app.get("/usuario", usuario.index);
    app.get('/usuario/home', usuario.home);
    app.get('/usuario/home/:id_usuario', usuario.home);
}