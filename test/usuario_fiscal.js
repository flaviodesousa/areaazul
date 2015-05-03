var AreaAzul = require('../areaazul');
var should = require('should');
var Fiscalizacao = AreaAzul.models.fiscalizacao;
var UsuarioFiscal = AreaAzul.models.UsuarioFiscal;
var Pessoa = AreaAzul.models.pessoa.Pessoa;
var PessoaFisica = AreaAzul.models.pessoafisica.PessoaFisica;
var UsuariosFiscais = AreaAzul.collections.UsuariosFiscais;

describe('models.UsuarioFiscal', function () {
  var fiscal_teste = null;
  describe('cadastrar()', function () {

    it('works!', function (done) {
      UsuarioFiscal.cadastrar({
        login: 'fiscal-teste',
        nome: 'Fiscal Teste',
        email: 'fiscal-teste@example.com',
        telefone: '0',
        cpf: 'teste',
        data_nascimento: '1983-04-18',
        sexo: 'feminino'
      }, function (f) {
        fiscal_teste = f;
        console.dir(f);
        done();
      }, function () {
        done('should not fail.');
      });
    });

  });

  after(function () {
    if (fiscal_teste === null) { return; }
    console.log('cleaning up pessoa: ' + fiscal_teste.get('pessoa_id'));
    UsuarioFiscal
      .forge({pessoa_id: fiscal_teste.get('pessoa_id')})
      .destroy()
      .thenReturn();
    PessoaFisica
      .forge({pessoa_id: fiscal_teste.get('pessoa_id')})
      .destroy()
      .thenReturn();
    Pessoa
      .forge({id_pessoa: fiscal_teste.get('pessoa_id')})
      .destroy()
      .thenReturn();
  });
});