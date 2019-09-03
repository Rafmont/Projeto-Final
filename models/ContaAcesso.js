const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ContaAcesso = new Schema({
    terapeuta: {
        type: Schema.Types.ObjectId,
        ref: "terapeutas",
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "usuarios" 
    },
    login: {
        type: String,
        required: true
    },
    senha: {
        type: String,
        required: true
    },
    nome: {
        type: String,
        required: true
    },
    nivel_usuario: {
        type: Number,
        required: true
        /*
        0: Atendente
        1: Terapeuta
        2: Gerente
        3: Administrador
        */
    }
})

mongoose.model("contasacesso", ContaAcesso)