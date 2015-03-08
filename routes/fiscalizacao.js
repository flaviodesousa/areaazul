module.exports = function(app) {
    app.post("/fiscalizacao", app.controllers.fiscalizacao.registrar);
    app.get('/fiscalizacao', app.controllers.fiscalizacao.listar);
}
