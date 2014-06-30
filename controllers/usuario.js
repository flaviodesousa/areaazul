module.exports = function(app) {
    var usuarioController = {
        index: function(req, res) {
            res.render('usuario/index');
        }
    }
    return usuarioController;
}