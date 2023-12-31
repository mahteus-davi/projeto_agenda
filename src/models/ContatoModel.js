const mongoose = require('mongoose');
const validator = require('validator');
const moment = require('moment');



const ContatoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  sobrenome: { type: String, required: false, default: '' },
  email: { type: String, required: false, default: '' },
  telefone: { type: String, required: false, default: '' },
  minhadata: { type: Date, required: true },
  criadoEm: { type: Date, default: Date.now },
});

const ContatoModel = mongoose.model('Contato', ContatoSchema);

function Contato(body) {
  this.body = body;
  this.errors = [];
  this.contato = null;
}

Contato.prototype.register = async function() {
  this.valida();
  if(this.errors.length > 0) return;
  this.contato = await ContatoModel.create(this.body);
};

Contato.prototype.valida = function() {
  this.cleanUp();

  // Validação
  // O e-mail precisa ser válido
  if(this.body.email && !validator.isEmail(this.body.email)) this.errors.push('E-mail inválido');
  if(!this.body.nome) this.errors.push('Nome é um campo obrigatório.');
  if(!this.body.email && !this.body.telefone) {
    this.errors.push('Pelo menos um contato precisa ser enviado: e-mail ou telefone.');
  }
  if(!this.body.minhadata) this.errors.push('Data e hora é um campo obrigatório.');
  
  

};

Contato.prototype.cleanUp = function() {
  console.log("Data antes da conversão:", this.body.minhadata);
  if (this.body.minhadata) {
    this.body.minhadata = moment(this.body.minhadata).toDate();
  }
  console.log("Data após a conversão:", this.body.minhadata);

  for (const key in this.body) {
    if (typeof this.body[key] !== 'string' && key !== 'minhadata') {
      this.body[key] = '';
    }
  }

  this.body = {
    nome: this.body.nome,
    sobrenome: this.body.sobrenome,
    email: this.body.email,
    telefone: this.body.telefone,
    minhadata: this.body.minhadata,
  };
};



Contato.prototype.edit = async function(id) {
  if(typeof id !== 'string') return;
  this.valida();
  if(this.errors.length > 0) return;
  this.contato = await ContatoModel.findByIdAndUpdate(id, this.body, { new: true });
};

// Métodos estáticos
Contato.buscaPorId = async function(id) {
  if(typeof id !== 'string') return;
  const contato = await ContatoModel.findById(id);
  return contato;
};

Contato.buscaContatos = async function() {
  const contatos = await ContatoModel.find()
    .sort({ criadoEm: -1 });

  // Formate as datas usando o Moment.js
  contatos.forEach(contato => {
    contato.minhadata = moment(contato.minhadata).format('DD/MM/YYYY HH:mm');
  });

  return contatos;
};

Contato.delete = async function(id) {
  if(typeof id !== 'string') return;
  const contato = await ContatoModel.findOneAndDelete({_id: id});
  return contato;
};


module.exports = Contato;