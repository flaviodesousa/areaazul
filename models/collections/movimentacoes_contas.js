'use strict';

const Bookshelf = require('../../database');
const MovimentacaoConta = Bookshelf.model('MovimentacaoConta');


const MovimentacoesConta = Bookshelf.Collection.extend({
  model: MovimentacaoConta
}, {
});
Bookshelf.collection('MovimentacoesConta', MovimentacoesConta);

module.exports = MovimentacoesConta;
