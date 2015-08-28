'use strict';

var should = require('chai').should();
var TestHelpers = require('../helpers/test');
var AreaAzul = require('../areaazul');
var Ativacao = AreaAzul.models.ativacao;
var UsuarioRevendedor = AreaAzul.models.UsuarioRevendedor;
var Veiculo = AreaAzul.models.Veiculo;
var Usuario = AreaAzul.models.Usuario;
var Estado = AreaAzul.models.Estado;
var Revendedor = AreaAzul.models.Revendedor;

describe('model.Ativacao', function() {

    var idUsuarioComum = null;
    var idVeiculo = null;
    var idEstado = null;
    var idUsuarioRevendedor = null;
    var idPreExistenteAtivacao = null;
    var idAtivacao = null;

    var cpfNaoExistente = 'revendedor-teste-nao-existente';
    var loginRevendedorNaoExistente = 'revendedor-nao-existente';

    var loginUsuarioComPreExistente = 'usuario-pre-existente';
    var cpfUsuarioComumPreExistente = 'usuario-comum-test';

    var estadoTeste = null;
    var placaTeste = 'TES1234';
    var marcaTeste = 'Marca-teste-veiculo';
    var modeloTeste = 'Modelo-teste-veiculo';
    var corTeste = 'Cor Teste';
    var anoFabricadoTeste = '2015';
    var anoModeloTeste = '2015';

    var estadoTesteNome = 'Estado';
    var estadoTesteUf = 'UF';

    var cpfPreExistente = '22258141710';
    var nomeTeste = 'teste';
    var emailTeste = 'teste@example.com';
    var telefoneTeste = '000 0000-0000';
    var data_nascimentoTeste = new Date(1981, 11, 13);
    var contatoTeste = 'contato-teste';
    var loginTeste = 'teste-usuario';
    var nomeFantasiaTeste = 'nome-fantasia-teste';
    var nomeEmpresa = 'nome-teste';
    var senhaTeste = 'senha-teste';
    var revendedorId = null;


    function apagarDadosDeTeste() {
        return TestHelpers.apagarAtivacaoId(idAtivacao)
            .then(function() {
               TestHelpers.apagarRevendedorPessoPorIdentificador(cpfPreExistente, null);
            });
    }

    before(function(done) {
        var usuario;
        apagarDadosDeTeste()
            .then(function() {
              return Revendedor.cadastrar({
                    nome: nomeTeste,
                    email: emailTeste,
                    celular: telefoneTeste,
                    cpf: cpfPreExistente,
                    data_nascimento: data_nascimentoTeste,
                    autorizacao: 'autorizacao',
                    login: loginTeste,
                    senha: senhaTeste,
                  });
            })
            .then(function(revenda) {
                idUsuarioRevendedor = revenda.id;
            })
            .then(function() {
                return Usuario
                    .forge({
                        login: loginUsuarioComPreExistente
                    })
                    .fetch()
                    .then(function(u) {
                        if (u) {
                            return u;
                        }
                        return Usuario.cadastrar({
                            login: loginUsuarioComPreExistente,
                            nome: 'Usuario Teste',
                            email: 'usuario-teste@example.com',
                            cpf: cpfUsuarioComumPreExistente,
                        });
                    });
            })
            .then(function(user) {
                usuario = user;
                idUsuarioComum = user.id;
            })
            .then(function() {
                return Estado
                    .forge({
                        uf: estadoTesteUf
                    })
                    .fetch()
                    .then(function(e) {
                        if (e) {
                            return e;
                        }
                        return Estado.cadastrar({
                            nome: estadoTesteNome,
                            uf: estadoTesteUf,
                        });
                    });
            })
            .then(function(estado) {
                idEstado = estado.id;
            })
            .then(function() {
                return Veiculo
                    .forge({
                        placa: placaTeste
                    })
                    .fetch()
                    .then(function(v) {
                        if (v) {
                            return v;
                        }
                        return Veiculo._cadastrar({
                            estado_id: estadoTeste,
                            placa: placaTeste,
                            marca: marcaTeste,
                            modelo: modeloTeste,
                            cor: corTeste,
                            ano_fabricado: anoFabricadoTeste,
                            ano_modelo: anoModeloTeste,
                            usuario_pessoa_id: idUsuarioComum,
                        });
                    });
            })
            .then(function(veiculo) {
                idVeiculo = veiculo.id;
            })
            .then(function() {
                done();
            })
            .catch(function(e) {
                done(e);
            });
    });

    describe('Ativar()', function() {
        it('grava ativacao', function(done) {
            var ativacao = {
                usuario_pessoa_id: idUsuarioComum,
                veiculo_id: idVeiculo,
                valor: 10.0,
            };

            Ativacao
                .ativar(ativacao)
                .then(function(at) {
                    should.exist(at);
                    should.exist(at.id);
                    idAtivacao = at.id;
                    done();
                })
                .catch(function(e) {
                    done(e);
                });
        });
    });



    describe('desativar()', function() {
        it('falha para ativacao inexistente', function(done) {
            Ativacao
                .desativar({
                    id_ativacao: 0,
                    usuario_pessoa_id: idUsuarioComum,
                })
                .then(function() {
                    done('Nao deveria ter desativado uma ativacao inexistente');
                })
                .catch(function(e) {
                    should.exist(e);
                    done();
                });
        });
        it('falha se usuario diferente do ativador', function(done) {
            Ativacao
                .desativar({
                    id_ativacao: idAtivacao,
                    usuario_pessoa_id: 0,
                })
                .then(function() {
                    done('Nao deveria ter desativado com usuario diferente');
                })
                .catch(function(e) {
                    should.exist(e);
                    done();
                });
        });
        it('desativa ativacao existente', function(done) {
            Ativacao
                .desativar({
                    id_ativacao: idAtivacao,
                    usuario_pessoa_id: idUsuarioComum,
                })
                .then(function() {
                    done();
                })
                .catch(function(e) {
                    done(e);
                });
        });
    });

    describe('ativarPelaRevenda()', function() {
        it('grava ativacao', function(done) {
            Ativacao
                .ativarPelaRevenda({
                    veiculo_id: idVeiculo,
                    usuario_pessoa_id: idUsuarioRevendedor,
                    placa: placaTeste,
                    valor: 10.0,
                })
                .then(function(at) {
                    should.exist(at);
                    should.exist(at.id);
                    idAtivacao = at.id;
                    done();
                })
                .catch(function(e) {
                    done(e);
                });
        });
    });

    after(function(done) {
        apagarDadosDeTeste()
        .then(function() {
            done();
        })
        .catch(function(e) {
            done(e);
        });
    });
});