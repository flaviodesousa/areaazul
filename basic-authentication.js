// basic-authentication.js
module.exports = function(username, password, done) {
  process.nextTick(function() {
    console.log('u=' + username + '/p=' + password)
    if (username === "valido") {
      return done(null, { username: username, id: 1 });
    }
    return done("usuario não é valido");
  });
};