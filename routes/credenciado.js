module.exports = function(app) {
    var credenciado = app.controllers.credenciado;
    app.get("/credenciado", credenciado.index);
}