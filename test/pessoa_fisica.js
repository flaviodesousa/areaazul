'use strict';

var should = require('chai').should();

const AreaAzul = require('../areaazul');
const Bookshelf = AreaAzul.db;
var Pessoa = Bookshelf.model('Pessoa');
var PessoaFisica = Bookshelf.model('PessoaFisica');

describe('models.PessoaFisica', function() {
    var cpfTeste = 'teste-pf';

    function deleteTestData(done) {
        var pessoaId = null;
        PessoaFisica
            .forge({
                cpf: cpfTeste
            })
            .fetch()
            .then(function(pf) {
                if (pf) {
                    pessoaId = pf.id;
                    return pf.destroy();
                }
            })
            .then(function() {
                if (pessoaId !== null) {
                    return Pessoa
                        .forge({
                            id_pessoa: pessoaId
                        })
                        .destroy();
                }
            })
            .then(function() {
                return done();
            })
            .catch(function(e) {
                done(e);
            });
    }

    before(deleteTestData);

    describe('cadastrar()', function() {

        it('funciona!', function(done) {
            PessoaFisica.cadastrar({
                nome: 'PF preexistente',
                email: 'preexistente@example.com',
                telefone: '0',
                cpf: cpfTeste,
                data_nascimento: new Date(1981, 11, 13),
                sexo: 'feminino',
            })
                .then(function(pf) {
                    should.exist(pf);
                    should.exist(pf.attributes);
                    should.exist(pf.attributes.cpf);
                    pf.attributes.cpf.should.be.equal(cpfTeste);
                    done();
                })
                .catch(function(e) {
                    done(e);
                });
        });

    });
    describe('buscarPessoaFisica()', function() {
        it.skip('funciona!', function(done) {
            PessoaFisica.buscarPessoaFisica(cpfTeste)
                .then(function() {
                    done();
                })
                .catch(function(err) {
                    should.exist(err);
                    err.should.be.an.instanceof(BusinessException);
                    err.should.have.property(
                        'message',
                        'UsuarioRevendedor: cpf nao encontrado');
                    done();
                });
        });

    });
    after(deleteTestData);
});
