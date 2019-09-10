const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Consulta = new Schema({
    terapeuta: {
        type: Schema.Types.ObjectId,
        ref: "terapeutas",
        required: true
    },
    cliente: {
        type: Schema.Types.ObjectId,
        ref: "hospedes",
        required: true
    },
    servico: {
        type: Schema.Types.ObjectId,
        ref: "servicos",
        required: true
    },
    faturaconsulta: {
        type: Schema.Types.ObjectId,
        ref: "faturasconsultas"
    },
    sala: {
        type: String,
        required: true
    },
    data_consulta: {
        type: Date,
        required: true
    },
    horario: {
        type: String,
        required: true
    },
    horario_termino: {
        type: String
    },
    valor_consulta: {
        type: Number,
        required: true
    },
    fatura: {
        type: Schema.Types.ObjectId,
        ref: "faturas"
    }
    
})

mongoose.model("consultas", Consulta)