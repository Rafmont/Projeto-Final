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
    especialidade: {
        type: Schema.Types.ObjectId,
        ref: "especialidades",
        required: true
    },
    acerto: {
        type: Number,
        required: true
        /*
        0: diário
        1: semanal
        2: mensal
        */
    },
    nivel_usuario: {
        type: Number,
        default: 1
        //Padão para terapeuta.
    }
})

mongoose.model("terapeutas", Terapeuta)