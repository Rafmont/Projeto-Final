const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Terapeuta = new Schema({
    nome: {
        type: String,
        required: true
    },
    data_nascimento: {
        type: Date,
        required: true
    },
    rg: {
        type: String,
        required: true
    },
    cpf: {
        type: String,
        required: true
    },
    telefone_1: {
        type: String,
        required: true
    },
    telefone_2: {
        type:String
    },
    email: {
        type: String,
    },
    senha: {
        type: String,
    },
    acerto: {
        type: String,
    },
    nivel_usuario: {
        type: Number,
        default: 1
    }
})

mongoose.model("terapeutas", Terapeuta)