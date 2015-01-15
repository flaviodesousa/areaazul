module.exports = function(app) {
    app.post("/fiscalizacao", app.controllers.fiscalizacao.registrar);
}
