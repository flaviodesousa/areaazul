var passport = require('passport');

module.exports = function(app) {
    app.post("/fiscalizacao",
      passport.authenticate('basic', { session: false }),
      app.controllers.fiscalizacao.registrar);
    app.get('/fiscalizacao',
      passport.authenticate('basic', { session: false }),
      app.controllers.fiscalizacao.listar);
}
