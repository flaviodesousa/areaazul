module.exports = function(app) {
    return {
        registrar: function(req, res) {
        	console.log('body');
        	console.dir(req.body);
        	res.status(200).end();
        }
    }
}
