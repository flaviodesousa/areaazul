'use script';

var Pessoa = require('./pessoa').Pessoa;
var PessoaFisica = require('./pessoafisica').PessoaFisica;
var Bookshelf = require('bookshelf').conexaoMain;
var bcrypt = require('bcrypt');
var util = require('../../helpers/util');
var validator = require('validator');
var _ = require('lodash');
var AreaAzul = require('../../areaazul.js');
var log = AreaAzul.log;
var validation = require('./validation');


var UsuarioRevendedor = Bookshelf.Model.extend({
    tableName: 'usuario_revendedor',
    idAttribute: 'pessoa_fisica_pessoa_id',
    pessoaFisica: function() {
        return this.hasOne(PessoaFisica, 'pessoa_id');
    }
}, {
    autorizado: function(login, senha) {
        var UsuarioRevendedor = this;
        var err;
        return UsuarioRevendedor
            .forge({
                login: login
            })
            .fetch()
            .then(function(usuarioRevenda) {
                if (usuarioRevenda === null) {
                    err = new AreaAzul.BusinessException(
                        'UsuarioRevendedor: login invalido', {
                            login: login
                        });
                    log.warn(err.message, err.details);
                    throw err;
                }
                if (util.senhaValida(senha, usuarioRevenda.get('senha'))) {
                    return usuarioRevenda;
                } else {
                    err = new AreaAzul.BusinessException(
                        'UsuarioRevendedor: senha incorreta', {
                            login: login
                        });
                    log.warn(err.message, err.details);
                    throw err;
                }
            });
    },

    cadastrar: function(user_reveller) {
        var Usuario_Revendedor = this;
        var usuario_revendedor = null;

        var senha;
        if (!user_reveller.senha) {
            senha = util.criptografa(util.generate());
        } else {
            senha = util.criptografa(user_reveller.senha);
        }

        return Bookshelf.transaction(function(t) {
                var trx = {
                    transacting: t
                };
                var trxIns = _.merge({}, trx, {
                    method: 'insert'
                });


                return UsuarioRevendedor
                    .validarUsuarioRevenda(user_reveller)
                    .then(function(messages) {
                        if (messages.length) {
                            throw new AreaAzul
                                .BusinessException(
                                    'Nao foi possivel cadastrar nova Revenda. Dados invalidos',
                                    messages);
                        }
                        console.dir(messages);
                        return messages;
                    })
                    .then(function() {
                        return PessoaFisica
                            .forge({
                                cpf: user_reveller.cpf
                            })
                            .fetch()
                            .then(function(pessoaFisica) {
                                // Se pessoa fisica ja' existir, conectar a ela
                                if (pessoaFisica !== null) {
                                    return pessoaFisica;
                                }
                                // Caso nao exista, criar a pessoa fisica
                                return PessoaFisica
                                    ._cadastrar(user_reveller, trx);
                            })
                    })
                    .then(function(pessoaFisica) {
                        console.log("user_reveller" + user_reveller.login);
                        return Usuario_Revendedor
                            .forge({
                                login: user_reveller.login,
                                senha: senha,
                                acesso_confirmado: false,
                                ativo: true,
                                autorizacao: user_reveller.autorizacao,
                                revendedor_id: user_reveller.revendedor_id,
                                pessoa_fisica_pessoa_id: pessoaFisica.get('pessoa_id'),
                            })
                            .save(null, trxIns);
                    })
                    .then(function(u_r) {
                        usuario_revendedor = u_r;
                        return u_r;
                    });
            })
            .then(function() {
                return usuario_revendedor;
            });
    },
    search: function(entidade, func) {
        entidade.fetch().then(function(model, err) {
            if (model !== null)
                var retorno = model.attributes;
            if (err) {
                return func(null);
            }
            func(retorno);
        });
    },

    alterarSenha: function(user, then, fail) {
        new this.Usuario_Revendedor({
            id_usuario_revendedor: user.id_usuario_revendedor
        }).fetch().then(function(model) {
            //   console.log("model"+model.attributes);
            console.log("model" + model);
            if (model !== null) {
                var pwd = model.attributes.senha;
            }
            var hash = bcrypt.compareSync(user.senha, pwd);

            if (hash !== false) {
                var new_senha = util.criptografa(user.nova_senha);

                model.save({
                    primeiro_acesso: 'false',
                    senha: new_senha,
                    ativo: 'true'
                }).then(function(model) {
                    then(model);
                }).catch(function(err) {
                    fail(err);
                });
            } else {
                fail();
            }
        }).catch(function(err) {
            fail(err);
        });
    },

    procurar: function(id, func) {
        UsuarioRevendedor.forge()
            .query(function(qb) {
                qb
                    .distinct()
                    .innerJoin('pessoa_fisica', function() {
                        this.on('pessoa_fisica.pessoa_id', '=', 'usuario_revendedor.pessoa_fisica_pessoa_id');
                    })
                    .innerJoin('pessoa', function() {
                        this.on('pessoa.id_pessoa', '=', 'pessoa_fisica.pessoa_id');
                    })
                    .where('usuario_revendedor.pessoa_fisica_pessoa_id', id)
                    .select('pessoa_fisica.*')
                    .select('pessoa.*')
                    .select('usuario_revendedor.*');
                    console.log('sql' + qb);
            }).fetch().then(function(model) {
                util.log(model);
                func(model);
            });
    },


validarSenha: function(user) {
    var message = [];
    if (user.nova_senha === null || user.nova_senha === '') {
        message.push({
            attribute: 'nova_senha',
            problem: "Nova senha é obrigatório!"
        });
    }
    if (user.senha === null || user.senha === '') {
        message.push({
            attribute: 'senha',
            problem: "Senha é obrigatório!"
        });
    }
    if (user.conf_senha === null || user.conf_senha === '') {
        message.push({
            attribute: 'conf_senha',
            problem: "Confirmação de senha é obrigatório!"
        });
    }
    if (user.nova_senha !== user.conf_senha) {
        message.push({
            attribute: 'nova_senha',
            problem: "As senhas devem ser iguais!"
        });
    }
    if (user.senha.length < 4 && user.senha.length > 8) {
        message.push({
            attribute: 'senha',
            problem: "A senha deve conter no minimo 4 a 8 caracteres!"
        });
    }
    if (user.conf_senha.length < 4 && user.conf_senha.length > 8) {
        message.push({
            attribute: 'conf_senha',
            problem: "A confirmação de senha deve conter no minimo 4 a 8caracteres!"
        });
    }
    if (user.nova_senha.length < 4 && user.nova_senha.length > 8) {
        message.push({
            attribute: 'nova_senha',
            problem: "A nova senha deve conter no minimo 4 a 8 caracteres!"
        });
    }

    for (var i = 0; i < message.length; i++) {
        console.log("Atributo: " + message[i].attribute + " Problem: " + message[i].problem);
    }

    return message;
},
validarSenhaAlteracao: function(user) {
    var message = [];

    if (validator.isNull(user.conf_senha)) {
        message.push({
            attribute: 'nova_senha',
            problem: 'Nova senha é obrigatória!',
        });
    }
    if (validator.isNull(user.senha)) {
        message.push({
            attribute: 'senha',
            problem: 'Senha é obrigatória!',
        });
    }

    if (user.senha.length < 4) {
        message.push({
            attribute: 'senha',
            problem: 'A senha deve conter no minimo 4 caracteres!',
        });
    }

    if (user.conf_senha.length < 4) {
        message.push({
            attribute: 'nova_senha',
            problem: 'A nova senha deve conter no minimo 4 caracteres!',
        });
    }
    if (user.conf_senha !== user.senha) {
        message.push({
            attribute: 'nova_senha, senha',
            problem: 'As senhas devem ser iguais!',
        });
    }
    return message;
},
alterarSenhaRecuperacao: function(user) {
    new this.Usuario_Revendedor({
        pessoa_fisica_pessoa_id: user.pessoa_fisica_pessoa_id,
    })
        .fetch()
        .then(function(model) {
            if (model !== null) {
                var novaSenha = util.criptografa(user.senha);
                model.save({
                    primeiro_acesso: 'false',
                    senha: novaSenha,
                    ativo: 'true',
                }).then(function(model) {
                    then(model);
                }).catch(function(err) {
                    fail(model.attributes);
                });
            } else {
                throw new Error("Não encontrado!!!");
            }
        })
        .catch(function(err) {
            fail(err);
        });
},
buscarPorId: function(id) {
    return UsuarioRevendedor
        .forge({
            pessoa_fisica_pessoa_id: id
        })
        .fetch()
        .then(function(u) {
            if (u) {
                return u;
            }
            var err = new AreaAzul.BusinessException(
                'UsuarioAdministrativo: id nao encontrado', {
                    id: id
                });
            log.warn(err.message, err.details);
            throw err;
        });
},


validarUsuarioRevenda: function(user_reveller) {
    var message = [];

    if (!user_reveller.nome) {
        message.push({
            attribute: 'nome',
            problem: 'Nome obrigatório!',
        });
    }

    if (!user_reveller.email) {
        message.push({
            attribute: 'email',
            problem: 'Email obrigatório!',
        });
    }

    if (!user_reveller.login) {
        message.push({
            attribute: 'login',
            problem: 'Login obrigatório!',
        });
    }

    if (!validator.isEmail(user_reveller.email)) {
        message.push({
            attribute: 'email',
            problem: 'Email inválido!',
        });
    }

    if (!user_reveller.cpf) {
        message.push({
            attribute: 'cpf',
            problem: 'CPF é obrigatório!',
        });

    }

    if (!validation.isCPF(user_reveller.cpf)) {
        message.push({
            attribute: 'cpf',
            problem: 'CPF inválido!',
        });
    }

    return UsuarioRevendedor
        .procurarLogin(user_reveller.login)
        .then(function(usuariorevendedor) {
            if (usuariorevendedor) {
                message.push({
                    attribute: 'login',
                    problem: 'Login já cadastrado!',
                });
            }

            return message;
        });
},
procurarLogin: function(login) {
    return this.forge({
        login: login
    }).fetch();
},


});

module.exports = UsuarioRevendedor;

exports.compareSenha = function(password, pwd) {
    var hash = bcrypt.compareSync(password, pwd);
    return hash;
};