module.exports = function(app){
	var menu = app.controllers.menuInicial;
	app.get("/", menu.index);
}