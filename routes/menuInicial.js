var routesUtil = require('../routes/utils')

module.exports = function(app) {
    var menu = app.controllers.menuInicial;
    app.get("/", routesUtil.ensureAuthenticated, menu.index);
}