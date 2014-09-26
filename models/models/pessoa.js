var Bookshelf = require('bookshelf').conexaoMain;
var PesquisaPessoa = require("./pessoa");
var validator = require("validator");

var Pessoa = Bookshelf.Model.extend({
    tableName: 'pessoa',
    idAttribute: 'id_pessoa'
});

exports.Pessoa = Pessoa;

exports.validate = function(pessoa) {
    if (validator.isNull(pessoa.attributes.nome) == true || pessoa.attributes.nome == '') {
        console.log("Nome obrigatório");
        return false;
    } else if (validator.isNull(pessoa.attributes.telefone) == true || pessoa.attributes.telefone == '') {
        console.log("Telefone obrigatório");
        return false;
    } else if (validator.isNull(pessoa.attributes.email) == true || pessoa.attributes.email == '') {
        console.log("Email obrigatório: " + pessoa.attributes.email);
        return false;
    } else if (validator.isEmail(pessoa.attributes.email) == false) {
        console.log("Email inválido");
        return false;
    }
    return true;
}

exports.saveTransaction = function(entidade1, entidade2, entidade3, func){
        Bookshelf.transaction(function(t) {
            entidade1.save(null, {
                transacting: t
            }).
            then(function(entidade1) {
                console.log(entidade1);
                entidade2.save({
                    pessoa_id: entidade1.id,
                }, {
                    transacting: t
                }).then(function(model, err) {

                    console.log("Model"+model);
                    entidade3.save({
                        pessoa_id: entidade1.id,
                    }, {
                        transacting: t
                    }).then(function(model, err) {
                          console.log("Commit");
                        t.commit();
                    }),
                    function() {
                        t.rollback();
                           console.log("rollback");
                        func(false);
                    }
                });
            });
        }).then(function(model) {
             console.log("Passei aq");
             func(true);
        }, function() {
            console.log("Ocorreu erro");
            func(false);
        });
}

exports.updateTransaction = function(entidade1, entidade2, entidade3, func){
  Bookshelf.transaction(function(t) {
            entidade1.save(null, {
                transacting: t
            }).
            then(function(entidade1) {
                console.log(entidade1);
                entidade2.save({
                    pessoa_id: entidade1.id,
                }, {
                    transacting: t
                },{patch: true}
                ).then(function(model, err) {
                    console.log("Model"+model);
                    entidade3.save({
                        pessoa_id: entidade1.id,
                    }, {
                        transacting: t
                    }, {patch: true}
                    ).then(function(model, err) {
                          console.log("Commit");
                        t.commit();
                    }),
                    function() {
                        t.rollback();
                           console.log("rollback");
                        func(false);
                    }
                });
            });
        }).then(function(model) {
             console.log("Passei aq");
             func(true);
        }, function() {
            console.log("Ocorreu erro");
            func(false);
        });
}

exports.transaction = function(entidade1, entidade2, entidade3, entidade4, func){
        Bookshelf.transaction(function(t) {
            entidade1.save(null, {
                transacting: t
            }).
            then(function(entidade1) 
            {
                console.log(entidade1);
                entidade2.save({
                    pessoa_id: entidade1.id,
                }, {
                    transacting: t
                }).then(function(model, err) {

                    console.log("Model"+model);
                    entidade3.save({
                        pessoa_id: entidade1.id,
                    }, {
                        transacting: t
                    }).then(function(model, err) {


                        entidade4.save({
                            pessoa_id: entidade1.id,
                        }, {
                            transacting: t
                        }).then(function(model, err) {
                              console.log("Commit");
                              t.commit();
                        }),
                        function() {
                            t.rollback();
                               console.log("rollback");
                            func(false);
                        }
                    });
                });
            });

        }).then(function(model) {
             console.log("Passei aq");
             func(true);
        }, function() {
            console.log("Ocorreu erro");
            func(false);
        });
}

exports.transactionUpdate = function(entidade1, entidade2, entidade3, entidade4, func){
 
        Bookshelf.transaction(function(t) {
            entidade1.save(null, {
                transacting: t
            }).
            then(function(entidade1) 
            {
                console.log(entidade1);
                entidade2.save({
                    pessoa_id: entidade1.id,
                }, {
                    transacting: t
                }, {patch: true}).then(function(model, err) {

                    console.log("Model"+model);
                    entidade3.save({
                        pessoa_id: entidade1.id,
                    }, {
                        transacting: t
                    }, {patch: true}).then(function(model, err) {


                        entidade4.save({
                            pessoa_id: entidade1.id,
                        }, {
                            transacting: t
                        }, {patch: true}).then(function(model, err) {
                              console.log("Commit");
                              t.commit();
                        }),
                        function() {
                            t.rollback();
                               console.log("rollback");
                            func(false);
                        }
                    });
                });
            });

        }).then(function(model) {
             console.log("Passei aq");
             func(true);
        }, function() {
            console.log("Ocorreu erro");
            func(false);
        });
}