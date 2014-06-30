module.exports = function(app) {
    var revendedorController = {
        index: function(req, res) {
            res.render("revendedor/index");
        },

        pessoafisica: function(req, res) {
            res.render("revendedor/indexpf");
        },

        pessoajuridica: function(req, res) {
            res.render("revendedor/indexpj");
        }
    }
    return revendedorController;
}