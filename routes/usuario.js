module.exports = function(app) {
    var usuario = app.controllers.usuario;
    app.get("/usuario", usuario.index);
}