var routesUtil = require('../routes/utils')

module.exports = function(app) {
    var login = app.controllers.login;
    app.get("/login", login.index);
    app.post("/login", login.autenticar);
}