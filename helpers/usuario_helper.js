/**
 * Logica comum a todos usuários
 * Created by flavio on 9/4/16.
 */

'use strict';

const AU = require('areaazul-utils');

const Bookshelf = require('../database');

const PessoaFisica = Bookshelf.model('PessoaFisica');

module.exports._camposValidos = function(campos, usuario, ModelClass, options) {
  let messages = [];
  let usuarioComEsteLogin;

  if (!AU.isTexto(campos.login)) {
    messages.push({
      attribute: 'login',
      problem: 'Login é obrigatório!'
    });
  } else if ((campos.login.length < 4) || (campos.login.length > 32)) {
    messages.push({
      attribute: 'login',
      problem: 'O nome de login deve conter de 4 a 32 caracteres'
    });
  }

  if (!AU.isTexto(campos.nova_senha)) {
    messages.push({
      attribute: 'nova_senha',
      problem: 'Senha é obrigatória!'
    });
  } else if (campos.nova_senha !== campos.conf_senha) {
    messages.push({
      attribute: 'conf_senha',
      problem: 'As senhas devem ser iguais!'
    });
  } else if (campos.nova_senha.length < 8) {
    messages.push({
      attribute: 'nova_senha',
      problem: 'A nova senha deve conter no minimo 8 caracteres!'
    });
  }

  return new ModelClass({ login: campos.login })
    .fetch(options)
    .then(function(ucel) {
      usuarioComEsteLogin = ucel;
      if (usuarioComEsteLogin) {
        // Se já existe usuário com este login e:
        // - não há usuário corrente
        // - usuário encontrado é diferente do usuário corrente
        // Então:
        // - login já em uso
        if (!usuario || usuario && usuario.id !== usuarioComEsteLogin.id) {
          messages.push({
            attribute: 'login',
            problem: 'login já em uso!'
          });
        }
      }
      return PessoaFisica
        ._camposValidos(campos, options);
    })
    .then(function(messagesPessoaFisica) {
      messages.push.apply(messages, messagesPessoaFisica);
    })
    .then(function() {
      return PessoaFisica
        ._buscarPorCPF(campos.cpf, options);
    })
    .then(function(pessoaFisica) {
      if (pessoaFisica) {
        if (!usuario) {
          return new ModelClass({ id: pessoaFisica.id })
            .fetch(options)
            .then(function(modelComMesmoIDquePF) {
              if (modelComMesmoIDquePF) {
                messages.push({
                  attribute: 'cpf',
                  problem: 'Já ha usuário com este CPF!'
                });
              }
            });
        }
        if (usuario.id !== pessoaFisica.id) {
          messages.push({
            attribute: 'cpf',
            problem: 'CPF já em uso por outro usuário!'
          });
        }
        // Else:
        // Caso válido:
        // - usuario.id === pessoaFisica.id: mesmo cpf
      }
      // Else:
      // Caso válido:
      // - !pessoaFisica: cpf ainda não usado
    })
    .then(() => messages);

};
