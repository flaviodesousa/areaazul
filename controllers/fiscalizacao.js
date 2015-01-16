module.exports = function(app) {
    return {
        registrar: function(req, res) {
        	console.log('body');
        	console.log(req.body);
        	res.status(200).end();
        }
    }
}
