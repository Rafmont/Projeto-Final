const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Estadia = new Schema({
    quarto: {
        type: Schema.Types.ObjectId,
        ref: "quartos",
        required: true
    },
    hospede: {
        type: Schema.Types.ObjectId,
        ref: "hospedes",
        required: true
    },
    fatura: {
        type: Schema.Types.ObjectId,
        ref: "faturas",
        require: true
    },
    diarias: {
        type: Number,
        required: true
    },
    data_saida: {
        type: Date,
        required: true
    },
    data_entrada: {
        type: Date,
        default: Date.now
    },
    ativa: {
        type: Boolean,
        default: true
    }
})

mongoose.model("estadias", Estadia)