module.exports = function(app) {
    var revendedor = app.controllers.revendedor;
    var login = app.controllers.login;

    app.get("/revendedor", revendedor.index);
    app.get("/revendedor/pf", revendedor.pessoafisica);
    app.get("/revendedor/pj", revendedor.pessoajuridica);

}