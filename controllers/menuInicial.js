module.exports = function(app){
	var menuController = {
		index: function(req, res){
			res.render('menuInicial/index');
		}
	}
	return menuController;
}