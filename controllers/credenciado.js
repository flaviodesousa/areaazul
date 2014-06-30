module.exports = function(app) {
    var credenciadoController = {
        index: function(req, res) {
            res.render('credenciado/index');
        }
    }
    return credenciadoController;
}